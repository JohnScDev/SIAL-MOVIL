(function () {
  "use strict";

  var photoA = "../assets/login/Imagen 1.jpg";
  var photoB = "../assets/login/Imagen 4.jpg";
  var operations = [
    {
      id: "EXP-2026-0418",
      order: "OV-2026-0418",
      origin: "ZE Puerto Norte",
      location: "Finca Santa Isabel",
      vehicle: "TUL458",
      container: "SIALU1234567",
      responsible: "María Operadora",
      status: "En curso",
      statusType: "info",
      sync: "1 evento pendiente",
      events: [
        {
          id: "AUD-MO-001", title: "Recepción de vehículo en ZE", phase: "Zona externa", at: "05/05/2026 08:15",
          location: "ZE Puerto Norte", user: "María Operadora", status: "Recibido en ZE", severity: "success", sync: "Sincronizado",
          summary: "Inicio de trazabilidad con vehículo, contenedor y conductor confirmados.",
          controls: [
            { name: "Vehículo", value: "Sin novedad", note: "Placa y conductor coinciden con la programación.", type: "success" },
            { name: "Contenedor", value: "Confirmado", note: "Contenedor disponible en zona externa.", type: "success" }
          ],
          comments: [{ author: "María Operadora", at: "08:15", text: "Recepción completada sin novedades visibles." }],
          evidences: []
        },
        {
          id: "AUD-MO-002", title: "Inspección externa ZE", phase: "Zona externa", at: "05/05/2026 09:05",
          location: "ZE Puerto Norte", user: "María Operadora", status: "Apto con novedad", severity: "warning", sync: "Pendiente de sincronizar",
          summary: "Inspección externa con novedad en empaque y alineación del cargue pendiente por confirmar.",
          controls: [
            { name: "Fruta y empaque", value: "Sin novedad", note: "Producto y empaque visibles.", type: "success" },
            { name: "Empaque", value: "Con novedad", note: "Punto visible para revisión del supervisor.", type: "warning" },
            { name: "Cargue a carro", value: "Sin novedad", note: "Cargue registrado en proceso.", type: "success" },
            { name: "Alineación del cargue", value: "Pendiente", note: "Validar antes de continuar el flujo.", type: "error" }
          ],
          comments: [
            { author: "María Operadora", at: "09:05", text: "Se deja novedad para revisión antes del despacho." },
            { author: "Supervisor ZE", at: "09:12", text: "Priorizar validación de empaque cuando sincronice." }
          ],
          evidences: [
            { id: "EV-101", title: "Fruta y empaque", checkpoint: "Fruta y empaque", status: "Conforme", type: "success", author: "María Operadora", date: "05/05/2026 09:01", sync: "Sincronizado", note: "Fruta y empaque visibles sin novedad.", image: photoA },
            { id: "EV-102", title: "Empaque", checkpoint: "Empaque", status: "Con novedad", type: "warning", author: "María Operadora", date: "05/05/2026 09:02", sync: "Sincronizado", note: "Empaque con punto visible para revisión.", image: photoB },
            { id: "EV-103", title: "Cargue a carro", checkpoint: "Cargue a carro", status: "Conforme", type: "success", author: "María Operadora", date: "05/05/2026 09:03", sync: "Sincronizado", note: "Cargue en proceso registrado.", image: photoA },
            { id: "EV-104", title: "Alineación del cargue", checkpoint: "Contenedor a vehículo", status: "Pendiente", type: "error", author: "María Operadora", date: "05/05/2026 09:04", sync: "Pendiente de sincronizar", note: "Validar alineación del cargue.", image: photoB }
          ]
        },
        {
          id: "AUD-MO-003", title: "Inspección interna ZE", phase: "Zona externa", at: "05/05/2026 09:45",
          location: "ZE Puerto Norte", user: "María Operadora", status: "Apto", severity: "success", sync: "Sincronizado",
          summary: "Checklist interno completado con los controles obligatorios conformes.",
          controls: [
            { name: "Interior del contenedor", value: "Sin novedad", note: "Interior controlado y disponible.", type: "success" },
            { name: "Limpieza de producto", value: "Sin novedad", note: "Producto limpio para cargue.", type: "success" }
          ],
          comments: [{ author: "María Operadora", at: "09:45", text: "Interior apto para continuar el flujo." }],
          evidences: [
            { id: "EV-201", title: "Interior del contenedor", checkpoint: "Interior", status: "Conforme", type: "success", author: "María Operadora", date: "05/05/2026 09:40", sync: "Sincronizado", note: "Interior controlado sin novedad.", image: photoB },
            { id: "EV-202", title: "Limpieza de producto", checkpoint: "Limpieza", status: "Conforme", type: "success", author: "María Operadora", date: "05/05/2026 09:42", sync: "Sincronizado", note: "Producto limpio y disponible.", image: photoA }
          ]
        },
        {
          id: "AUD-MO-005", title: "Cierre de contenedor", phase: "Finca", at: "05/05/2026 14:05",
          location: "Finca Santa Isabel", user: "Laura Pineda", status: "Contenedor cerrado", severity: "success", sync: "Sincronizado",
          summary: "Cierre con pallets cargados, puertas aseguradas y sello final validado.",
          controls: [
            { name: "Pallets cargados", value: "12 pallets", note: "Cantidad confirmada.", type: "success" },
            { name: "Sello final", value: "Conforme", note: "Sello visible y validado.", type: "success" }
          ],
          comments: [{ author: "Laura Pineda", at: "14:05", text: "Contenedor cerrado y listo para despacho." }],
          evidences: [
            { id: "EV-401", title: "Sello final", checkpoint: "Cierre y sellos", status: "Conforme", type: "success", author: "Laura Pineda", date: "05/05/2026 14:03", sync: "Sincronizado", note: "Sello final visible y validado.", image: photoB }
          ]
        }
      ]
    },
    {
      id: "EXP-2026-0520",
      order: "OV-2026-0520",
      origin: "ZE Puerto Norte",
      location: "ZE Puerto Norte",
      vehicle: "XYZ789",
      container: "SIALB7654321",
      responsible: "Jorge Auditor",
      status: "Bloqueada",
      statusType: "error",
      sync: "Error de sincronización",
      events: [
        {
          id: "AUD-MO-007", title: "Inspección externa ZE", phase: "Zona externa", at: "17/06/2026 10:18",
          location: "ZE Puerto Norte", user: "Jorge Auditor", status: "No apto", severity: "error", sync: "Error de sincronización",
          summary: "Inspección bloqueada por resultado no apto y error de sincronización local.",
          controls: [
            { name: "Pared lateral izquierda", value: "Con novedad", note: "Abolladura visible.", type: "error" },
            { name: "Barras de cierre", value: "Con novedad", note: "Mecanismo requiere validación.", type: "error" }
          ],
          comments: [
            { author: "Jorge Auditor", at: "10:18", text: "No continuar hasta validación de seguridad." },
            { author: "Sistema móvil", at: "10:19", text: "Sincronización fallida; el registro permanece local." }
          ],
          evidences: [
            { id: "EV-601", title: "Pared lateral izquierda", checkpoint: "Pared lateral", status: "Con novedad", type: "error", author: "Jorge Auditor", date: "17/06/2026 10:12", sync: "Error de sincronización", note: "Abolladura visible.", image: photoA },
            { id: "EV-602", title: "Barras de cierre", checkpoint: "Barras de cierre", status: "Con novedad", type: "error", author: "Jorge Auditor", date: "17/06/2026 10:15", sync: "Error de sincronización", note: "Mecanismo requiere validación.", image: photoB }
          ]
        }
      ]
    }
  ];

  var state = { operationId: operations[0].id, tab: "trace", eventId: "AUD-MO-002" };
  var detail = document.querySelector("[data-evidence-detail]");

  function $(selector) { return document.querySelector(selector); }
  function $all(selector) { return Array.from(document.querySelectorAll(selector)); }
  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function normalize(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  }
  function operation() { return operations.find(function (item) { return item.id === state.operationId; }) || operations[0]; }
  function activeEvent() {
    var op = operation();
    return op.events.find(function (item) { return item.id === state.eventId; }) || op.events[0];
  }
  function evidenceTotal(op) {
    return op.events.reduce(function (sum, event) { return sum + event.evidences.length; }, 0);
  }
  function setText(selector, value) {
    var node = $(selector);
    if (node) node.textContent = value;
  }
  function pill(type) { return "sial-pill " + (type || "info"); }

  function renderOperation() {
    var op = operation();
    setText("[data-operation-id]", op.id);
    setText("[data-operation-order]", "Orden de viaje " + op.order);
    setText("[data-operation-origin]", op.origin);
    setText("[data-operation-location]", op.location);
    setText("[data-operation-vehicle]", op.vehicle);
    setText("[data-operation-container]", op.container);
    setText("[data-operation-responsible]", op.responsible);
    setText("[data-operation-sync]", op.sync);
    var status = $("[data-operation-status]");
    if (status) { status.className = pill(op.statusType); status.textContent = op.status; }
    setText("[data-trace-count]", op.events.length);
    setText("[data-evidence-count]", evidenceTotal(op));
    setText("[data-trace-sync]", op.sync);
  }

  function renderTimeline() {
    var op = operation();
    var root = $("[data-trace-list]");
    if (!root) return;
    root.innerHTML = op.events.map(function (event, index) {
      var selected = event.id === state.eventId;
      return [
        '<button class="trace-event' + (selected ? " active" : "") + '" type="button" data-open-event="' + escapeHtml(event.id) + '">',
        '<span class="trace-rail"><i class="' + escapeHtml(event.severity) + '"></i></span>',
        '<span class="trace-event-copy">',
        '<small>' + String(index + 1).padStart(2, "0") + ' · ' + escapeHtml(event.phase) + '</small>',
        '<strong>' + escapeHtml(event.title) + '</strong>',
        '<span>' + escapeHtml(event.at) + ' · ' + escapeHtml(event.user) + '</span>',
        '</span>',
        '<span class="trace-event-result"><em class="' + escapeHtml(event.severity) + '">' + escapeHtml(event.status) + '</em><b>' + event.evidences.length + (event.evidences.length === 1 ? " evidencia" : " evidencias") + '</b></span>',
        '</button>'
      ].join("");
    }).join("");
  }

  function renderEventSelector() {
    var op = operation();
    var select = $("[data-event-select]");
    if (!select) return;
    select.innerHTML = op.events.map(function (event) {
      return '<option value="' + escapeHtml(event.id) + '"' + (event.id === state.eventId ? " selected" : "") + '>' + escapeHtml(event.title) + '</option>';
    }).join("");
  }

  function renderControls(event) {
    var root = $("[data-control-list]");
    setText("[data-control-count]", event.controls.length + (event.controls.length === 1 ? " control" : " controles"));
    if (!root) return;
    root.innerHTML = event.controls.map(function (control) {
      return '<article class="control-row"><span class="control-indicator ' + escapeHtml(control.type) + '"></span><div><strong>' + escapeHtml(control.name) + '</strong><p>' + escapeHtml(control.note) + '</p></div><em class="' + escapeHtml(control.type) + '">' + escapeHtml(control.value) + '</em></article>';
    }).join("");
  }

  function renderPhotos(event) {
    var root = $("[data-photo-strip]");
    var empty = $("[data-event-no-evidence]");
    setText("[data-photo-count]", event.evidences.length + (event.evidences.length === 1 ? " foto" : " fotos"));
    if (!root || !empty) return;
    root.hidden = event.evidences.length === 0;
    empty.hidden = event.evidences.length !== 0;
    root.innerHTML = event.evidences.map(function (item, index) {
      return [
        '<button class="record-photo" type="button" data-open-evidence="' + escapeHtml(item.id) + '">',
        '<span class="record-photo-image"><img src="' + escapeHtml(item.image) + '" alt="" loading="lazy"><em class="' + escapeHtml(item.type) + '">' + escapeHtml(item.status) + '</em><b>' + String(index + 1).padStart(2, "0") + '/' + String(event.evidences.length).padStart(2, "0") + '</b></span>',
        '<span><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.date.split(" ").pop()) + ' · ' + escapeHtml(item.id) + '</small></span>',
        '</button>'
      ].join("");
    }).join("");
  }

  function renderComments(event) {
    var root = $("[data-comment-list]");
    setText("[data-comment-count]", event.comments.length + (event.comments.length === 1 ? " comentario" : " comentarios"));
    if (!root) return;
    root.innerHTML = event.comments.map(function (comment) {
      return '<article class="comment-row"><span>' + escapeHtml(comment.author.charAt(0)) + '</span><div><strong>' + escapeHtml(comment.author) + '<small>' + escapeHtml(comment.at) + '</small></strong><p>' + escapeHtml(comment.text) + '</p></div></article>';
    }).join("");
  }

  function renderEventRecord() {
    var event = activeEvent();
    setText("[data-event-title]", event.title);
    setText("[data-event-sync]", event.sync);
    setText("[data-event-phase]", event.phase);
    setText("[data-event-date]", event.at);
    setText("[data-event-location]", event.location);
    setText("[data-event-user]", event.user);
    setText("[data-event-summary]", event.summary);
    var status = $("[data-event-status]");
    if (status) { status.className = pill(event.severity); status.textContent = event.status; }
    renderEventSelector();
    renderControls(event);
    renderPhotos(event);
    renderComments(event);
  }

  function renderTabs() {
    $all("[data-workbench-tab]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.workbenchTab === state.tab));
    });
    var trace = $("[data-trace-panel]");
    var evidence = $("[data-evidence-panel]");
    if (trace) trace.hidden = state.tab !== "trace";
    if (evidence) evidence.hidden = state.tab !== "evidence";
  }

  function renderAll() {
    renderOperation();
    renderTimeline();
    renderEventRecord();
    renderTabs();
  }

  function selectOperation(id) {
    var op = operations.find(function (item) { return item.id === id; });
    if (!op) return;
    state.operationId = op.id;
    state.eventId = op.events[0].id;
    state.tab = "trace";
    var input = $("[data-operation-search]");
    var matches = $("[data-operation-matches]");
    if (input) input.value = op.id;
    if (matches) matches.hidden = true;
    var clear = $("[data-operation-clear]");
    if (clear) clear.hidden = false;
    renderAll();
  }

  function renderMatches(query) {
    var root = $("[data-operation-matches]");
    var clear = $("[data-operation-clear]");
    if (!root) return;
    var term = normalize(query);
    if (clear) clear.hidden = !term;
    if (!term) { root.hidden = true; root.innerHTML = ""; return; }
    var matches = operations.filter(function (op) {
      return normalize([op.id, op.order, op.vehicle, op.container, op.location].join(" ")).includes(term);
    });
    root.hidden = false;
    root.innerHTML = matches.length ? matches.map(function (op) {
      return '<button type="button" data-select-operation="' + escapeHtml(op.id) + '"><span><strong>' + escapeHtml(op.id) + '</strong><small>' + escapeHtml(op.order) + ' · ' + escapeHtml(op.location) + '</small></span><b>' + escapeHtml(op.vehicle) + '</b></button>';
    }).join("") : '<div class="operation-match-empty"><strong>Operación no encontrada</strong><span>Prueba con EXP-2026-0418 o la placa del vehículo.</span></div>';
  }

  function findEvidence(id) {
    var found = null;
    operations.some(function (op) {
      return op.events.some(function (event) {
        var evidence = event.evidences.find(function (item) { return item.id === id; });
        if (!evidence) return false;
        found = Object.assign({ eventTitle: event.title }, evidence);
        return true;
      });
    });
    return found;
  }

  function openDetail(id, trigger) {
    var item = findEvidence(id);
    if (!detail || !item) return;
    var photo = detail.querySelector("[data-detail-photo]");
    if (photo) photo.innerHTML = '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '">';
    var values = {
      "[data-detail-counter]": item.id, "[data-detail-title]": item.title,
      "[data-detail-event]": item.eventTitle, "[data-detail-author]": item.author,
      "[data-detail-date]": item.date, "[data-detail-checkpoint]": item.checkpoint,
      "[data-detail-note]": item.note, "[data-detail-sync]": item.sync
    };
    Object.keys(values).forEach(function (selector) {
      var node = detail.querySelector(selector);
      if (node) node.textContent = values[selector];
    });
    var status = detail.querySelector("[data-detail-status]");
    if (status) { status.className = pill(item.type); status.textContent = item.status; }
    detail.hidden = false;
    if (window.SialMobileUI && window.SialMobileUI.mountModalLayer) {
      window.SialMobileUI.mountModalLayer(detail, { panel: detail.querySelector(".evidence-detail-sheet"), initialFocus: "[data-detail-close]", trigger: trigger, onEscape: closeDetail });
    }
  }

  function closeDetail() {
    if (!detail || detail.hidden) return;
    if (window.SialMobileUI && window.SialMobileUI.unmountModalLayer) window.SialMobileUI.unmountModalLayer(detail);
    detail.hidden = true;
  }

  document.addEventListener("click", function (event) {
    var operationButton = event.target.closest("[data-select-operation]");
    if (operationButton) { selectOperation(operationButton.dataset.selectOperation); return; }

    var tab = event.target.closest("[data-workbench-tab]");
    if (tab) { state.tab = tab.dataset.workbenchTab; renderTabs(); return; }

    var traceEvent = event.target.closest("[data-open-event]");
    if (traceEvent) {
      state.eventId = traceEvent.dataset.openEvent;
      state.tab = "evidence";
      renderTimeline(); renderEventRecord(); renderTabs();
      window.setTimeout(function () { $("[data-evidence-panel]")?.focus?.(); }, 0);
      return;
    }

    var photo = event.target.closest("[data-open-evidence]");
    if (photo) { openDetail(photo.dataset.openEvidence, photo); return; }

    if (event.target.closest("[data-operation-clear]")) {
      var input = $("[data-operation-search]");
      if (input) { input.value = ""; input.focus(); }
      renderMatches("");
      return;
    }

    if (event.target.closest("[data-detail-close]") || event.target === detail) closeDetail();
  });

  var operationSearch = $("[data-operation-search]");
  if (operationSearch) operationSearch.addEventListener("input", function () { renderMatches(operationSearch.value); });
  var eventSelect = $("[data-event-select]");
  if (eventSelect) eventSelect.addEventListener("change", function () { state.eventId = eventSelect.value; renderTimeline(); renderEventRecord(); });

  renderAll();
})();
