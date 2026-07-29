(function () {
  "use strict";

  var pageKey = "sial-mobile-hu591";
  var workflowKey = "sial-mobile-workflow";
  var contextKey = "sial-mobile-context";
  var contextFarmCodes = {
    "finca-santa-isabel": "0527",
    "finca-la-esperanza": "0412",
    "unidad-operativa-puerto": "0435"
  };
  var pallets = [];

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || "") || fallback;
    } catch (_) {
      return fallback;
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeSscc(value) {
    if (window.SialMobileUI && typeof window.SialMobileUI.normalizeSscc === "function") {
      return window.SialMobileUI.normalizeSscc(value);
    }
    var digits = String(value || "").replace(/\D/g, "");
    return digits.length === 20 && digits.slice(0, 2) === "00" ? digits.slice(2) : digits;
  }

  function isoWeek(date) {
    var current = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    var day = current.getUTCDay() || 7;
    current.setUTCDate(current.getUTCDate() + 4 - day);
    var yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
    var week = Math.ceil((((current - yearStart) / 86400000) + 1) / 7);
    return current.getUTCFullYear() + "-W" + String(week).padStart(2, "0");
  }

  function activeFarm() {
    var context = readJson(contextKey, {});
    var workflow = readJson(workflowKey, {});
    return {
      code: contextFarmCodes[context.id] || workflow.farmCode || "0527",
      name: context.name || workflow.farmName || "Finca Santa Isabel"
    };
  }

  function demoPallets() {
    var farm = activeFarm();
    var week = isoWeek(new Date());
    var today = new Date();
    var previous = new Date(today.getTime() - 86400000);
    var older = new Date(today.getTime() - 172800000);
    return [
      {
        sscc: "177012345678900073",
        farmCode: farm.code,
        farmName: farm.name,
        week: week,
        references: [
          { reference: "BAN-REF-001", referenceName: "Premium 22XU", boxes: 48 },
          { reference: "BAN-REF-011", referenceName: "Export 40LB", boxes: 48 },
          { reference: "BAN-REF-014", referenceName: "IFCO Mixto", boxes: 66 },
          { reference: "BAN-REF-018", referenceName: "Baby Banana", boxes: 54 }
        ],
        boxes: 216,
        startTime: "07:35",
        endTime: "08:12",
        user: "operador.sial",
        observations: "Pallet armado sin novedades.",
        createdAt: today.toISOString(),
        status: "LISTO_PARA_CARGUE"
      },
      {
        sscc: "177012345678900066",
        farmCode: farm.code,
        farmName: farm.name,
        week: week,
        references: [
          { reference: "BAN-REF-004", referenceName: "Cluster 208", boxes: 54 },
          { reference: "BAN-REF-019", referenceName: "EPS Puerto", boxes: 48 }
        ],
        boxes: 102,
        startTime: "14:10",
        endTime: "14:42",
        user: "operador.sial",
        observations: "",
        createdAt: previous.toISOString(),
        status: "LISTO_PARA_CARGUE"
      },
      {
        sscc: "177012345678900059",
        farmCode: farm.code,
        farmName: farm.name,
        week: week,
        references: [
          { reference: "BAN-REF-022", referenceName: "Orgánico 18KG", boxes: 66 }
        ],
        boxes: 66,
        startTime: "09:05",
        endTime: "09:28",
        user: "operador.sial",
        observations: "Validado para cargue.",
        createdAt: older.toISOString(),
        status: "LISTO_PARA_CARGUE"
      }
    ];
  }

  function readPallets() {
    var page = readJson(pageKey, {});
    var workflow = readJson(workflowKey, {});
    var combined = [].concat(
      Array.isArray(page.readyPallets) ? page.readyPallets : [],
      Array.isArray(workflow.readyPallets) ? workflow.readyPallets : []
    );
    var unique = [];
    var seen = new Set();
    combined.forEach(function (item) {
      if (!item || !item.sscc || seen.has(item.sscc)) return;
      seen.add(item.sscc);
      unique.push(item);
    });
    return unique.length ? unique : demoPallets();
  }

  function statusMeta(status) {
    if (status === "ANULADO") return { label: "Anulado", className: "error" };
    if (status === "CARGADO") return { label: "Cargado", className: "info" };
    return { label: "Listo para cargue", className: "success" };
  }

  function timestamp(item) {
    var value = item.createdAt || item.startedAt || "";
    var parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
  }

  function formatDate(item) {
    var date = timestamp(item);
    if (!date.getTime()) return "Fecha no disponible";
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(date);
  }

  function dateValue(item) {
    var date = timestamp(item);
    if (!date.getTime()) return "";
    var local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function duration(item) {
    if (!item.startTime || !item.endTime) return "--";
    var start = item.startTime.split(":").map(Number);
    var end = item.endTime.split(":").map(Number);
    var minutes = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
    if (minutes < 0) minutes += 1440;
    return minutes + " min";
  }

  function referenceCount(item) {
    return Array.isArray(item.references) ? item.references.length : 0;
  }

  function totalBoxes(item) {
    if (Number(item.boxes) >= 0) return Number(item.boxes);
    return (item.references || []).reduce(function (total, reference) {
      return total + Number(reference.boxes || 0);
    }, 0);
  }

  function matchesFilters(item) {
    var query = $("[data-consulta-search]").value.trim().toLowerCase();
    var week = $("[data-consulta-week]").value;
    var selectedDate = $("[data-consulta-date]").value;
    var farm = activeFarm();
    var searchable = [
      item.sscc,
      item.farmCode,
      item.farmName
    ].concat((item.references || []).reduce(function (values, reference) {
      return values.concat(reference.reference, reference.referenceName);
    }, [])).join(" ").toLowerCase();

    if (item.farmCode && item.farmCode !== farm.code) return false;
    if (query && searchable.indexOf(query) < 0) return false;
    if (week === "current" && item.week && item.week !== isoWeek(new Date())) return false;
    if (selectedDate && dateValue(item) !== selectedDate) return false;
    return true;
  }

  function cardTemplate(item) {
    var status = statusMeta(item.status);
    var references = referenceCount(item);
    return [
      '<button class="consulta-pallet-card" type="button" data-consulta-pallet="' + escapeHtml(item.sscc) + '" aria-label="Ver pallet ' + escapeHtml(item.sscc) + '">',
      '<span class="consulta-pallet-card-head">',
      '<span class="consulta-pallet-card-code"><span>SSCC</span><strong>' + escapeHtml(item.sscc) + '</strong></span>',
      '<span class="sial-pill ' + status.className + '">' + status.label + '</span>',
      '</span>',
      '<span class="consulta-pallet-card-stats">',
      '<span class="consulta-pallet-card-stat"><span>Referencias</span><strong>' + references + '</strong></span>',
      '<span class="consulta-pallet-card-stat"><span>Total cajas</span><strong>' + totalBoxes(item) + '</strong></span>',
      '</span>',
      '<span class="consulta-pallet-card-foot">',
      '<span>' + escapeHtml(formatDate(item)) + ' · ' + escapeHtml(item.startTime || "--") + ' – ' + escapeHtml(item.endTime || "--") + '</span>',
      '<svg class="sial-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
      '</span>',
      '</button>'
    ].join("");
  }

  function render() {
    var filtered = pallets.filter(matchesFilters).sort(function (a, b) {
      return timestamp(b) - timestamp(a);
    });
    var list = $("[data-consulta-list]");
    var empty = $("[data-consulta-empty]");
    var queryActive = Boolean($("[data-consulta-search]").value.trim() || $("[data-consulta-date]").value || $("[data-consulta-week]").value === "all");
    var boxes = filtered.reduce(function (total, item) { return total + totalBoxes(item); }, 0);
    var label = filtered.length === 1 ? "pallet" : "pallets";

    $("[data-consulta-summary]").textContent = filtered.length + " " + label + " · " + boxes + " cajas";
    $("[data-consulta-clear]").hidden = !queryActive;
    list.innerHTML = filtered.map(cardTemplate).join("");
    list.hidden = filtered.length === 0;
    empty.hidden = filtered.length > 0;

    if (!filtered.length) {
      var hasSearch = Boolean($("[data-consulta-search]").value.trim() || $("[data-consulta-date]").value);
      $("[data-consulta-empty-title]").textContent = hasSearch ? "Sin resultados" : "No hay pallets armados";
      $("[data-consulta-empty-copy]").textContent = hasSearch
        ? "No encontramos pallets que coincidan con los criterios de búsqueda."
        : "No se encontraron pallets para la finca y el periodo seleccionados.";
    }
  }

  function referenceRows(item) {
    if (!Array.isArray(item.references) || !item.references.length) {
      return "<p>No hay referencias registradas.</p>";
    }
    return item.references.map(function (reference) {
      return [
        '<div class="hu591-label-reference-row">',
        '<div><strong>' + escapeHtml(reference.reference || "--") + '</strong>',
        '<span>' + escapeHtml(reference.referenceName || "Referencia") + '</span></div>',
        '<strong>' + Number(reference.boxes || 0) + ' cajas</strong>',
        '</div>'
      ].join("");
    }).join("");
  }

  function detailContent(item) {
    var content = document.createElement("div");
    var status = statusMeta(item.status);
    content.className = "consulta-detail";
    content.innerHTML = [
      '<section class="hu591-label-preview consulta-detail-label" aria-label="Etiqueta del pallet">',
      '<div class="hu591-label-head"><span>Etiqueta pallet</span><strong>' + escapeHtml(item.sscc) + '</strong></div>',
      '<dl>',
      '<div><dt>Finca</dt><dd>' + escapeHtml((item.farmCode || "--") + " · " + (item.farmName || "--")) + '</dd></div>',
      '<div><dt>Semana actual</dt><dd>' + escapeHtml(item.week || "--") + '</dd></div>',
      '<div><dt>Total cajas</dt><dd>' + totalBoxes(item) + ' cajas</dd></div>',
      '<div><dt>Estado</dt><dd>' + status.label + '</dd></div>',
      '</dl>',
      '<div class="hu591-label-references"><span>Referencias</span><div>' + referenceRows(item) + '</div></div>',
      '</section>',
      '<button class="sial-btn sial-btn-secondary consulta-copy-sscc" type="button" data-consulta-copy="' + escapeHtml(item.sscc) + '">',
      '<svg class="sial-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>',
      'Copiar SSCC</button>',
      '<section class="consulta-detail-meta" aria-label="Información operativa">',
      '<div class="sial-list-row"><strong>Fecha de creación</strong><span>' + escapeHtml(formatDate(item)) + '</span></div>',
      '<div class="sial-list-row"><strong>Hora de inicio</strong><span>' + escapeHtml(item.startTime || "--") + '</span></div>',
      '<div class="sial-list-row"><strong>Hora de finalización</strong><span>' + escapeHtml(item.endTime || "--") + '</span></div>',
      '<div class="sial-list-row"><strong>Duración</strong><span>' + escapeHtml(duration(item)) + '</span></div>',
      '<div class="sial-list-row"><strong>Creado por</strong><span>' + escapeHtml(item.user || "--") + '</span></div>',
      '</section>',
      item.observations ? '<section class="consulta-detail-observations"><strong>Observaciones</strong><p>' + escapeHtml(item.observations) + '</p></section>' : "",
      '</div>'
    ].join("");
    content.addEventListener("click", function (event) {
      var copy = event.target.closest("[data-consulta-copy]");
      if (!copy) return;
      var value = copy.dataset.consultaCopy;
      var completed = function () {
        if (window.SialMobileUI) {
          window.SialMobileUI.showToast({ type: "success", title: "SSCC copiado", message: value });
        }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(completed).catch(completed);
      } else {
        completed();
      }
    });
    return content;
  }

  function openDetail(sscc) {
    var item = pallets.find(function (candidate) { return candidate.sscc === sscc; });
    if (!item || !window.SialMobileUI) return;
    window.SialMobileUI.openDialog({
      id: "consulta-pallet-detail",
      title: "Detalle del pallet",
      variant: "sheet",
      content: detailContent(item),
      actions: [{ label: "Cerrar", variant: "primary" }]
    });
  }

  function scan() {
    if (!window.SialMobileUI || typeof window.SialMobileUI.openBarcodeScanner !== "function") return;
    window.SialMobileUI.openBarcodeScanner({
      title: "Escanear SSCC",
      eyebrow: "Consulta de pallet",
      normalize: normalizeSscc,
      validate: function (value) {
        var sscc = normalizeSscc(value);
        var found = pallets.some(function (item) { return item.sscc === sscc; });
        return {
          ok: found,
          message: found ? "Pallet encontrado." : "No encontramos un pallet con este SSCC."
        };
      },
      onDetected: function (value) {
        var sscc = normalizeSscc(value);
        $("[data-consulta-search]").value = sscc;
        render();
        openDetail(sscc);
      }
    });
  }

  function clearFilters() {
    $("[data-consulta-search]").value = "";
    $("[data-consulta-week]").value = "current";
    $("[data-consulta-date]").value = "";
    render();
    $("[data-consulta-search]").focus();
  }

  function init() {
    var farm = activeFarm();
    var week = isoWeek(new Date());
    pallets = readPallets();
    $("[data-consulta-context-farm]").textContent = farm.code + " · " + farm.name;
    $("[data-consulta-context-week]").textContent = week;

    $("[data-consulta-search]").addEventListener("input", render);
    $("[data-consulta-week]").addEventListener("change", render);
    $("[data-consulta-date]").addEventListener("change", render);
    $("[data-consulta-scan]").addEventListener("click", scan);
    $("[data-consulta-clear]").addEventListener("click", clearFilters);
    $("[data-consulta-list]").addEventListener("click", function (event) {
      var card = event.target.closest("[data-consulta-pallet]");
      if (card) openDetail(card.dataset.consultaPallet);
    });
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
