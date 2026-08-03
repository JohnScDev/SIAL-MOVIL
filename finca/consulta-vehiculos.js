(function () {
  "use strict";

  var contextKey = "sial-mobile-context";
  var workflowKey = "sial-mobile-workflow";
  var operationKey = "sial-mobile-vehicle-operations";
  var contextFarmCodes = {
    "finca-santa-isabel": "0527",
    "finca-la-esperanza": "0412",
    "unidad-operativa-puerto": "0435"
  };
  var vehicles = [];
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
    $("[data-vehicle-week]").innerHTML = options.map(function (option) {
      return '<option value="' + option.value + '">' + option.label + "</option>";
    }).join("");
  }

  function addDays(date, amount) {
    return new Date(date.getTime() + amount * 86400000);
  }

  function atTime(date, hour, minute) {
    var value = new Date(date);
    value.setHours(hour, minute, 0, 0);
    return value.toISOString();
  }

  function demoVehicles() {
    var farm = activeFarm();
    var now = new Date();
    return [
      {
        id: "OP-VEH-2026-418",
        schedule: "PRG-2026-031",
        plate: "TRK-421",
        type: "TRACTOMULA",
        driver: "Carlos Méndez",
        carrier: "TRANSLOGÍSTICA SAS",
        week: weekAtOffset(0),
        originCode: farm.code,
        origin: farm.name,
        destinationCode: "0435",
        destination: "Zona Externa Santa Marta",
        direction: "SALIDA",
        status: "EN_TRANSITO",
        stage: "EN RUTA A ZE",
        step: 3,
        scheduledAt: atTime(now, 7, 30),
        updatedAt: atTime(now, 9, 18),
        observation: "Despacho confirmado desde la finca. Pendiente de recepción en Zona Externa.",
        audit: "Salida registrada por porteria.finca · Operación OP-VEH-2026-418"
      },
      {
        id: "OP-VEH-2026-421",
        schedule: "PRG-2026-032",
        plate: "CAM-101",
        type: "CAMIÓN",
        driver: "Ana Lucía Paz",
        carrier: "OPERADOR CARIBE SAS",
        week: weekAtOffset(0),
        originCode: "0435",
        origin: "Zona Externa Santa Marta",
        destinationCode: farm.code,
        destination: farm.name,
        direction: "ENTRADA",
        status: "EN_TRANSITO",
        stage: "EN RUTA A FINCA",
        step: 3,
        scheduledAt: atTime(now, 6, 15),
        updatedAt: atTime(now, 8, 46),
        observation: "Vehículo despachado desde Zona Externa con llegada pendiente en finca.",
        audit: "Despacho registrado por operador.ze · Operación OP-VEH-2026-421"
      },
      {
        id: "OP-VEH-2026-423",
        schedule: "PRG-2026-033",
        plate: "RIG-118",
        type: "CAMIÓN RÍGIDO",
        driver: "Julián Pérez",
        carrier: "TRANSPORTES ANDINOS",
        week: weekAtOffset(0),
        originCode: "0435",
        origin: "Zona Externa Santa Marta",
        destinationCode: farm.code,
        destination: farm.name,
        direction: "ENTRADA",
        status: "EN_DESTINO",
        stage: "RECIBIDO EN FINCA",
        step: 4,
        scheduledAt: atTime(addDays(now, -1), 13, 20),
        updatedAt: atTime(addDays(now, -1), 15, 8),
        observation: "Recepción confirmada. Vehículo disponible para la siguiente etapa operativa.",
        audit: "Recepción registrada por porteria.finca · Operación OP-VEH-2026-423"
      },
      {
        id: "OP-VEH-2026-430",
        schedule: "PRG-2026-037",
        plate: "CMN-204",
        type: "CAMIÓN",
        driver: "Pedro Rojas",
        carrier: "OPERADOR CARIBE SAS",
        week: weekAtOffset(1),
        originCode: farm.code,
        origin: farm.name,
        destinationCode: "PCTG",
        destination: "Puerto Cartagena",
        direction: "SALIDA",
        status: "PROGRAMADO",
        stage: "PROGRAMADO",
        step: 0,
        scheduledAt: atTime(addDays(now, 7), 9, 0),
        updatedAt: now.toISOString(),
        observation: "Programación futura pendiente de inicio.",
        audit: "Programado por supervisor.transporte · Operación OP-VEH-2026-430"
      },
      {
        id: "OP-VEH-2026-397",
        schedule: "PRG-2026-028",
        plate: "CAM-102",
        type: "CAMIÓN RÍGIDO",
        driver: "Pedro Rojas",
        carrier: "CARGA PESADA LTDA.",
        week: weekAtOffset(-1),
        originCode: farm.code,
        origin: farm.name,
        destinationCode: "0435",
        destination: "Zona Externa Santa Marta",
        direction: "SALIDA",
        status: "FINALIZADO",
        stage: "FINALIZADO",
        step: 5,
        scheduledAt: atTime(addDays(now, -8), 8, 0),
        updatedAt: atTime(addDays(now, -8), 17, 0),
        observation: "Recorrido finalizado sin novedades.",
        audit: "Operación finalizada por supervisor.ze · Operación OP-VEH-2026-397"
      }
    ];
  }

  function readVehicles() {
    var stored = readJson(operationKey, []);
    return Array.isArray(stored) && stored.length ? stored : demoVehicles();
  }

  function statusMeta(status) {
    if (status === "FINALIZADO") return { label: "Finalizado", className: "info" };
    if (status === "EN_DESTINO") return { label: "En destino", className: "success" };
    if (status === "EN_TRANSITO") return { label: "En tránsito", className: "warning" };
    return { label: "Programado", className: "neutral" };
  }

  function formatDate(value) {
    var date = new Date(value || "");
    if (Number.isNaN(date.getTime())) return "Sin fecha";
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function isLinkedToFarm(item, farm) {
    return item.originCode === farm.code || item.destinationCode === farm.code;
  }

  function matchesFilters(item) {
    var query = $("[data-vehicle-search]").value.trim().toLowerCase();
    var week = $("[data-vehicle-week]").value;
    var status = $("[data-vehicle-status]").value;
    var farm = activeFarm();
    var searchable = [item.plate, item.driver, item.carrier, item.type, item.origin, item.destination, item.schedule, item.id, item.stage].join(" ").toLowerCase();

    return isLinkedToFarm(item, farm) &&
      (!query || searchable.indexOf(query) >= 0) &&
      (week === "all" || item.week === week) &&
      (status === "all" || item.status === status);
  }

  function routeTemplate(item, detail) {
    return [
      '<div class="' + (detail ? "vehicle-detail-route" : "vehicle-route") + '">',
      '<span class="vehicle-route-point"><span>Origen</span><strong>' + escapeHtml(item.origin) + '</strong></span>',
      '<span class="vehicle-route-arrow" aria-hidden="true"><svg class="sial-icon" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg></span>',
      '<span class="vehicle-route-point"><span>Destino</span><strong>' + escapeHtml(item.destination) + '</strong></span>',
      '</div>'
    ].join("");
  }

  function vehicleIcon(type) {
    var normalized = String(type || "").toUpperCase();

    if (normalized.indexOf("TRACTOMULA") >= 0) {
      return '<svg class="sial-icon" viewBox="0 0 24 24"><path d="M2 7h12v8H2z"/><path d="M14 11h2"/><path d="M16 9h3l3 4v2h-6z"/><circle cx="6" cy="17" r="2"/><circle cx="18" cy="17" r="2"/></svg>';
    }

    if (normalized.indexOf("RÍGIDO") >= 0 || normalized.indexOf("RIGIDO") >= 0) {
      return '<svg class="sial-icon" viewBox="0 0 24 24"><path d="M3 8h14l4 5v4H3z"/><path d="M17 8v5h4"/><path d="M6 12h7"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>';
    }

    return '<svg class="sial-icon" viewBox="0 0 24 24"><path d="M3 9h11v8H3z"/><path d="M14 11h4l3 3v3h-7z"/><path d="M17 11v3h4"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>';
  }
  function cardTemplate(item) {
    var status = statusMeta(item.status);
    return [
      '<button class="sial-query-item" type="button" data-vehicle-id="' + escapeHtml(item.id) + '" aria-label="Ver vehículo ' + escapeHtml(item.plate) + '">',
      '<span class="sial-query-item-icon" aria-hidden="true">' + vehicleIcon(item.type) + '</span>',
      '<span class="sial-query-item-body">',
      '<span class="sial-query-item-title"><strong>' + escapeHtml(item.plate) + '</strong><span class="sial-pill ' + status.className + '">' + status.label + '</span></span>',
      '<span class="sial-query-item-meta"><span><strong>' + escapeHtml(item.type) + '</strong></span><span>' + escapeHtml(item.driver) + '</span></span>',
      routeTemplate(item, false),
      '<span class="sial-query-item-stage"><svg class="sial-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>' + escapeHtml(item.stage) + '</span>',
      '<span class="sial-query-item-foot"><span>' + escapeHtml(item.direction === "ENTRADA" ? "Entrada a finca" : "Salida de finca") + '</span><span>Actualizado ' + escapeHtml(formatDate(item.updatedAt)) + '</span></span>',
      '</span>',
      '<svg class="sial-icon sial-query-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
      '</button>'
    ].join("");
  }

  function setViewState(state) {
    $("[data-vehicle-loading]").hidden = state !== "loading";
    $("[data-vehicle-list]").hidden = state !== "results";
    $("[data-vehicle-empty]").hidden = state !== "empty";
    $("[data-vehicle-error]").hidden = state !== "error";
  }

  function render() {
    var filtered = vehicles.filter(matchesFilters).sort(function (a, b) {
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });
    var queryActive = Boolean(
      $("[data-vehicle-search]").value.trim() ||
      $("[data-vehicle-week]").value !== weekAtOffset(0) ||
      $("[data-vehicle-status]").value !== "all"
    );
    var list = $("[data-vehicle-list]");

    $("[data-vehicle-summary]").textContent = filtered.length + (filtered.length === 1 ? " vehículo" : " vehículos") + " · " + $("[data-vehicle-week]").selectedOptions[0].textContent;
    $("[data-vehicle-clear]").hidden = !queryActive;
    list.innerHTML = filtered.map(cardTemplate).join("");

    if (filtered.length) {
      setViewState("results");
      return;
    }

    var hasSearch = Boolean($("[data-vehicle-search]").value.trim());
    $("[data-vehicle-empty-title]").textContent = hasSearch ? "Sin coincidencias" : "No hay vehículos asociados";
    $("[data-vehicle-empty-copy]").textContent = hasSearch
      ? "No encontramos vehículos que coincidan con la placa, conductor o destino ingresados."
      : "No existen programaciones para la finca, semana y estado seleccionados.";
    setViewState("empty");
  }

  function journeyRows(item) {
    var stages = [
      { name: "PROGRAMADO", detail: "Programación registrada" },
      { name: "CONDUCTOR ASIGNADO", detail: item.driver || "Pendiente" },
      { name: "DESPACHADO", detail: "Salida desde el origen" },
      { name: "EN TRÁNSITO", detail: "Recorrido operativo" },
      { name: "RECIBIDO", detail: "Llegada al destino" },
      { name: "FINALIZADO", detail: "Operación cerrada" }
    ];
    var current = Math.max(0, Math.min(Number(item.step) || 0, stages.length - 1));
    return stages.map(function (stage, index) {
      var state = index < current ? "is-complete" : index === current ? "is-current" : "";
      var stateLabel = index < current ? "Completado" : index === current ? "Etapa actual" : "Pendiente";
      return '<div class="vehicle-journey-step ' + state + '"><span class="vehicle-journey-dot" aria-hidden="true"></span><span class="vehicle-journey-copy"><strong>' + stage.name + '</strong><span>' + stateLabel + ' · ' + escapeHtml(stage.detail) + '</span></span></div>';
    }).join("");
  }

  function detailContent(item) {
    var status = statusMeta(item.status);
    var content = document.createElement("div");
    content.className = "sial-query-detail";
    content.innerHTML = [
      '<section class="sial-query-detail-identity">',
      '<div class="sial-query-detail-identity-head"><div><span>VEHÍCULO</span><strong>' + escapeHtml(item.plate) + '</strong></div><span class="sial-pill ' + status.className + '">' + status.label + '</span></div>',
      '<div class="sial-query-detail-grid">',
      '<div class="sial-query-detail-field"><span>TIPO</span><strong>' + escapeHtml(item.type) + '</strong></div>',
      '<div class="sial-query-detail-field"><span>SEMANA</span><strong>' + escapeHtml(item.week) + '</strong></div>',
      '<div class="sial-query-detail-field"><span>CONDUCTOR</span><strong>' + escapeHtml(item.driver || "--") + '</strong></div>',
      '<div class="sial-query-detail-field"><span>SENTIDO</span><strong>' + escapeHtml(item.direction === "ENTRADA" ? "Entrada a finca" : "Salida de finca") + '</strong></div>',
      '<div class="sial-query-detail-field"><span>PROGRAMACIÓN</span><strong>' + escapeHtml(item.schedule || "--") + '</strong></div>',
      '<div class="sial-query-detail-field"><span>OPERACIÓN</span><strong>' + escapeHtml(item.id || "--") + '</strong></div>',
      '</div></section>',
      '<section class="sial-query-detail-section"><h3>Ruta programada</h3>' + routeTemplate(item, true) + '</section>',
      '<section class="sial-query-detail-section"><h3>Estado del recorrido</h3><div class="vehicle-journey">' + journeyRows(item) + '</div></section>',
      '<section class="sial-query-detail-section"><h3>Información operativa</h3>',
      '<div class="sial-list-row"><strong>Transportadora</strong><span>' + escapeHtml(item.carrier || "--") + '</span></div>',
      '<div class="sial-list-row"><strong>Fecha programada</strong><span>' + escapeHtml(formatDate(item.scheduledAt)) + '</span></div>',
      '<div class="sial-list-row"><strong>Último registro</strong><span>' + escapeHtml(formatDate(item.updatedAt)) + '</span></div>',
      '<p class="sial-query-detail-note">La etapa corresponde al último evento operativo registrado; no representa ubicación GPS en tiempo real.</p>',
      '</section>',
      '<section class="sial-query-detail-section"><h3>Auditoría</h3><p class="sial-query-detail-note">' + escapeHtml(item.audit || "Auditoría no disponible.") + '</p></section>',
      item.observation ? '<section class="sial-query-detail-section"><h3>Observaciones</h3><p class="sial-query-detail-note">' + escapeHtml(item.observation) + '</p></section>' : ""
    ].join("");
    return content;
  }

  function openDetail(id) {
    var item = vehicles.find(function (candidate) { return candidate.id === id; });
    if (!item || !window.SialMobileUI) return;
    window.SialMobileUI.openDialog({
      id: "vehicle-farm-query-detail",
      title: "Detalle del vehículo",
      variant: "sheet",
      content: detailContent(item),
      actions: [{ label: "Cerrar", variant: "primary" }]
    });
  }

  function clearFilters() {
    $("[data-vehicle-search]").value = "";
    $("[data-vehicle-week]").value = weekAtOffset(0);
    $("[data-vehicle-status]").value = "all";
    render();
  }

  function load() {
    setViewState("loading");
    window.setTimeout(function () {
      var forcedState = new URLSearchParams(window.location.search).get("state");
      if (forcedState === "error" && !retryRequested) {
        setViewState("error");
        $("[data-vehicle-summary]").textContent = "Consulta no disponible";
        return;
      }
      vehicles = forcedState === "empty" && !retryRequested ? [] : readVehicles();
      render();
    }, 320);
  }

  function bindEvents() {
    $("[data-vehicle-search]").addEventListener("input", render);
    $("[data-vehicle-week]").addEventListener("change", render);
    $("[data-vehicle-status]").addEventListener("change", render);
    $("[data-vehicle-clear]").addEventListener("click", clearFilters);
    $("[data-vehicle-retry]").addEventListener("click", function () {
      retryRequested = true;
      load();
    });
    $("[data-vehicle-list]").addEventListener("click", function (event) {
      var item = event.target.closest("[data-vehicle-id]");
      if (item) openDetail(item.getAttribute("data-vehicle-id"));
    });
  }

  function init() {
    var farm = activeFarm();
    $("[data-vehicle-context-farm]").textContent = farm.code + " · " + farm.name;
    populateWeeks();
    bindEvents();
    load();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
