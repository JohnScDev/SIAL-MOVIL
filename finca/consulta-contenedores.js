(function () {
  "use strict";

  var contextKey = "sial-mobile-context";
  var workflowKey = "sial-mobile-workflow";
  var scheduleKey = "sial-mobile-container-schedules";
  var contextFarmCodes = {
    "finca-santa-isabel": "0527",
    "finca-la-esperanza": "0412",
    "unidad-operativa-puerto": "0435"
  };
  var containers = [];
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
      { value: weekAtOffset(1), label: "Próxima semana · " + weekAtOffset(1) },
      { value: weekAtOffset(-1), label: "Semana anterior · " + weekAtOffset(-1) },
      { value: "all", label: "Todas las semanas" }
    ];
    $("[data-container-week]").innerHTML = options.map(function (option) {
      return '<option value="' + option.value + '">' + option.label + "</option>";
    }).join("");
  }

  function addDays(date, amount) {
    return new Date(date.getTime() + amount * 86400000);
  }

  function demoContainers() {
    var farm = activeFarm();
    var now = new Date();
    return [
      {
        id: "PCO-2026-031",
        container: "SIALU1234567",
        type: "40RF",
        farmCode: farm.code,
        farmName: farm.name,
        week: weekAtOffset(0),
        stage: "EN INSPECCIÓN",
        status: "VIGENTE",
        process: "CP-003",
        operation: "OP-FIN-2026-418",
        updatedAt: now.toISOString(),
        observation: "Inspección interna en curso.",
        audit: "Programado por supervisor.puerto · 03 ago 2026 · 06:40"
      },
      {
        id: "PCO-2026-032",
        container: "MSCU1234567",
        type: "40RF",
        farmCode: farm.code,
        farmName: farm.name,
        week: weekAtOffset(0),
        stage: "EN CARGUE",
        status: "VIGENTE",
        process: "CP-001",
        operation: "OP-FIN-2026-421",
        updatedAt: addDays(now, -1).toISOString(),
        observation: "Contenedor habilitado para asociación de pallets.",
        audit: "Actualizado por operador.sial · 02 ago 2026 · 14:18"
      },
      {
        id: "PCO-2026-033",
        container: "TCLU7654321",
        type: "20RF",
        farmCode: farm.code,
        farmName: farm.name,
        week: weekAtOffset(0),
        stage: "RECIBIDO EN FINCA",
        status: "VIGENTE",
        process: "CP-002",
        operation: "OP-FIN-2026-423",
        updatedAt: addDays(now, -2).toISOString(),
        observation: "Pendiente de iniciar inspección externa.",
        audit: "Recepción confirmada por porteria.finca · 01 ago 2026 · 09:05"
      },
      {
        id: "PCO-2026-034",
        container: "BANU4567890",
        type: "40HC",
        farmCode: farm.code,
        farmName: farm.name,
        week: weekAtOffset(1),
        stage: "PROGRAMADO",
        status: "PROGRAMADO",
        process: "CP-004",
        operation: "OP-FIN-2026-430",
        updatedAt: now.toISOString(),
        observation: "Programación futura para recepción en finca.",
        audit: "Programado por admin.puerto · 03 ago 2026 · 08:30"
      },
      {
        id: "PCO-2026-028",
        container: "TLLU3344556",
        type: "40RF",
        farmCode: farm.code,
        farmName: farm.name,
        week: weekAtOffset(-1),
        stage: "CERRADO",
        status: "FINALIZADO",
        process: "CP-007",
        operation: "OP-FIN-2026-397",
        updatedAt: addDays(now, -8).toISOString(),
        observation: "Operación finalizada y disponible para consulta histórica.",
        audit: "Cierre confirmado por supervisor.finca · 26 jul 2026 · 17:45"
      }
    ];
  }

  function readContainers() {
    var stored = readJson(scheduleKey, []);
    return Array.isArray(stored) && stored.length ? stored : demoContainers();
  }

  function normalizeContainer(value) {
    return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
  }

  function statusMeta(status) {
    if (status === "FINALIZADO") return { label: "Finalizado", className: "info" };
    if (status === "PROGRAMADO") return { label: "Programado", className: "warning" };
    return { label: "Vigente", className: "success" };
  }

  function formatDate(value) {
    var date = new Date(value || "");
    if (Number.isNaN(date.getTime())) return "Sin actualización";
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function matchesFilters(item) {
    var query = $("[data-container-search]").value.trim().toLowerCase();
    var week = $("[data-container-week]").value;
    var status = $("[data-container-status]").value;
    var farm = activeFarm();
    var searchable = [item.container, item.id, item.type, item.stage, item.process, item.operation].join(" ").toLowerCase();

    return (!item.farmCode || item.farmCode === farm.code) &&
      (!query || searchable.indexOf(query) >= 0) &&
      (week === "all" || item.week === week) &&
      (status === "all" || item.status === status);
  }

  function cardTemplate(item) {
    var status = statusMeta(item.status);
    return [
      '<button class="sial-query-item" type="button" data-container-id="' + escapeHtml(item.id) + '" aria-label="Ver contenedor ' + escapeHtml(item.container) + '">',
      '<span class="sial-query-item-icon" aria-hidden="true"><svg class="sial-icon" viewBox="0 0 24 24"><path d="M4 7h16v10H4z"/><path d="M8 11h8"/><path d="M8 14h5"/></svg></span>',
      '<span class="sial-query-item-body">',
      '<span class="sial-query-item-title"><strong>' + escapeHtml(item.container) + '</strong><span class="sial-pill ' + status.className + '">' + status.label + '</span></span>',
      '<span class="sial-query-item-meta"><span><strong>' + escapeHtml(item.type) + '</strong></span><span>' + escapeHtml(item.id) + '</span><span>' + escapeHtml(item.week) + '</span></span>',
      '<span class="sial-query-item-stage"><svg class="sial-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>' + escapeHtml(item.stage) + '</span>',
      '<span class="sial-query-item-foot"><span>Actualizado ' + escapeHtml(formatDate(item.updatedAt)) + '</span></span>',
      '</span>',
      '<svg class="sial-icon sial-query-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
      '</button>'
    ].join("");
  }

  function setViewState(state) {
    $("[data-container-loading]").hidden = state !== "loading";
    $("[data-container-list]").hidden = state !== "results";
    $("[data-container-empty]").hidden = state !== "empty";
    $("[data-container-error]").hidden = state !== "error";
  }

  function render() {
    var filtered = containers.filter(matchesFilters).sort(function (a, b) {
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });
    var queryActive = Boolean(
      $("[data-container-search]").value.trim() ||
      $("[data-container-week]").value !== weekAtOffset(0) ||
      $("[data-container-status]").value !== "all"
    );
    var list = $("[data-container-list]");

    $("[data-container-summary]").textContent = filtered.length + (filtered.length === 1 ? " contenedor" : " contenedores") + " · " + $("[data-container-week]").selectedOptions[0].textContent;
    $("[data-container-clear]").hidden = !queryActive;
    list.innerHTML = filtered.map(cardTemplate).join("");

    if (filtered.length) {
      setViewState("results");
      return;
    }

    var hasSearch = Boolean($("[data-container-search]").value.trim());
    $("[data-container-empty-title]").textContent = hasSearch ? "Sin coincidencias" : "No hay contenedores asociados";
    $("[data-container-empty-copy]").textContent = hasSearch
      ? "No encontramos contenedores que coincidan con el número o programación ingresados."
      : "No existen programaciones para la finca, semana y estado seleccionados.";
    setViewState("empty");
  }

  function stageRows(item) {
    var stages = ["PROGRAMADO", "RECIBIDO EN FINCA", "EN INSPECCIÓN", "EN CARGUE", "CERRADO"];
    var currentIndex = stages.indexOf(item.stage);
    if (currentIndex < 0) currentIndex = 0;
    return stages.map(function (stage, index) {
      var state = index < currentIndex ? "is-complete" : index === currentIndex ? "is-current" : "";
      var label = index < currentIndex ? "Completado" : index === currentIndex ? "Etapa actual" : "Pendiente";
      return '<div class="container-stage-step ' + state + '"><strong>' + stage + '</strong><span>' + label + '</span></div>';
    }).join("");
  }

  function detailContent(item) {
    var status = statusMeta(item.status);
    var content = document.createElement("div");
    content.className = "sial-query-detail";
    content.innerHTML = [
      '<section class="sial-query-detail-identity">',
      '<div class="sial-query-detail-identity-head"><div><span>CONTENEDOR</span><strong>' + escapeHtml(item.container) + '</strong></div><span class="sial-pill ' + status.className + '">' + status.label + '</span></div>',
      '<div class="sial-query-detail-grid">',
      '<div class="sial-query-detail-field"><span>TIPO</span><strong>' + escapeHtml(item.type) + '</strong></div>',
      '<div class="sial-query-detail-field"><span>SEMANA</span><strong>' + escapeHtml(item.week) + '</strong></div>',
      '<div class="sial-query-detail-field"><span>PROGRAMACIÓN</span><strong>' + escapeHtml(item.id) + '</strong></div>',
      '<div class="sial-query-detail-field"><span>PROCESO</span><strong>' + escapeHtml(item.process) + '</strong></div>',
      '<div class="sial-query-detail-field"><span>FINCA</span><strong>' + escapeHtml((item.farmCode || "--") + " · " + (item.farmName || "--")) + '</strong></div>',
      '<div class="sial-query-detail-field"><span>OPERACIÓN</span><strong>' + escapeHtml(item.operation || "--") + '</strong></div>',
      '</div></section>',
      '<section class="sial-query-detail-section"><h3>Recorrido operativo</h3><div class="container-stage-track">' + stageRows(item) + '</div></section>',
      '<section class="sial-query-detail-section"><h3>Auditoría</h3>',
      '<div class="sial-list-row"><strong>Última actualización</strong><span>' + escapeHtml(formatDate(item.updatedAt)) + '</span></div>',
      '<p class="sial-query-detail-note">' + escapeHtml(item.audit || "Auditoría no disponible.") + '</p>',
      '</section>',
      item.observation ? '<section class="sial-query-detail-section"><h3>Observaciones</h3><p class="sial-query-detail-note">' + escapeHtml(item.observation) + '</p></section>' : ""
    ].join("");
    return content;
  }

  function openDetail(id) {
    var item = containers.find(function (candidate) { return candidate.id === id; });
    if (!item || !window.SialMobileUI) return;
    window.SialMobileUI.openDialog({
      id: "container-farm-query-detail",
      title: "Detalle del contenedor",
      variant: "sheet",
      content: detailContent(item),
      actions: [{ label: "Cerrar", variant: "primary" }]
    });
  }

  function scan() {
    if (!window.SialMobileUI || typeof window.SialMobileUI.openBarcodeScanner !== "function") return;
    var first = containers.find(matchesFilters) || containers[0];
    window.SialMobileUI.openBarcodeScanner({
      title: "Escanear contenedor",
      eyebrow: "Consulta por finca",
      demoValue: first ? first.container : "SIALU1234567",
      demoLabel: "Leer contenedor demo",
      normalize: normalizeContainer,
      validate: function (value) {
        var code = normalizeContainer(value);
        var found = containers.some(function (item) { return item.container === code; });
        return { ok: found, message: found ? "Contenedor encontrado." : "No encontramos este contenedor en la finca." };
      },
      onDetected: function (value) {
        var code = normalizeContainer(value);
        var item = containers.find(function (candidate) { return candidate.container === code; });
        $("[data-container-search]").value = code;
        $("[data-container-week]").value = "all";
        $("[data-container-status]").value = "all";
        render();
        if (item) openDetail(item.id);
      }
    });
  }

  function clearFilters() {
    $("[data-container-search]").value = "";
    $("[data-container-week]").value = weekAtOffset(0);
    $("[data-container-status]").value = "all";
    render();
    $("[data-container-search]").focus();
  }

  function load() {
    setViewState("loading");
    $("[data-container-summary]").textContent = "Consultando contenedores…";
    window.setTimeout(function () {
      var requestedState = new URLSearchParams(window.location.search).get("state");
      if (requestedState === "error" && !retryRequested) {
        $("[data-container-summary]").textContent = "Consulta no disponible";
        setViewState("error");
        return;
      }
      containers = requestedState === "empty" ? [] : readContainers();
      render();
    }, 320);
  }

  function init() {
    var farm = activeFarm();
    populateWeeks();
    $("[data-container-context-farm]").textContent = farm.code + " · " + farm.name;

    $("[data-container-search]").addEventListener("input", render);
    $("[data-container-week]").addEventListener("change", render);
    $("[data-container-status]").addEventListener("change", render);
    $("[data-container-scan]").addEventListener("click", scan);
    $("[data-container-clear]").addEventListener("click", clearFilters);
    $("[data-container-retry]").addEventListener("click", function () {
      retryRequested = true;
      load();
    });
    $("[data-container-list]").addEventListener("click", function (event) {
      var card = event.target.closest("[data-container-id]");
      if (card) openDetail(card.dataset.containerId);
    });
    load();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
