(function () {
  const stateKey = "sial-mobile-workflow";

  const defaults = {
    container: "SIALU1234567",
    vehicle: "TUL458",
    trailer: "RML789",
    driver: "Carlos Mendoza",
    driverDocument: "1012345678",
    operation: "EXP-2026-0418",
    reference: "BAN-REF-001",
    finca: "Finca Santa Isabel",
    user: "Maria Operadora",
    supervisor: "Laura Pineda",
    carrier: "Transbanasan",
    order: "ORD-ZE-2041",
    journey: "VIAJE-7751",
    ze: "ZE Puerto Norte",
    status: "PENDIENTE_RECEPCION_ZE",
    operationStatus: "PENDIENTE_RECEPCION_ZE",
    containerStatus: "DISPONIBLE",
    containerLocation: "ZE",
    vehicleStatus: "ASIGNADO",
    containerExists: true,
    hasActiveDispatch: false,
    hasVehicleAssociation: true,
    containerExported: false,
    boxes: 0,
    pallets: 0,
    loadedPallets: 0,
    boxCodes: [],
    photos: {},
    photoData: {},
    alerts: [],
    flags: {},
    events: [],
    selectedVehicleId: null,
    evidence: {},
    availableVehicles: [
      { id: "V-001", truckPlate: "TUL458", trailerPlate: "RML789", driverName: "Carlos Mendoza", driverDoc: "1012345678", carrier: "Transbanasan", container: "SIALU1234567", active: true },
      { id: "V-002", truckPlate: "ABC123", trailerPlate: "DEF456", driverName: "Ana Ramirez", driverDoc: "1023456789", carrier: "Logistica Sur", container: "", active: true },
      { id: "V-003", truckPlate: "XYZ789", trailerPlate: "LMN012", driverName: "Pedro Gutierrez", driverDoc: "1034567890", carrier: "Transbanasan", container: "SIALB7654321", active: true },
      { id: "V-004", truckPlate: "QWE555", trailerPlate: "", driverName: "Luis Velasquez", driverDoc: "1045678901", carrier: "Transportes Norte", container: "", active: false }
    ]
  };

  const requirements = {
    zeReception: [],
    portExternalInspection: ["zeReception"],
    portInternalInspection: ["zeReception", "portExternalInspection"],
    zeDispatch: ["zeReception", "portExternalInspection", "portInternalInspection"],
    farmReception: ["zeDispatch"],
    farmExternalInspection: ["farmReception"],
    farmInternalInspection: ["farmReception"],
    responsibility: ["farmReception"],
    palletBuilt: ["farmReception"],
    palletsLoaded: ["farmReception"],
    containerClosed: ["farmReception", "palletsLoaded"],
    farmDispatch: ["containerClosed"],
    zeReturnReception: ["farmDispatch"],
    portDispatch: ["zeReturnReception"],
    portReception: ["portDispatch"],
    portDelivery: ["portReception"]
  };

  const labels = {
    zeReception: "Recepcion vehiculo en ZE",
    portExternalInspection: "Inspeccion externa ZE",
    portInternalInspection: "Inspeccion interna ZE",
    zeDispatch: "Despacho a finca",
    farmReception: "Recepcion en finca",
    farmExternalInspection: "Inspeccion externa en finca",
    farmInternalInspection: "Inspeccion interna en finca",
    responsibility: "Sesion de responsabilidad",
    palletBuilt: "Armado de pallet",
    palletsLoaded: "Cargue de pallets",
    containerClosed: "Cierre de contenedor",
    farmDispatch: "Despacho desde finca a ZE",
    zeReturnReception: "Recepcion en ZE desde finca",
    portDispatch: "Despacho a puerto",
    portReception: "Recepcion en puerto",
    portDelivery: "Entrega final en puerto"
  };

  const locationLabels = {
    ZE: "Zona Externa",
    FINCA: "Finca",
    PUERTO: "Puerto",
    TRANSITO_FINCA: "Transito a finca",
    TRANSITO_ZE: "Transito a ZE",
    TRANSITO_PUERTO: "Transito a puerto"
  };

  function readState() {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(stateKey) || "{}") };
    } catch (_) {
      return { ...defaults };
    }
  }

  function writeState(state) {
    localStorage.setItem(stateKey, JSON.stringify(state));
  }

  function missingRequirements(eventName, state) {
    return (requirements[eventName] || []).filter((key) => !state.flags[key]);
  }

  function isPrototypeReviewPage() {
    return Boolean(document.querySelector("[data-flow-form][data-flow-mode='prototype']"));
  }

  function isPrototypeReviewForm(form) {
    return form && form.dataset.flowMode === "prototype";
  }

  function addEvent(state, eventName, detail) {
    const item = {
      event: eventName,
      label: labels[eventName] || eventName,
      detail: detail || "",
      timestamp: new Date().toLocaleString("es-CO"),
      status: state.containerStatus || state.status,
      sync: navigator.onLine ? "Sincronizado" : "Pendiente de sincronizar"
    };
    state.events = [item, ...(state.events || [])];
  }

  function hydrateSummary(state) {
    document.querySelectorAll("[data-flow-container]").forEach((node) => { node.textContent = state.container; });
    document.querySelectorAll("[data-flow-vehicle]").forEach((node) => { node.textContent = state.vehicle; });
    document.querySelectorAll("[data-flow-trailer]").forEach((node) => { node.textContent = state.trailer || ""; });
    document.querySelectorAll("[data-flow-driver]").forEach((node) => { node.textContent = state.driver; });
    document.querySelectorAll("[data-flow-driver-document]").forEach((node) => { node.textContent = state.driverDocument || ""; });
    document.querySelectorAll("[data-flow-ze]").forEach((node) => { node.textContent = state.ze || ""; });
    document.querySelectorAll("[data-flow-operation]").forEach((node) => { node.textContent = state.operation; });
    document.querySelectorAll("[data-flow-user]").forEach((node) => { node.textContent = state.user; });
    document.querySelectorAll("[data-flow-supervisor]").forEach((node) => { node.textContent = state.supervisor; });
    document.querySelectorAll("[data-flow-carrier]").forEach((node) => { node.textContent = state.carrier; });
    document.querySelectorAll("[data-flow-order]").forEach((node) => { node.textContent = state.order; });
    document.querySelectorAll("[data-flow-journey]").forEach((node) => { node.textContent = state.journey; });
    document.querySelectorAll("[data-flow-status]").forEach((node) => { node.textContent = state.containerStatus || state.status; });
    document.querySelectorAll("[data-flow-container-status]").forEach((node) => { node.textContent = state.containerStatus; });
    document.querySelectorAll("[data-flow-operation-status]").forEach((node) => { node.textContent = state.operationStatus; });
    document.querySelectorAll("[data-flow-vehicle-status]").forEach((node) => { node.textContent = state.vehicleStatus; });
    document.querySelectorAll("[data-flow-location]").forEach((node) => { node.textContent = locationLabels[state.containerLocation] || state.containerLocation; });
    document.querySelectorAll("[data-flow-sync]").forEach((node) => { node.textContent = navigator.onLine ? "Online" : "Offline"; });
    document.querySelectorAll("[data-flow-sync-status]").forEach((node) => {
      var eventName = node.dataset.flowSyncStatus || "";
      var syncStatus = eventName && state.eventSyncStatus ? (state.eventSyncStatus[eventName] || "") : "";
      node.textContent = syncStatus || (navigator.onLine ? "Sincronizado" : "Pendiente de sincronizar");
      if (node.dataset.syncPill) {
        node.className = "sial-pill" + (syncStatus === "SYNCED" ? " success" : syncStatus === "LOCAL_PENDING_SYNC" ? " warning" : "");
      }
    });
    document.querySelectorAll("[data-flow-pallets]").forEach((node) => { node.textContent = String(state.pallets || 0); });
    document.querySelectorAll("[data-flow-loaded-pallets]").forEach((node) => { node.textContent = String(state.loadedPallets || 0); });
    document.querySelectorAll("[data-flow-boxes]").forEach((node) => { node.textContent = String(state.boxes || 0); });
    document.querySelectorAll("[data-flow-alert-count]").forEach((node) => { node.textContent = String((state.alerts || []).length); });
    document.querySelectorAll("[data-flow-event-count]").forEach((node) => { node.textContent = String((state.events || []).length); });
    document.querySelectorAll("[data-flow-pending-sync-count]").forEach((node) => {
      const pending = (state.events || []).filter((item) => String(item.sync || "").toLowerCase().includes("pendiente")).length;
      node.textContent = String(pending);
    });
    document.querySelectorAll("[data-flow-in-transit-count]").forEach((node) => {
      node.textContent = String(String(state.containerLocation || "").startsWith("TRANSITO") ? 1 : 0);
    });
    document.querySelectorAll("[data-flow-available-vehicle-count]").forEach((node) => {
      node.textContent = String(state.vehicleStatus === "DISPONIBLE" ? 1 : 0);
    });
    const nextAction = getNextAction(state);
    document.querySelectorAll("[data-next-action]").forEach((node) => { node.setAttribute("href", nextAction.href); });
    document.querySelectorAll("[data-next-action-label]").forEach((node) => { node.textContent = nextAction.label; });
    document.querySelectorAll("[data-next-action-detail]").forEach((node) => { node.textContent = nextAction.detail; });
    document.querySelectorAll("[data-flow-photo-count]").forEach((node) => {
      const keys = (node.dataset.flowPhotoCount || "").split(",").map((x) => x.trim()).filter(Boolean);
      const count = keys.length
        ? keys.reduce((total, key) => total + (state.photos[key] || 0), 0)
        : Object.values(state.photos || {}).reduce((total, item) => total + item, 0);
      node.textContent = String(count);
    });
  }

  function getNextAction(state) {
    const sequence = [
      ["zeReception", "../puerto-ze/recepcion-ze.html", "Registrar recepcion en ZE", "Iniciar trazabilidad del vehiculo en zona externa."],
      ["portExternalInspection", "../puerto-ze/inspeccion-externa.html", "Inspeccion externa ZE", "Checklist de 14 puntos con evidencia fotografica."],
      ["portInternalInspection", "../puerto-ze/inspeccion-interna.html", "Inspeccion interna ZE", "15 a 23 fotos obligatorias por punto de control."],
      ["zeDispatch", "../puerto-ze/despacho-finca.html", "Despachar a finca", "Registrar salida con sellos, firmas y responsabilidad."],
      ["farmReception", "../finca/recepcion-finca.html", "Recibir en finca", "Confirmar llegada e iniciar operacion de finca."],
      ["farmExternalInspection", "../finca/inspeccion-externa.html", "Inspeccion externa finca", "Validar condiciones antes del cargue."],
      ["farmInternalInspection", "../finca/inspeccion-interna.html", "Inspeccion interna finca", "Registrar evidencia interna antes del cargue."],
      ["responsibility", "../finca/sesion-responsabilidad.html", "Sesion responsabilidad", "Capturar responsables y firmas."],
      ["palletBuilt", "../pallets/armar-pallet.html", "Armar pallet", "Registrar cajas por escaneo o digitacion."],
      ["palletsLoaded", "../pallets/cargar-pallets.html", "Cargar pallets", "Asociar pallets al contenedor."],
      ["containerClosed", "../finca/cierre-contenedor.html", "Cerrar contenedor", "Validar sellos, cantidades y evidencia."],
      ["farmDispatch", "../finca/despacho-ze.html", "Despachar a ZE", "Enviar contenedor cerrado hacia zona externa."],
      ["zeReturnReception", "../puerto-ze/recepcion-ze-retorno.html", "Recibir retorno ZE", "Confirmar llegada desde finca."],
      ["portDispatch", "../puerto-ze/despacho-puerto.html", "Despachar a puerto", "Enviar contenedor hacia terminal."],
      ["portReception", "../puerto-ze/recepcion-puerto.html", "Recibir en puerto", "Confirmar llegada y sellos."],
      ["portDelivery", "../puerto-ze/entrega-puerto.html", "Entregar / exportar", "Liberar vehiculo y cerrar trazabilidad."]
    ];
    const next = sequence.find(([eventName]) => !state.flags[eventName]);
    if (!next) {
      return {
        href: "../trazabilidad/consultar-contenedor.html",
        label: "Consultar trazabilidad",
        detail: "La operacion ya completo todos los eventos."
      };
    }
    return { href: next[1], label: next[2], detail: next[3] };
  }

  function hydrateGuard(state) {
    document.querySelectorAll("[data-requires]").forEach((node) => {
      if (isPrototypeReviewPage()) {
        node.hidden = true;
        return;
      }
      const needs = node.dataset.requires.split(",").map((x) => x.trim()).filter(Boolean);
      const missing = needs.filter((key) => !state.flags[key]);
      if (!missing.length) {
        node.hidden = true;
        return;
      }
      node.hidden = false;
      node.querySelector("[data-missing-list]").textContent = missing.map((key) => labels[key] || key).join(", ");
    });
  }

  function hydrateTimeline(state) {
    document.querySelectorAll("[data-flow-timeline]").forEach((node) => {
      const events = state.events || [];
      if (!events.length) {
        node.innerHTML = '<div class="sial-status info"><span><strong>Sin eventos registrados</strong>La trazabilidad se construira con cada registro del flujo.</span></div>';
        return;
      }
      node.innerHTML = events.map((event) => [
        '<article class="sial-timeline-item">',
        `<strong>${event.label}</strong>`,
        `<span>${event.detail || "Evento registrado"}</span>`,
        `<span>${event.timestamp} - <span class="sial-pill${event.sync === "Sincronizado" ? " success" : " warning"}">${event.sync}</span></span>`,
        "</article>"
      ].join("")).join("");
    });
  }

  function hydrateLists(state) {
    document.querySelectorAll("[data-box-list]").forEach((node) => {
      const codes = state.boxCodes || [];
      if (!codes.length) {
        node.innerHTML = '<div class="sial-list-row"><span>Sin cajas registradas</span></div>';
        return;
      }
      node.innerHTML = codes.map((code, index) => (
        `<div class="sial-list-row"><strong>Caja ${String(index + 1).padStart(3, "0")}</strong><span>${code}</span><span class="sial-row-actions"><button class="sial-chip-action" type="button" data-edit-box="${index}">Editar</button><button class="sial-chip-action" type="button" data-remove-box="${index}">Eliminar</button></span></div>`
      )).join("");
    });
  }

  function hydrateAlerts(state) {
    document.querySelectorAll("[data-flow-alerts]").forEach((node) => {
      const alerts = state.alerts || [];
      if (!alerts.length) {
        node.innerHTML = '<div class="sial-status info"><span><strong>Sin alertas activas</strong>No hay inspecciones rechazadas en la operacion actual.</span></div>';
        return;
      }
      node.innerHTML = alerts.map((alert) => [
        '<div class="sial-status warning">',
        `<span><strong>${alert.label}</strong>${alert.status} - ${alert.timestamp}</span>`,
        "</div>"
      ].join("")).join("");
    });
  }

  function showInline(form, message) {
    let box = form.querySelector("[data-flow-error]");
    if (!box) return;
    if (window.SialMobileUI && typeof window.SialMobileUI.setInlineStatus === "function") {
      window.SialMobileUI.setInlineStatus(box, {
        type: "warning",
        title: "Validacion requerida",
        message
      });
    } else {
      box.hidden = false;
      box.textContent = message;
    }
  }

  function hasAny(value, expected) {
    return expected.split(",").map((item) => item.trim()).filter(Boolean).includes(String(value));
  }

  function totalPhotos(state, keys) {
    return keys.reduce((total, key) => total + (state.photos[key] || 0), 0);
  }

  function countControlPointPhotos(form) {
    var eventName = form.dataset.event;
    if (!eventName) return 0;
    var st = readState();
    return (st.evidence || {})[eventName] ? (st.evidence[eventName] || []).length : 0;
  }

  function hasAnyControlPointNoveltyBlocking(form) {
    return Array.from(form.querySelectorAll("[data-control-point]")).some(function(cp) {
      return (cp.querySelector("[data-cp-value]") || {}).value === "CON_NOVEDAD"
        && cp.querySelector("[data-cp-blocking]") && cp.querySelector("[data-cp-blocking]").checked;
    });
  }

  function validateFormRules(form, state, eventName) {
    if (form.dataset.preventDuplicate === "true" && state.flags[eventName]) {
      return "Este evento ya fue registrado para la operacion activa.";
    }
    if (form.dataset.assertContainerExists === "true" && !state.containerExists) {
      return "El contenedor no existe en la operacion actual.";
    }
    if (form.dataset.assertNoActiveDispatch === "true" && state.hasActiveDispatch) {
      return "El contenedor ya tiene un despacho activo.";
    }
    if (form.dataset.assertContainerLocation && !hasAny(state.containerLocation, form.dataset.assertContainerLocation)) {
      return "El contenedor no se encuentra ubicado en ZE.";
    }
    if (form.dataset.assertContainerStatusAny && !hasAny(state.containerStatus, form.dataset.assertContainerStatusAny)) {
      return "El estado actual del contenedor no permite este registro.";
    }
    if (form.dataset.assertVehicleAssociated === "true" && !state.hasVehicleAssociation) {
      return "El contenedor no tiene vehiculo asociado.";
    }
    if (form.dataset.assertNotExported === "true" && state.containerExported) {
      return "El contenedor ya fue exportado.";
    }
    if (form.dataset.assertNoFutureDate) {
      var dateField = form.querySelector(form.dataset.assertNoFutureDate);
      if (dateField && dateField.value) {
        var inputDate = new Date(dateField.value);
        if (inputDate > new Date()) {
          return "La fecha y hora de llegada no puede ser futura.";
        }
      }
    }
    if (form.dataset.event === "zeDispatch") {
      var extResult = state.inspectionResults ? state.inspectionResults["portExternalInspection"] : "";
      var intResult = state.inspectionResults ? state.inspectionResults["portInternalInspection"] : "";
      if (extResult === "NO_APTO" || intResult === "NO_APTO") {
        return "No se puede despachar porque el contenedor tiene una inspeccion NO_APTA. Requiere autorizacion de supervisor.";
      }
    }
    if (form.dataset.event === "portInternalInspection") {
      var formPhotos = countControlPointPhotos(form);
      if (formPhotos < 15) {
        return "La inspeccion interna requiere minimo 15 fotografias. Actualmente hay " + formPhotos + ".";
      }
      if (formPhotos > 23 && !form.dataset.authorizedExcess) {
        return "Se alcanzo el maximo de 23 fotografias. Solicita autorizacion de excepcion para continuar.";
      }
    }
    if (form.dataset.assertBoxesMin && (state.boxes || 0) < Number(form.dataset.assertBoxesMin)) {
      return `Debes registrar al menos ${form.dataset.assertBoxesMin} caja(s).`;
    }
    if (form.dataset.assertPalletsMin && (state.pallets || 0) < Number(form.dataset.assertPalletsMin)) {
      return `Debes registrar al menos ${form.dataset.assertPalletsMin} pallet(s).`;
    }
    if (form.dataset.assertLoadedPalletsMin && (state.loadedPallets || 0) < Number(form.dataset.assertLoadedPalletsMin)) {
      return `Debes cargar al menos ${form.dataset.assertLoadedPalletsMin} pallet(s).`;
    }
    const operationField = form.querySelector("[name='operacion']");
    if (operationField && operationField.value && operationField.value !== state.operation) {
      return "La operacion ingresada no coincide con la operacion activa.";
    }
    const referenceField = form.querySelector("[name='referencia']");
    if (referenceField && referenceField.value && referenceField.value !== state.reference) {
      return "La referencia no corresponde a la operacion activa.";
    }
    const inspResult = form.querySelector("select[name='resultado_inspeccion']");
    if (inspResult && inspResult.value === "APTO") {
      const evItems = (state.evidence || {})[eventName] || [];
      const hasNovelty = evItems.some(function(e) { return e.hasNovelty; });
      if (hasNovelty) {
        return "No se puede seleccionar APTO porque existen novedades en la evidencia. Usa APTO_CON_NOVEDAD.";
      }
    }
    if (inspResult && inspResult.value === "APTO_CON_NOVEDAD") {
      const ev2 = (state.evidence || {})[eventName] || [];
      const hasNov = ev2.some(function(e) { return e.hasNovelty; });
      if (!hasNov) {
        return "APTO_CON_NOVEDAD requiere al menos una novedad en la evidencia. Usa APTO si no hay novedades.";
      }
    }
    if (inspResult && inspResult.value === "NO_APTO") {
      const ev3 = (state.evidence || {})[eventName] || [];
      const hasBlocking = ev3.some(function(e) { return e.hasNovelty && e.blocking; });
      if (!hasBlocking) {
        return "NO_APTO requiere al menos una novedad bloqueante en la evidencia.";
      }
    }
    if (form.dataset.event === "zeDispatch") {
      var driverSigned = form.querySelector("[data-signature-driver]");
      var dispatcherSigned = form.querySelector("[data-signature-dispatcher]");
      if (driverSigned && driverSigned.dataset.signatureDriver !== "confirmed") {
        return "La firma del conductor es obligatoria para confirmar el despacho.";
      }
      if (dispatcherSigned && dispatcherSigned.dataset.signatureDispatcher !== "confirmed") {
        return "La firma del radicador es obligatoria para confirmar el despacho.";
      }
    }
    const requiredPhotos = (form.dataset.requiredPhotos || "").split(",").map((x) => x.trim()).filter(Boolean);
    const missingPhotos = requiredPhotos.filter((key) => !state.photos[key]);
    if (missingPhotos.length) {
      return `Falta evidencia fotografica obligatoria: ${missingPhotos.join(", ")}.`;
    }
    const photoKeys = (form.dataset.photoKeys || form.dataset.requiredPhotos || "").split(",").map((x) => x.trim()).filter(Boolean);
    if (form.dataset.photoTotalMin && totalPhotos(state, photoKeys) < Number(form.dataset.photoTotalMin)) {
      return `La inspeccion requiere minimo ${form.dataset.photoTotalMin} foto(s).`;
    }
    if (form.dataset.photoTotalMax && totalPhotos(state, photoKeys) > Number(form.dataset.photoTotalMax)) {
      return `La inspeccion permite maximo ${form.dataset.photoTotalMax} foto(s).`;
    }
    return "";
  }

  function pageHasBlockingRequirement() {
    if (isPrototypeReviewPage()) return false;
    return Array.from(document.querySelectorAll("[data-requires]")).some((node) => !node.hidden);
  }

  function clearInline(form) {
    const box = form.querySelector("[data-flow-error]");
    if (!box) return;
    if (window.SialMobileUI && typeof window.SialMobileUI.clearInlineStatus === "function") {
      window.SialMobileUI.clearInlineStatus(box);
    } else {
      box.hidden = true;
      box.textContent = "";
    }
  }

  function generateId() {
    return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function(char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function photoCaptureApi() {
    if (!window.SialMobileUI) return null;
    return window.SialMobileUI.openPhotoCapture || window.SialMobileUI.openCamera || null;
  }

  function photoSlotTitle(slot) {
    if (!slot) return "Captura fotografica";
    var title = slot.dataset.photoTitle || slot.getAttribute("aria-label") || slot.textContent || "Captura fotografica";
    title = String(title).replace(/\s+/g, " ").trim() || "Captura fotografica";
    slot.dataset.photoTitle = title;
    return title;
  }

  function markPhotoSlotCaptured(slot, title, photos, count) {
    if (!slot) return;
    var total = Math.max(1, Number(count || (photos || []).length || 1));
    var latest = (photos || []).filter(function(photo) { return photo && photo.dataUrl; }).slice(-1)[0];
    slot.classList.add("done", "has-photo");
    slot.dataset.photoTitle = title;
    slot.dataset.photoCount = String(total);
    if (latest && latest.dataUrl) {
      slot.innerHTML = [
        '<span class="sial-evidence-slot-thumb"><img src="' + latest.dataUrl + '" alt="' + escapeHtml(title) + '" loading="lazy"></span>',
        '<span class="sial-evidence-slot-label">' + escapeHtml(title) + '</span>',
        '<span class="sial-evidence-slot-count">' + total + ' foto(s)</span>'
      ].join("");
      return;
    }
    slot.textContent = total > 1 ? total + " fotos" : "Foto capturada";
  }

  function addEvidenceItem(eventName, controlPoint, label, dataUrl, options) {
    options = options || {};
    if (isPrototypeReviewPage()) {
      window._sialPrototypeEvidence = window._sialPrototypeEvidence || {};
      window._sialPrototypeEvidence[eventName] = window._sialPrototypeEvidence[eventName] || [];
      window._sialPrototypeEvidence[eventName].push({
        id: generateId(),
        controlPoint: controlPoint,
        label: label,
        dataUrl: dataUrl,
        hasNovelty: false,
        timestamp: new Date().toLocaleString("es-CO")
      });
      renderEvidenceGallery({ evidence: window._sialPrototypeEvidence }, eventName);
      if (!options.silent) {
        showToast({ type: "success", title: "Evidencia agregada", message: "La foto queda asociada a esta vista." });
      }
      return;
    }
    var fresh = readState();
    fresh.evidence = fresh.evidence || {};
    fresh.evidence[eventName] = fresh.evidence[eventName] || [];
    fresh.evidence[eventName].push({
      id: generateId(),
      controlPoint: controlPoint,
      label: label,
      dataUrl: dataUrl,
      hasNovelty: false,
      noveltyType: "",
      severity: "MEDIA",
      blocking: false,
      noveltyDesc: ""
    });
    writeState(fresh);
    renderEvidenceGallery(fresh, eventName);
    updateEvidenceStatRow(eventName);
    if (!options.silent) {
      showToast({ type: "success", title: "Evidencia capturada", message: label });
    }
  }

  function updateEvidenceStatRow(eventName) {
    var st = readState();
    var count = (st.evidence || {})[eventName] ? (st.evidence[eventName] || []).length : 0;
    document.querySelectorAll("[data-evidence-count='" + eventName + "']").forEach(function(el) {
      el.textContent = String(count);
    });
  }

  function applyEvent(state, eventName, form) {
    const checkedResult = form.querySelector("input[name='resultado']:checked");
    const selectResult = form.querySelector("select[name='resultado']");
    const result = checkedResult?.value || selectResult?.value || "";
    state.flags[eventName] = true;

    if (form.dataset.status) {
      state.status = form.dataset.status;
      state.containerStatus = form.dataset.status;
    }
    if (form.dataset.containerStatus) state.containerStatus = form.dataset.containerStatus;
    if (form.dataset.operationStatus) state.operationStatus = form.dataset.operationStatus;
    if (form.dataset.location) state.containerLocation = form.dataset.location;
    if (form.dataset.vehicleStatus) state.vehicleStatus = form.dataset.vehicleStatus;
    if (form.dataset.hasActiveDispatch) state.hasActiveDispatch = form.dataset.hasActiveDispatch === "true";
    if (form.dataset.vehicleAssociated) state.hasVehicleAssociation = form.dataset.vehicleAssociated === "true";
    if (form.dataset.exported) state.containerExported = form.dataset.exported === "true";

    const deliveryResult = form.querySelector("[name='resultadoEntrega']")?.value;
    if (deliveryResult) {
      state.status = deliveryResult;
      state.containerStatus = deliveryResult;
    }

    if (eventName === "palletBuilt") {
      state.pallets = Math.max(1, state.pallets || 0);
    }
    if (eventName === "palletsLoaded") state.loadedPallets = (state.loadedPallets || 0) + 1;
    if (eventName === "portDelivery") state.vehicleStatus = "DISPONIBLE";

    if (String(result).toLowerCase() === "rechazado") {
      state.alerts = state.alerts || [];
      state.alerts = [{
        event: eventName,
        label: labels[eventName] || eventName,
        timestamp: new Date().toLocaleString("es-CO"),
        status: "ALERTA_AUTOMATICA"
      }, ...state.alerts];
    }

    const detailParts = [form.dataset.detail || ""];
    if (result) detailParts.push(`Resultado: ${result}`);
    detailParts.push(`Usuario: ${state.user}`);
    detailParts.push(`Ubicacion: ${locationLabels[state.containerLocation] || state.containerLocation}`);
    addEvent(state, eventName, detailParts.filter(Boolean).join(" | "));

    state.eventSyncStatus = state.eventSyncStatus || {};
    state.eventSyncStatus[eventName] = "LOCAL_PENDING_SYNC";
    state.eventLocalIds = state.eventLocalIds || {};
    state.eventLocalIds[eventName] = state.eventLocalIds[eventName] || generateId();
    state.eventIdempotencyKeys = state.eventIdempotencyKeys || {};
    state.eventIdempotencyKeys[eventName] = state.eventIdempotencyKeys[eventName] || (
      state.operation + "_" + eventName + "_" + (state.eventLocalIds[eventName] || generateId())
    );

    const inspectionSelect = form.querySelector("select[name='resultado_inspeccion']");
    if (inspectionSelect && inspectionSelect.value) {
      state.inspectionResults = state.inspectionResults || {};
      state.inspectionResults[eventName] = inspectionSelect.value;
      const isBlocking = inspectionSelect.value === "NO_APTO";
      if (isBlocking) {
        state.blockedEvents = state.blockedEvents || {};
        state.blockedEvents[eventName] = "Inspeccion con resultado NO_APTO.";
      }
    }

    const signatureData = form.querySelector("[data-signature-driver]");
    if (signatureData && signatureData.dataset.signatureDriver === "confirmed") {
      state.signatures = state.signatures || {};
      state.signatures[eventName] = state.signatures[eventName] || {};
      if (signatureData.dataset.signerName) {
        state.signatures[eventName].driver = {
          name: signatureData.dataset.signerName,
          document: signatureData.dataset.signerDocument || "",
          actorType: "CONDUCTOR",
          signedAt: new Date().toISOString(),
          method: signatureData.dataset.signatureMethod || "CONFIRMACION"
        };
      }
      if (signatureData.dataset.dispatcherName) {
        state.signatures[eventName].dispatcher = {
          name: signatureData.dataset.dispatcherName,
          document: signatureData.dataset.dispatcherDocument || "",
          actorType: "RADICADOR",
          signedAt: new Date().toISOString(),
          method: "CONFIRMACION"
        };
      }
    }

    const responsibilityField = form.querySelector("[data-responsibility-status]");
    if (responsibilityField) {
      state.responsibilitySessions = state.responsibilitySessions || {};
      state.responsibilitySessions[eventName] = {
        status: responsibilityField.dataset.responsibilityStatus || "RESPONSABILIDAD_ACEPTADA",
        driverName: form.querySelector("[name='conductor']")?.value || "",
        driverDocument: form.querySelector("[name='documentoConductor']")?.value || "",
        truckPlate: form.querySelector("[name='placaCabezote']")?.value || form.querySelector("[name='placa']")?.value || "",
        trailerPlate: form.querySelector("[name='placaRemolque']")?.value || "",
        dispatcherUserId: state.user,
        deliveredAt: new Date().toLocaleString("es-CO"),
        dispatchDatetime: form.querySelector("[name='fechaDespacho']")?.value || ""
      };
    }
  }

  const showToast = (options) => {
    if (window.SialMobileUI && typeof window.SialMobileUI.showToast === "function") {
      window.SialMobileUI.showToast(options);
    }
  };

  function hydrateControlPoints(state) {
    document.querySelectorAll("[data-control-point]").forEach((node) => {
      const eventName = node.dataset.controlPointEvent || "";
      const pointKey = node.dataset.controlPoint;
      if (!eventName || !pointKey) return;
      const points = (state.controlPoints || {})[eventName] || [];
      const pointData = points.find(function(p) { return p.code === pointKey; });
      if (!pointData) return;
      const valueInput = node.querySelector("[data-cp-value]");
      if (valueInput) valueInput.value = pointData.value || "";
      const obsInput = node.querySelector("[data-cp-observation]");
      if (obsInput) obsInput.value = pointData.observation || "";
      const statusEl = node.querySelector("[data-cp-status]");
      if (statusEl) {
        statusEl.textContent = pointData.value || "Pendiente";
        statusEl.className = "sial-pill" + (pointData.value === "SIN_NOVEDAD" ? " success" : pointData.value === "CON_NOVEDAD" ? " warning" : pointData.value === "NO_INSPECCIONABLE" ? " info" : "");
      }
      const photoSlot = node.querySelector("[data-cp-photo]");
      if (photoSlot && pointData.hasPhoto) {
        photoSlot.classList.add("done");
        photoSlot.textContent = "Foto capturada";
      }
    });
  }

  function hydrateSignatures(state) {
    document.querySelectorAll("[data-signature-status]").forEach((node) => {
      const eventName = node.dataset.signatureStatus || "";
      if (!eventName) return;
      const sigs = (state.signatures || {})[eventName];
      if (!sigs) return;
      if (sigs.driver && node.dataset.signatureActor === "driver") {
        node.textContent = "Firmado por " + (sigs.driver.name || "conductor");
        node.className = "sial-pill success";
      }
      if (sigs.dispatcher && node.dataset.signatureActor === "dispatcher") {
        node.textContent = "Firmado por " + (sigs.dispatcher.name || "radicador");
        node.className = "sial-pill success";
      }
    });
  }

  function renderEvidenceGallery(state, eventName) {
    var gallery = document.querySelector("[data-evidence-gallery='" + eventName + "']");
    if (!gallery) return;
    var items = (state.evidence || {})[eventName] || [];
    var countEl = document.querySelector("[data-evidence-count='" + eventName + "']");
    var barEl = document.querySelector("[data-evidence-progress-bar='" + eventName + "']");

    gallery.innerHTML = items.map(function(item) {
      var noveltyBadge = item.hasNovelty ? '<span class="sial-evidence-badge">' + (item.blocking ? '!! ' : '') + 'Novedad</span>' : '';
      var cardClass = 'sial-evidence-card' + (item.hasNovelty ? (item.blocking ? ' has-blocking-novelty' : ' has-novelty') : '');
      var thumbContent = item.dataUrl
        ? '<img src="' + item.dataUrl + '" alt="' + item.label + '" style="width:100%;height:100%;object-fit:cover;border-radius:inherit" loading="lazy">'
        : '<svg class="sial-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
      return [
        '<button class="' + cardClass + '" data-evidence-card data-evidence-id="' + item.id + '" type="button" aria-label="' + item.label + (item.hasNovelty ? ', con novedad' : '') + '">',
        noveltyBadge,
        '<div class="sial-evidence-thumb">' + thumbContent + '</div>',
        '<div class="sial-evidence-label">' + item.label + '</div>',
        '<div class="sial-evidence-actions" style="display:flex;gap:4px;margin-top:2px">',
        '<span class="sial-chip-action" type="button" data-toggle-novelty="' + eventName + '" data-evidence-id="' + item.id + '">' + (item.hasNovelty ? 'Editar' : 'Novedad') + '</span>',
        '<span class="sial-chip-action" type="button" data-remove-evidence="' + eventName + '" data-evidence-id="' + item.id + '" style="color:var(--sial-error)">Quitar</span>',
        '</div>',
        '<div class="sial-novelty-form" data-novelty-form-inline hidden style="margin-top:6px">',
        '<label>Tipo <select data-novelty-type><option value="CONTAMINANTE"' + (item.noveltyType === 'CONTAMINANTE' ? ' selected' : '') + '>Contaminante</option><option value="OBJETO_EXTRANO"' + (item.noveltyType === 'OBJETO_EXTRANO' ? ' selected' : '') + '>Objeto extrano</option><option value="DANO_ESTRUCTURAL"' + (item.noveltyType === 'DANO_ESTRUCTURAL' ? ' selected' : '') + '>Dano estructural</option><option value="MODIFICACION"' + (item.noveltyType === 'MODIFICACION' ? ' selected' : '') + '>Modificacion</option><option value="CORROSION"' + (item.noveltyType === 'CORROSION' ? ' selected' : '') + '>Corrosion</option><option value="OTRO"' + (item.noveltyType === 'OTRO' ? ' selected' : '') + '>Otro</option></select></label>',
        '<label>Severidad <select data-novelty-severity><option value="BAJA"' + (item.severity === 'BAJA' ? ' selected' : '') + '>Baja</option><option value="MEDIA"' + (item.severity === 'MEDIA' ? ' selected' : '') + '>Media</option><option value="ALTA"' + (item.severity === 'ALTA' ? ' selected' : '') + '>Alta</option><option value="CRITICA"' + (item.severity === 'CRITICA' ? ' selected' : '') + '>Critica</option></select></label>',
        '<label class="sial-checkbox-row"><input type="checkbox" data-novelty-blocking' + (item.blocking ? ' checked' : '') + '> Bloqueante</label>',
        '<label>Descripcion <textarea data-novelty-desc placeholder="Describe la novedad">' + (item.noveltyDesc || '') + '</textarea></label>',
        '<button class="sial-btn sial-btn-secondary" type="button" data-save-evidence-novelty="' + eventName + '" data-evidence-id="' + item.id + '" style="min-height:36px;font-size:12px;width:100%">Guardar novedad</button>',
        '</div>',
        '</button>'
      ].join("");
    }).join("");

    if (countEl) countEl.textContent = String(items.length);
    if (barEl) {
      var percentage = eventName === "portInternalInspection" ? Math.min(100, (items.length / 23) * 100) : Math.min(100, (items.length / 14) * 100);
      barEl.style.width = percentage + "%";
      if (eventName === "portInternalInspection") {
        if (items.length < 8) barEl.className = "sial-evidence-progress-fill danger";
        else if (items.length < 15) barEl.className = "sial-evidence-progress-fill warning";
        else barEl.className = "sial-evidence-progress-fill";
      }
    }
  }

  function hydrateEvidence(state) {
    document.querySelectorAll("[data-evidence-gallery]").forEach(function(g) {
      var eventName = g.dataset.evidenceGallery;
      if (eventName) renderEvidenceGallery(state, eventName);
    });
  }

  function hydratePhotoSlots(state) {
    document.querySelectorAll("[data-add-photo]").forEach(function(slot) {
      var key = slot.dataset.addPhoto;
      if (!key || !(state.photos || {})[key]) return;
      var title = photoSlotTitle(slot);
      var dataUrl = (state.photoData || {})[key] || "";
      markPhotoSlotCaptured(slot, title, dataUrl ? [{ dataUrl: dataUrl }] : [], state.photos[key]);
    });
  }

  function boot() {
    const state = readState();
    hydrateSummary(state);
    hydrateGuard(state);
    hydrateTimeline(state);
    hydrateLists(state);
    hydrateAlerts(state);
    hydrateControlPoints(state);
    hydrateSignatures(state);
    hydrateEvidence(state);
    hydratePhotoSlots(state);

    document.addEventListener("click", (event) => {
      const vehicleOption = event.target.closest("[data-vehicle-option]");
      if (vehicleOption) {
        var vid = vehicleOption.dataset.vehicleOption;
        var st = readState();
        var vehicles = st.availableVehicles || [];
        var selected = vehicles.find(function(v) { return v.id === vid; });
        if (!selected) return;
        st.vehicle = selected.truckPlate;
        st.trailer = selected.trailerPlate || "";
        st.driver = selected.driverName;
        st.driverDocument = selected.driverDoc;
        st.carrier = selected.carrier;
        st.selectedVehicleId = vid;
        if (selected.container) st.container = selected.container;
        writeState(st);
        hydrateSummary(st);
        document.querySelectorAll("[data-vehicle-option]").forEach(function(o) {
          o.setAttribute("aria-pressed", String(o.dataset.vehicleOption === vid));
          o.classList.toggle("is-continuing", o.dataset.vehicleOption === vid);
        });
        showToast({ type: "success", title: "Vehiculo seleccionado", message: selected.truckPlate + " - " + selected.driverName });
        return;
      }

      const searchVehicle = event.target.closest("[data-search-vehicle]");
      if (searchVehicle) {
        var field = searchVehicle.dataset.searchVehicle;
        var input = document.querySelector(field);
        if (!input || !input.value.trim()) {
          showToast({ type: "warning", title: "Placa requerida", message: "Ingresa una placa de cabezote para buscar." });
          return;
        }
        var query = input.value.trim().toUpperCase();
        var st = readState();
        var vehicles = st.availableVehicles || [];
        var found = vehicles.find(function(v) { return v.truckPlate.toUpperCase() === query; });
        var statusEl = document.querySelector("[data-search-status]");
        if (!found) {
          if (statusEl) window.SialMobileUI && window.SialMobileUI.setInlineStatus(statusEl, { type: "error", title: "No encontrado", message: "El vehiculo " + query + " no esta registrado en el sistema." });
          showToast({ type: "error", title: "No encontrado", message: "Vehiculo no registrado." });
          return;
        }
        if (!found.active) {
          if (statusEl) window.SialMobileUI && window.SialMobileUI.setInlineStatus(statusEl, { type: "warning", title: "Vehiculo inactivo", message: found.truckPlate + " esta inactivo. Contacte al administrador." });
          showToast({ type: "warning", title: "Vehiculo inactivo", message: found.truckPlate + " no puede operar." });
          return;
        }
        st.vehicle = found.truckPlate;
        st.trailer = found.trailerPlate || "";
        st.driver = found.driverName;
        st.driverDocument = found.driverDoc;
        st.carrier = found.carrier;
        st.selectedVehicleId = found.id;
        if (found.container) st.container = found.container;
        writeState(st);
        hydrateSummary(st);
        if (statusEl) window.SialMobileUI && window.SialMobileUI.setInlineStatus(statusEl, { type: "success", title: "Vehiculo encontrado", message: found.truckPlate + " - " + found.driverName + ". Datos autocompletados." });
        showToast({ type: "success", title: "Vehiculo encontrado", message: found.driverName + " - " + (found.container ? found.container : "Sin contenedor asociado.") });
        return;
      }
      const cpOption = event.target.closest("[data-cp-option]");
      if (cpOption) {
        const container = cpOption.closest("[data-control-point]");
        if (!container) return;
        const value = cpOption.dataset.cpOption;
        const eventName = container.dataset.controlPointEvent || "";
        const pointKey = container.dataset.controlPoint;
        if (!eventName || !pointKey) return;
        if (isPrototypeReviewPage()) {
          container.querySelectorAll("[data-cp-option]").forEach(function(b) { b.classList.remove("active"); });
          cpOption.classList.add("active");
          const statusEl = container.querySelector("[data-cp-status]");
          if (statusEl) {
            statusEl.textContent = value;
            statusEl.className = "sial-pill" + (value === "SIN_NOVEDAD" ? " success" : value === "CON_NOVEDAD" ? " warning" : value === "NO_INSPECCIONABLE" ? " info" : "");
          }
          var needsNovelty = value === "CON_NOVEDAD";
          var needsReason = value === "NO_INSPECCIONABLE";
          var noveltyArea = container.querySelector("[data-cp-novelty-area]");
          if (noveltyArea) noveltyArea.hidden = !needsNovelty;
          var reasonArea = container.querySelector("[data-cp-reason-area]");
          if (reasonArea) reasonArea.hidden = !needsReason;
          return;
        }
        const currentState = readState();
        currentState.controlPoints = currentState.controlPoints || {};
        currentState.controlPoints[eventName] = currentState.controlPoints[eventName] || [];
        const existing = currentState.controlPoints[eventName].find(function(p) { return p.code === pointKey; });
        if (existing) {
          existing.value = value;
        } else {
          currentState.controlPoints[eventName].push({ code: pointKey, name: container.dataset.controlPointName || pointKey, value: value, observation: "", hasPhoto: false });
        }
        writeState(currentState);
        container.querySelectorAll("[data-cp-option]").forEach(function(b) { b.classList.remove("active"); });
        cpOption.classList.add("active");
        const statusEl = container.querySelector("[data-cp-status]");
        if (statusEl) {
          statusEl.textContent = value;
          statusEl.className = "sial-pill" + (value === "SIN_NOVEDAD" ? " success" : value === "CON_NOVEDAD" ? " warning" : value === "NO_INSPECCIONABLE" ? " info" : "");
        }
        var needsNovelty = value === "CON_NOVEDAD";
        var needsReason = value === "NO_INSPECCIONABLE";
        var noveltyArea = container.querySelector("[data-cp-novelty-area]");
        if (noveltyArea) noveltyArea.hidden = !needsNovelty;
        var reasonArea = container.querySelector("[data-cp-reason-area]");
        if (reasonArea) reasonArea.hidden = !needsReason;
      }

      const captureEvidence = event.target.closest("[data-capture-evidence]");
      if (captureEvidence) {
        var evEventName = captureEvidence.dataset.captureEvidence || captureEvidence.dataset.evidenceEvent;
        if (!evEventName) return;
        var st = readState();
        if (isPrototypeReviewPage()) {
          st = { ...st, evidence: window._sialPrototypeEvidence || {} };
        }
        var currentCount = (st.evidence || {})[evEventName] ? (st.evidence[evEventName] || []).length : 0;
        if (evEventName === "portInternalInspection" && currentCount >= 23) {
          showToast({ type: "warning", title: "Maximo alcanzado", message: "Se alcanzo el maximo de 23 fotografias." });
          return;
        }
        var pointList = [];
        document.querySelectorAll("[data-control-point][data-control-point-event='" + evEventName + "']").forEach(function(cp) {
          pointList.push({ label: cp.dataset.controlPointName || cp.dataset.controlPoint, value: cp.dataset.controlPoint });
        });
        if (!pointList.length) { showToast({ type: "warning", title: "Sin puntos", message: "No hay puntos de control disponibles." }); return; }

        function pendingPoints(points) {
          var capturedKeys = {};
          ((st.evidence || {})[evEventName] || []).forEach(function(item) {
            if (item.controlPoint) capturedKeys[item.controlPoint] = true;
          });
          var pending = points.filter(function(point) { return !capturedKeys[point.value]; });
          return pending.length ? pending : points;
        }

        function maxCaptureSlots() {
          if (evEventName === "portInternalInspection") return Math.max(0, 23 - currentCount);
          return pointList.length;
        }

        function captureForPoint(point) {
          var captureApi = photoCaptureApi();
          if (captureApi) {
            captureApi({
              title: point.label,
              eventName: evEventName,
              pointKey: point.value,
              allowMultiple: false,
              maxPhotos: 1,
              onComplete: function(photos) {
                photos.forEach(function(photo) {
                  addEvidenceItem(evEventName, point.value, point.label, photo.dataUrl);
                });
              },
              onCancel: function() {
                showToast({ type: "info", title: "Captura cancelada", message: "No se tomaron fotos." });
              }
            });
          } else {
            addEvidenceItem(evEventName, point.value, point.label, "");
          }
        }

        function captureSequence(points) {
          var slots = maxCaptureSlots();
          var sequence = points.slice(0, slots || points.length);
          if (!sequence.length) {
            showToast({ type: "warning", title: "Maximo alcanzado", message: "No hay cupos disponibles para nuevas fotografias." });
            return;
          }
          var captureApi = photoCaptureApi();
          if (!captureApi) {
            sequence.forEach(function(point) {
              addEvidenceItem(evEventName, point.value, point.label, "", { silent: true });
            });
            showToast({ type: "success", title: "Evidencia marcada", message: sequence.length + " punto(s) quedaron asociados a esta vista." });
            return;
          }
          captureApi({
            title: sequence[0].label,
            eventName: evEventName,
            allowMultiple: true,
            maxPhotos: sequence.length,
            steps: sequence.map(function(point) {
              return {
                title: point.label,
                label: point.label,
                eventName: evEventName,
                pointKey: point.value
              };
            }),
            onPhoto: function(photo, step) {
              var pointKey = step ? step.pointKey : "";
              var pointLabel = step ? (step.label || step.title) : (photo.label || photo.title || "Evidencia");
              addEvidenceItem(evEventName, pointKey, pointLabel, photo.dataUrl, { silent: true });
            },
            onComplete: function(photos) {
              showToast({ type: "success", title: "Evidencia capturada", message: photos.length + " foto(s) guardada(s)." });
            },
            onCancel: function(photos) {
              var count = (photos || []).length;
              if (count) {
                showToast({ type: "info", title: "Captura pausada", message: count + " foto(s) quedaron guardada(s)." });
              } else {
                showToast({ type: "info", title: "Captura cancelada", message: "No se tomaron fotos." });
              }
            }
          });
        }

        var presetPointKey = captureEvidence.dataset.pointKey || captureEvidence.dataset.controlPoint || "";
        var presetPoint = presetPointKey ? pointList.find(function(point) { return point.value === presetPointKey; }) : null;
        if (presetPoint) {
          captureForPoint(presetPoint);
        } else if (pointList.length === 1) {
          captureForPoint(pointList[0]);
        } else {
          captureSequence(pendingPoints(pointList));
        }
        return;
      }

      const removeEvidence = event.target.closest("[data-remove-evidence]");
      if (removeEvidence) {
        var rmEvent = removeEvidence.dataset.removeEvidence;
        var rmId = removeEvidence.dataset.evidenceId;
        if (!rmEvent || !rmId) return;
        if (isPrototypeReviewPage()) {
          window._sialPrototypeEvidence = window._sialPrototypeEvidence || {};
          window._sialPrototypeEvidence[rmEvent] = (window._sialPrototypeEvidence[rmEvent] || []).filter(function(e) { return e.id !== rmId; });
          renderEvidenceGallery({ evidence: window._sialPrototypeEvidence }, rmEvent);
          showToast({ type: "info", title: "Evidencia eliminada", message: "La foto fue retirada de la vista." });
          return;
        }
        var st = readState();
        st.evidence = st.evidence || {};
        st.evidence[rmEvent] = (st.evidence[rmEvent] || []).filter(function(e) { return e.id !== rmId; });
        writeState(st);
        renderEvidenceGallery(st, rmEvent);
        showToast({ type: "info", title: "Evidencia eliminada", message: "La foto fue retirada del registro." });
        return;
      }

      const saveNovelty = event.target.closest("[data-save-evidence-novelty]");
      if (saveNovelty) {
        var svEvent = saveNovelty.dataset.saveEvidenceNovelty;
        var svId = saveNovelty.dataset.evidenceId;
        if (!svEvent || !svId) return;
        var card = saveNovelty.closest("[data-evidence-card]");
        if (!card) return;
        var novType = (card.querySelector("[data-novelty-type]") || {}).value || "OTRO";
        var severity = (card.querySelector("[data-novelty-severity]") || {}).value || "MEDIA";
        var blocking = card.querySelector("[data-novelty-blocking]") ? card.querySelector("[data-novelty-blocking]").checked : false;
        var desc = (card.querySelector("[data-novelty-desc]") || {}).value || "";
        if (isPrototypeReviewPage()) {
          window._sialPrototypeEvidence = window._sialPrototypeEvidence || {};
          window._sialPrototypeEvidence[svEvent] = window._sialPrototypeEvidence[svEvent] || [];
          var prototypeEntry = window._sialPrototypeEvidence[svEvent].find(function(e) { return e.id === svId; });
          if (prototypeEntry) {
            prototypeEntry.hasNovelty = true;
            prototypeEntry.noveltyType = novType;
            prototypeEntry.severity = severity;
            prototypeEntry.blocking = blocking;
            prototypeEntry.noveltyDesc = desc;
          }
          card.querySelector("[data-novelty-form-inline]").hidden = true;
          renderEvidenceGallery({ evidence: window._sialPrototypeEvidence }, svEvent);
          showToast({ type: "success", title: "Novedad asignada", message: "La evidencia queda marcada en esta vista." });
          return;
        }
        var st = readState();
        st.evidence = st.evidence || {};
        st.evidence[svEvent] = st.evidence[svEvent] || [];
        var entry = st.evidence[svEvent].find(function(e) { return e.id === svId; });
        if (entry) {
          entry.hasNovelty = true;
          entry.noveltyType = novType;
          entry.severity = severity;
          entry.blocking = blocking;
          entry.noveltyDesc = desc;
        }
        writeState(st);
        card.querySelector("[data-novelty-form-inline]").hidden = true;
        renderEvidenceGallery(st, svEvent);
        showToast({ type: "success", title: "Novedad asignada", message: "La evidencia quedo marcada con novedad." });
        return;
      }

      const toggleNovelty = event.target.closest("[data-toggle-novelty]");
      if (toggleNovelty) {
        var tgEvent = toggleNovelty.dataset.toggleNovelty;
        var tgId = toggleNovelty.dataset.evidenceId;
        if (!tgEvent || !tgId) return;
        var card = toggleNovelty.closest("[data-evidence-card]");
        if (!card) return;
        var formEl = card.querySelector("[data-novelty-form-inline]");
        if (formEl) formEl.hidden = !formEl.hidden;
        return;
      }

      const dispatchSignature = event.target.closest("[data-confirm-signature]");
      if (dispatchSignature) {
        const target = dispatchSignature.dataset.confirmSignature;
        const nameInput = document.querySelector("[data-signature-name-input]");
        const docInput = document.querySelector("[data-signature-doc-input]");
        if (target === "driver") {
          const driverBtn = document.querySelector("[data-signature-driver]");
          if (driverBtn && nameInput) {
            driverBtn.dataset.signatureDriver = "confirmed";
            driverBtn.dataset.signerName = nameInput.value || "Conductor";
            driverBtn.dataset.signerDocument = docInput ? docInput.value : "";
            driverBtn.dataset.signatureMethod = "CONFIRMACION";
            driverBtn.textContent = "Firmado: " + (nameInput.value || "Conductor");
            driverBtn.className = "sial-btn sial-btn-primary sial-btn-full";
          }
        }
        if (target === "dispatcher") {
          const dispatcherBtn = document.querySelector("[data-signature-dispatcher]");
          if (dispatcherBtn && nameInput) {
            dispatcherBtn.dataset.signatureDispatcher = "confirmed";
            dispatcherBtn.dataset.dispatcherName = nameInput.value || "Radicador";
            dispatcherBtn.dataset.dispatcherDocument = docInput ? docInput.value : "";
            dispatcherBtn.textContent = "Firmado: " + (nameInput.value || "Radicador");
            dispatcherBtn.className = "sial-btn sial-btn-primary sial-btn-full";
          }
        }
        showToast({ type: "success", title: "Firma registrada", message: "La confirmacion ha sido guardada." });
      }
    });

    document.addEventListener("submit", (event) => {
      const form = event.target.closest("[data-flow-form]");
      if (!form) return;
      event.preventDefault();
      clearInline(form);
      if (isPrototypeReviewForm(form)) {
        showToast({
          type: "success",
          title: "Vista validada",
          message: "La propuesta queda en esta pantalla para revision."
        });
        return;
      }
      const state = readState();
      const eventName = form.dataset.event;
      const missing = missingRequirements(eventName, state);
      if (missing.length) {
        showInline(form, `Falta completar: ${missing.map((key) => labels[key] || key).join(", ")}.`);
        showToast({ type: "warning", title: "Flujo bloqueado", message: "Completa el evento anterior requerido." });
        return;
      }
      const ruleError = validateFormRules(form, state, eventName);
      if (ruleError) {
        showInline(form, ruleError);
        showToast({ type: "warning", title: "Validacion requerida", message: ruleError });
        return;
      }
      const invalid = Array.from(form.querySelectorAll("[required]")).find((field) => !field.value);
      if (invalid) {
        invalid.focus();
        showInline(form, "Completa los campos obligatorios antes de registrar.");
        return;
      }

      form.querySelectorAll("[data-control-point]").forEach(function(container) {
        var valueInput = container.querySelector("[data-cp-value]");
        if (!valueInput) return;
        var val = valueInput.value;
        var pointKey = container.dataset.controlPoint;
        var pointName = container.dataset.controlPointName || pointKey;
        state.controlPoints = state.controlPoints || {};
        state.controlPoints[eventName] = state.controlPoints[eventName] || [];
        var existing = state.controlPoints[eventName].find(function(p) { return p.code === pointKey; });
        if (existing) {
          existing.value = val;
        } else {
          state.controlPoints[eventName].push({ code: pointKey, name: pointName, value: val, observation: "", hasPhoto: false });
        }
      });

      var evItems = (state.evidence || {})[eventName] || [];
      evItems.forEach(function(ev) {
        if (ev.hasNovelty) {
          state.novelties = state.novelties || {};
          state.novelties[eventName] = state.novelties[eventName] || [];
          if (!state.novelties[eventName].some(function(n) { return n.evidenceId === ev.id; })) {
            state.novelties[eventName].push({
              evidenceId: ev.id,
              controlPoint: ev.controlPoint,
              controlPointName: ev.label,
              type: ev.noveltyType,
              severity: ev.severity,
              isBlocking: ev.blocking,
              description: ev.noveltyDesc
            });
          }
        }
      });

      applyEvent(state, eventName, form);
      writeState(state);
      hydrateSummary(state);
      hydrateGuard(state);
      hydrateTimeline(state);
      hydrateLists(state);
      hydrateAlerts(state);
      hydrateControlPoints(state);
      hydrateSignatures(state);
      hydrateEvidence(state);

      const inspResult = form.querySelector("select[name='resultado_inspeccion']");
      if (inspResult && inspResult.value) {
        var inspMsg = "Inspeccion registrada: " + inspResult.value;
        showToast({ type: "success", title: "Evento registrado", message: inspMsg });
      } else {
        var selectResult = form.querySelector("select[name='resultado']");
        if (String(selectResult?.value || "").toLowerCase() === "rechazado") {
          showToast({ type: "warning", title: "Alerta generada", message: "La inspeccion rechazada queda marcada para gestion." });
        } else {
          showToast({ type: "success", title: "Evento registrado", message: labels[eventName] || "Registro completado." });
        }
      }
      if (form.dataset.next) {
        window.setTimeout(function() { window.location.href = form.dataset.next; }, 650);
      }
    });

    document.addEventListener("change", (event) => {
      const field = event.target.closest("[data-flow-form] input, [data-flow-form] select, [data-flow-form] textarea");
      if (!field) return;
      const form = field.closest("[data-flow-form]");
      if (!form) return;
      if (isPrototypeReviewForm(form)) return;
      const state = readState();
      const eventName = form.dataset.event;
      if (!eventName || state.flags[eventName]) return;
      state.eventSyncStatus = state.eventSyncStatus || {};
      if (!state.eventSyncStatus[eventName]) {
        state.eventSyncStatus[eventName] = "LOCAL_DRAFT";
        state.eventLocalIds = state.eventLocalIds || {};
        state.eventLocalIds[eventName] = state.eventLocalIds[eventName] || generateId();
        state.eventIdempotencyKeys = state.eventIdempotencyKeys || {};
        state.eventIdempotencyKeys[eventName] = state.eventIdempotencyKeys[eventName] || (
          state.operation + "_" + eventName + "_" + (state.eventLocalIds[eventName] || generateId())
        );
        writeState(state);
        hydrateSummary(state);
      }
    });

    document.addEventListener("click", (event) => {
      const retryBtn = event.target.closest("[data-retry-sync]");
      if (retryBtn) {
        const eventName = retryBtn.dataset.retrySync;
        if (!eventName) return;
        const state = readState();
        var offlineAvailable = navigator.onLine;
        if (!offlineAvailable) {
          showToast({ type: "warning", title: "Sin conexion", message: "Conectate a internet para reintentar la sincronizacion." });
          return;
        }
        state.eventSyncStatus = state.eventSyncStatus || {};
        state.eventSyncStatus[eventName] = "SYNCING";
        writeState(state);
        hydrateSummary(state);
        showToast({ type: "info", title: "Sincronizando...", message: "Enviando evento a servidor." });
        window.setTimeout(function() {
          var fresh = readState();
          fresh.eventSyncStatus = fresh.eventSyncStatus || {};
          var success = Math.random() > 0.2;
          fresh.eventSyncStatus[eventName] = success ? "SYNCED" : "SYNC_FAILED";
          writeState(fresh);
          hydrateSummary(fresh);
          if (success) {
            showToast({ type: "success", title: "Sincronizado", message: "El evento fue confirmado por el servidor." });
          } else {
            showToast({ type: "error", title: "Error de sincronizacion", message: "El servidor no pudo procesar el evento. Reintenta." });
          }
        }, 1200);
        return;
      }

      const conflictBtn = event.target.closest("[data-resolve-conflict]");
      if (conflictBtn) {
        var cName = conflictBtn.dataset.resolveConflict;
        showToast({ type: "info", title: "Conflicto resuelto", message: "Se descarta la version local y se usa la del servidor." });
        var st = readState();
        st.eventSyncStatus = st.eventSyncStatus || {};
        st.eventSyncStatus[cName] = "SYNCED";
        writeState(st);
        hydrateSummary(st);
      }
    });

    document.addEventListener("click", (event) => {
      const photo = event.target.closest("[data-add-photo]");
      if (photo) {
        if (pageHasBlockingRequirement()) {
          showToast({ type: "warning", title: "Flujo bloqueado", message: "Completa primero el evento requerido." });
          return;
        }
        const key = photo.dataset.addPhoto;
        if (!key) return;
        const slot = photo.closest(".sial-evidence-slot") || photo;
        const title = photoSlotTitle(slot);
        const captureApi = photoCaptureApi();
        if (captureApi) {
          const form = photo.closest("[data-flow-form]");
          captureApi({
            title: title,
            eventName: form ? (form.dataset.event || "") : "",
            pointKey: key,
            allowMultiple: false,
            maxPhotos: 1,
            onComplete: function(photos) {
              if (!photos || !photos.length) return;
              if (isPrototypeReviewPage()) {
                markPhotoSlotCaptured(slot, title, photos, photos.length);
                showToast({ type: "success", title: "Foto agregada", message: "Evidencia asociada a la vista." });
                return;
              }
              const state = readState();
              state.photos[key] = (state.photos[key] || 0) + photos.length;
              state.photoData = state.photoData || {};
              state.photoData[key] = photos[photos.length - 1].dataUrl || "";
              writeState(state);
              hydrateSummary(state);
              markPhotoSlotCaptured(slot, title, photos, state.photos[key]);
              showToast({ type: "success", title: "Foto agregada", message: "Evidencia asociada al registro." });
            },
            onCancel: function() {
              showToast({ type: "info", title: "Captura cancelada", message: "No se tomaron fotos." });
            }
          });
          return;
        }
        const state = readState();
        state.photos[key] = (state.photos[key] || 0) + 1;
        writeState(state);
        hydrateSummary(state);
        markPhotoSlotCaptured(slot, title, [], state.photos[key]);
        showToast({ type: "success", title: "Foto agregada", message: "Evidencia asociada al registro." });
      }

      const photoSet = event.target.closest("[data-add-photo-set]");
      if (photoSet) {
        if (pageHasBlockingRequirement()) {
          showToast({ type: "warning", title: "Flujo bloqueado", message: "Completa primero el evento requerido." });
          return;
        }
        const keys = photoSet.dataset.addPhotoSet.split(",").map((key) => key.trim()).filter(Boolean);
        const count = Number(photoSet.dataset.photoSetCount || 1);
        const setTitle = photoSet.dataset.photoTitle || photoSet.textContent.trim() || "Evidencia fotografica";
        const captureApi = photoCaptureApi();
        if (captureApi) {
          const form = photoSet.closest("[data-flow-form]");
          captureApi({
            title: setTitle,
            eventName: form ? (form.dataset.event || "") : "",
            pointKey: keys.join(","),
            allowMultiple: true,
            maxPhotos: Math.max(1, count),
            onComplete: function(photos) {
              if (!photos || !photos.length) return;
              if (isPrototypeReviewPage()) {
                showToast({ type: "success", title: "Evidencia completada", message: "Fotos asociadas a la vista." });
                return;
              }
              const state = readState();
              state.photoData = state.photoData || {};
              keys.forEach((key) => {
                state.photos[key] = Math.max(state.photos[key] || 0, photos.length);
                state.photoData[key] = photos[Math.min(photos.length - 1, state.photos[key] - 1)]?.dataUrl || photos[photos.length - 1].dataUrl || "";
              });
              writeState(state);
              hydrateSummary(state);
              showToast({ type: "success", title: "Evidencia completada", message: `${photos.length} foto(s) asociada(s).` });
            },
            onCancel: function() {
              showToast({ type: "info", title: "Captura cancelada", message: "No se tomaron fotos." });
            }
          });
          return;
        }
        const state = readState();
        keys.forEach((key) => {
          state.photos[key] = Math.max(state.photos[key] || 0, count);
        });
        writeState(state);
        hydrateSummary(state);
        showToast({ type: "success", title: "Evidencia completada", message: `${count} foto(s) por punto obligatorio.` });
      }

      const scan = event.target.closest("[data-add-box]");
      if (scan) {
        if (pageHasBlockingRequirement()) {
          showToast({ type: "warning", title: "Flujo bloqueado", message: "Completa primero el evento requerido." });
          return;
        }
        const state = readState();
        const input = document.querySelector("[data-box-code-input]");
        const code = (input?.value || `SSCC-${String((state.boxes || 0) + 1).padStart(4, "0")}`).trim();
        if ((state.boxes || 0) >= 48) {
          showToast({ type: "warning", title: "Capacidad completa", message: "El pallet ya alcanzo la capacidad maxima definida." });
          return;
        }
        if ((state.boxCodes || []).includes(code)) {
          showToast({ type: "warning", title: "Caja duplicada", message: "La caja ya esta asociada a este pallet." });
          return;
        }
        state.boxCodes = [...(state.boxCodes || []), code];
        state.boxes = (state.boxes || 0) + 1;
        writeState(state);
        hydrateSummary(state);
        hydrateLists(state);
        if (input) input.value = "";
        showToast({ type: "success", title: "Caja registrada", message: `Total cajas: ${state.boxes}.` });
      }

      const removeBox = event.target.closest("[data-remove-box]");
      if (removeBox) {
        const state = readState();
        const index = Number(removeBox.dataset.removeBox);
        state.boxCodes = (state.boxCodes || []).filter((_, itemIndex) => itemIndex !== index);
        state.boxes = state.boxCodes.length;
        writeState(state);
        hydrateSummary(state);
        hydrateLists(state);
        showToast({ type: "info", title: "Caja eliminada", message: "La caja fue retirada del pallet." });
      }

      const editBox = event.target.closest("[data-edit-box]");
      if (editBox) {
        const state = readState();
        const index = Number(editBox.dataset.editBox);
        const input = document.querySelector("[data-box-code-input]");
        if (input) input.value = (state.boxCodes || [])[index] || "";
        state.boxCodes = (state.boxCodes || []).filter((_, itemIndex) => itemIndex !== index);
        state.boxes = state.boxCodes.length;
        writeState(state);
        hydrateSummary(state);
        hydrateLists(state);
        showToast({ type: "info", title: "Caja lista para editar", message: "Ajusta el codigo y vuelve a registrarla." });
      }

      const reset = event.target.closest("[data-reset-flow]");
      if (reset) {
        localStorage.removeItem(stateKey);
        showToast({ type: "info", title: "Flujo reiniciado", message: "Datos restaurados." });
        window.setTimeout(() => window.location.reload(), 450);
      }
    });
  }

  boot();
})();
