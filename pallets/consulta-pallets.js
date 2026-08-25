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
  var retryRequested = false;

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

  function activeFarm() {
    var context = readJson(contextKey, {});
    var workflow = readJson(workflowKey, {});
    return {
      code: contextFarmCodes[context.id] || workflow.farmCode || "0527",
      name: context.name || workflow.farmName || "Finca Santa Isabel"
    };
  }

  function isoWeek(date) {
    var current = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    var day = current.getUTCDay() || 7;
    current.setUTCDate(current.getUTCDate() + 4 - day);
    var yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
    var week = Math.ceil((((current - yearStart) / 86400000) + 1) / 7);
    return current.getUTCFullYear() + "-W" + String(week).padStart(2, "0");
  }

  function weekAtOffset(offset) {
    var date = new Date();
    date.setDate(date.getDate() + offset * 7);
    return isoWeek(date);
  }

  function populateWeeks() {
    var options = [
      { value: weekAtOffset(0), label: "Semana actual · " + weekAtOffset(0) },
      { value: weekAtOffset(-1), label: "Semana anterior · " + weekAtOffset(-1) },
      { value: weekAtOffset(-2), label: "Hace 2 semanas · " + weekAtOffset(-2) },
      { value: "all", label: "Todas las semanas" }
    ];
    $("[data-pallet-week]").innerHTML = options.map(function (option) {
      return '<option value="' + option.value + '">' + option.label + "</option>";
    }).join("");
  }

  function addDays(date, amount) {
    return new Date(date.getTime() + amount * 86400000);
  }

  function samplePallets() {
    var farm = activeFarm();
    var today = new Date();
    return [
      {
        sscc: "177012345678900073",
        farmCode: farm.code,
        farmName: farm.name,
        week: weekAtOffset(0),
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
        week: weekAtOffset(0),
        references: [
          { reference: "BAN-REF-004", referenceName: "Cluster 208", boxes: 54 },
          { reference: "BAN-REF-019", referenceName: "EPS Puerto", boxes: 48 }
        ],
        boxes: 102,
        startTime: "14:10",
        endTime: "14:42",
        user: "operador.sial",
        observations: "",
        createdAt: addDays(today, -1).toISOString(),
        status: "CARGADO"
      },
      {
        sscc: "177012345678900059",
        farmCode: farm.code,
        farmName: farm.name,
        week: weekAtOffset(0),
        references: [
          { reference: "BAN-REF-022", referenceName: "Orgánico 18KG", boxes: 66 }
        ],
        boxes: 66,
        startTime: "09:05",
        endTime: "09:28",
        user: "supervisor.finca",
        observations: "Validado para cargue.",
        createdAt: addDays(today, -2).toISOString(),
        status: "LISTO_PARA_CARGUE"
      },
      {
        sscc: "177012345678900042",
        farmCode: farm.code,
        farmName: farm.name,
        week: weekAtOffset(-1),
        references: [
          { reference: "BAN-REF-002", referenceName: "Premium 20XU", boxes: 48 }
        ],
        boxes: 48,
        startTime: "11:20",
        endTime: "11:39",
        user: "operador.sial",
        observations: "Registro histórico.",
        createdAt: addDays(today, -8).toISOString(),
        status: "CARGADO"
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
    return unique.length ? unique : samplePallets();
  }

  function normalizeSscc(value) {
    if (window.SialMobileUI && typeof window.SialMobileUI.normalizeSscc === "function") {
      return window.SialMobileUI.normalizeSscc(value);
    }
    var digits = String(value || "").replace(/\D/g, "");
    return digits.length === 20 && digits.slice(0, 2) === "00" ? digits.slice(2) : digits;
  }

  function statusMeta(status) {
    if (status === "ANULADO") return { label: "Anulado", className: "error" };
    if (status === "CARGADO") return { label: "Cargado", className: "info" };
    return { label: "Listo para cargue", className: "success" };
  }

  function timestamp(item) {
    var parsed = new Date(item.createdAt || item.startedAt || "");
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

  function duration(item) {
    if (!item.startTime || !item.endTime) return "--";
    var start = item.startTime.split(":").map(Number);
    var end = item.endTime.split(":").map(Number);
    var minutes = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
    if (minutes < 0) minutes += 1440;
    return minutes + " min";
  }

  function totalBoxes(item) {
    if (Number(item.boxes) >= 0) return Number(item.boxes);
    return (item.references || []).reduce(function (total, reference) {
      return total + Number(reference.boxes || 0);
    }, 0);
  }

  function matchesFilters(item) {
    var query = $("[data-pallet-search]").value.trim().toLowerCase();
    var week = $("[data-pallet-week]").value;
    var status = $("[data-pallet-status]").value;
    var farm = activeFarm();
    var searchable = [item.sscc, item.farmCode, item.farmName]
      .concat((item.references || []).reduce(function (values, reference) {
        return values.concat(reference.reference, reference.referenceName);
      }, []))
      .join(" ")
      .toLowerCase();

    return (!item.farmCode || item.farmCode === farm.code) &&
      (!query || searchable.indexOf(query) >= 0) &&
      (week === "all" || item.week === week) &&
      (status === "all" || item.status === status);
  }

  function cardTemplate(item) {
    var status = statusMeta(item.status);
    var references = Array.isArray(item.references) ? item.references.length : 0;
    return [
      '<button class="sial-query-item" type="button" data-pallet-id="' + escapeHtml(item.sscc) + '" aria-label="Ver pallet ' + escapeHtml(item.sscc) + '">',
      '<span class="sial-query-item-icon" aria-hidden="true"><svg class="sial-icon" viewBox="0 0 24 24"><path d="M4 7h16v10H4z"/><path d="M8 7V5h8v2"/><path d="M8 17v2"/><path d="M16 17v2"/></svg></span>',
      '<span class="sial-query-item-body">',
      '<span class="sial-query-item-title"><strong>' + escapeHtml(item.sscc) + '</strong><span class="sial-pill ' + status.className + '">' + status.label + '</span></span>',
      '<span class="sial-query-item-meta"><span><strong>' + references + '</strong> referencia(s)</span><span><strong>' + totalBoxes(item) + '</strong> cajas</span></span>',
      '<span class="sial-query-item-foot"><span>' + escapeHtml(formatDate(item)) + '</span><span>' + escapeHtml(item.startTime || "--") + " – " + escapeHtml(item.endTime || "--") + '</span></span>',
      '</span>',
      '<svg class="sial-icon sial-query-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
      '</button>'
    ].join("");
  }

  function setViewState(state) {
    $("[data-pallet-loading]").hidden = state !== "loading";
    $("[data-pallet-list]").hidden = state !== "results";
    $("[data-pallet-empty]").hidden = state !== "empty";
    $("[data-pallet-error]").hidden = state !== "error";
  }

  function render() {
    var filtered = pallets.filter(matchesFilters).sort(function (a, b) {
      return timestamp(b) - timestamp(a);
    });
    var queryActive = Boolean(
      $("[data-pallet-search]").value.trim() ||
      $("[data-pallet-week]").value !== weekAtOffset(0) ||
      $("[data-pallet-status]").value !== "all"
    );
    var boxes = filtered.reduce(function (total, item) { return total + totalBoxes(item); }, 0);
    var list = $("[data-pallet-list]");

    $("[data-pallet-summary]").textContent = filtered.length + (filtered.length === 1 ? " pallet" : " pallets") + " · " + boxes + " cajas";
    $("[data-pallet-clear]").hidden = !queryActive;
    list.innerHTML = filtered.map(cardTemplate).join("");

    if (filtered.length) {
      setViewState("results");
      return;
    }

    var hasSearch = Boolean($("[data-pallet-search]").value.trim());
    $("[data-pallet-empty-title]").textContent = hasSearch ? "Sin coincidencias" : "No hay pallets creados";
    $("[data-pallet-empty-copy]").textContent = hasSearch
      ? "No encontramos pallets que coincidan con el SSCC o referencia ingresados."
      : "No existen pallets para la finca, semana y estado seleccionados.";
    setViewState("empty");
  }

  function referenceRows(item) {
    if (!Array.isArray(item.references) || !item.references.length) {
      return '<p class="sial-query-detail-note">No hay referencias registradas.</p>';
    }
    return item.references.map(function (reference) {
      return [
        '<div class="pallet-reference-row">',
        '<div><strong>' + escapeHtml(reference.reference || "--") + '</strong><span>' + escapeHtml(reference.referenceName || "Referencia") + '</span></div>',
        '<strong>' + Number(reference.boxes || 0) + ' cajas</strong>',
        '</div>'
      ].join("");
    }).join("");
  }

  function detailContent(item) {
    var status = statusMeta(item.status);
    var content = document.createElement("div");
    content.className = "sial-query-detail";
    content.innerHTML = [
      '<section class="sial-query-detail-identity">',
      '<div class="sial-query-detail-identity-head"><div><span>SSCC</span><strong>' + escapeHtml(item.sscc) + '</strong></div><span class="sial-pill ' + status.className + '">' + status.label + '</span></div>',
      '<div class="sial-query-detail-grid">',
      '<div class="sial-query-detail-field"><span>FINCA</span><strong>' + escapeHtml((item.farmCode || "--") + " · " + (item.farmName || "--")) + '</strong></div>',
      '<div class="sial-query-detail-field"><span>SEMANA</span><strong>' + escapeHtml(item.week || "--") + '</strong></div>',
      '<div class="sial-query-detail-field"><span>TOTAL CAJAS</span><strong>' + totalBoxes(item) + ' cajas</strong></div>',
      '<div class="sial-query-detail-field"><span>DURACIÓN</span><strong>' + escapeHtml(duration(item)) + '</strong></div>',
      '</div></section>',
      '<section class="sial-query-detail-section"><h3>Referencias</h3><div class="pallet-reference-list">' + referenceRows(item) + '</div></section>',
      '<section class="sial-query-detail-section"><h3>Información operativa</h3>',
      '<div class="sial-list-row"><strong>Fecha de creación</strong><span>' + escapeHtml(formatDate(item)) + '</span></div>',
      '<div class="sial-list-row"><strong>Horario</strong><span>' + escapeHtml(item.startTime || "--") + " – " + escapeHtml(item.endTime || "--") + '</span></div>',
      '<div class="sial-list-row"><strong>Creado por</strong><span>' + escapeHtml(item.user || "--") + '</span></div>',
      '</section>',
      item.observations ? '<section class="sial-query-detail-section"><h3>Observaciones</h3><p class="sial-query-detail-note">' + escapeHtml(item.observations) + '</p></section>' : "",
      '<button class="sial-btn sial-btn-secondary pallet-copy-sscc" type="button" data-copy-sscc="' + escapeHtml(item.sscc) + '"><svg class="sial-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>Copiar SSCC</button>'
    ].join("");

    content.addEventListener("click", function (event) {
      var button = event.target.closest("[data-copy-sscc]");
      if (!button) return;
      var value = button.dataset.copySscc;
      var completed = function () {
        window.SialMobileUI.showToast({ type: "success", title: "SSCC copiado", message: value });
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
      id: "pallet-query-detail",
      title: "Detalle del pallet",
      variant: "sheet",
      content: detailContent(item),
      actions: [{ label: "Cerrar", variant: "primary" }]
    });
  }

  function scan() {
    if (!window.SialMobileUI || typeof window.SialMobileUI.openBarcodeScanner !== "function") return;
    var first = pallets.find(matchesFilters) || pallets[0];
    window.SialMobileUI.openBarcodeScanner({
      title: "Escanear SSCC",
      eyebrow: "Consulta de pallet",
      normalize: normalizeSscc,
      validate: function (value) {
        var sscc = normalizeSscc(value);
        var found = pallets.some(function (item) { return item.sscc === sscc; });
        return { ok: found, message: found ? "Pallet encontrado." : "No encontramos un pallet con este SSCC." };
      },
      onDetected: function (value) {
        var sscc = normalizeSscc(value);
        $("[data-pallet-search]").value = sscc;
        $("[data-pallet-week]").value = "all";
        $("[data-pallet-status]").value = "all";
        render();
        openDetail(sscc);
      }
    });
  }

  function clearFilters() {
    $("[data-pallet-search]").value = "";
    $("[data-pallet-week]").value = weekAtOffset(0);
    $("[data-pallet-status]").value = "all";
    render();
    $("[data-pallet-search]").focus();
  }

  function load() {
    setViewState("loading");
    $("[data-pallet-summary]").textContent = "Consultando pallets…";
    window.setTimeout(function () {
      var requestedState = new URLSearchParams(window.location.search).get("state");
      if (requestedState === "error" && !retryRequested) {
        $("[data-pallet-summary]").textContent = "Consulta no disponible";
        setViewState("error");
        return;
      }
      pallets = requestedState === "empty" ? [] : readPallets();
      render();
    }, 320);
  }

  function init() {
    var farm = activeFarm();
    populateWeeks();
    $("[data-pallet-context-farm]").textContent = farm.code + " · " + farm.name;

    $("[data-pallet-search]").addEventListener("input", render);
    $("[data-pallet-week]").addEventListener("change", render);
    $("[data-pallet-status]").addEventListener("change", render);
    $("[data-pallet-scan]").addEventListener("click", scan);
    $("[data-pallet-clear]").addEventListener("click", clearFilters);
    $("[data-pallet-retry]").addEventListener("click", function () {
      retryRequested = true;
      load();
    });
    $("[data-pallet-list]").addEventListener("click", function (event) {
      var card = event.target.closest("[data-pallet-id]");
      if (card) openDetail(card.dataset.palletId);
    });
    load();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
