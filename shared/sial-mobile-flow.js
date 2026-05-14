(function () {
  const stateKey = "sial-mobile-workflow";

  const defaults = {
    container: "SIALU1234567",
    vehicle: "TUL458",
    driver: "Carlos Mendoza",
    operation: "EXP-2026-0418",
    reference: "BAN-REF-001",
    finca: "Finca Santa Isabel",
    user: "Maria Operadora",
    supervisor: "Laura Pineda",
    carrier: "Transbanasan",
    order: "ORD-ZE-2041",
    journey: "VIAJE-7751",
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
    alerts: [],
    flags: {},
    events: []
  };

  const requirements = {
    zeReception: [],
    portExternalInspection: ["zeReception"],
    portInternalInspection: ["zeReception"],
    zeDispatch: ["zeReception"],
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
    zeReception: "Recepcion en ZE",
    portExternalInspection: "Inspeccion externa en ZE",
    portInternalInspection: "Inspeccion interna en ZE",
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
    document.querySelectorAll("[data-flow-driver]").forEach((node) => { node.textContent = state.driver; });
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
      ["zeReception", "../puerto-ze/recepcion-ze.html", "Registrar recepcion ZE", "Iniciar trazabilidad del vehiculo en zona externa."],
      ["portExternalInspection", "../puerto-ze/inspeccion-externa.html", "Inspeccion externa ZE", "Completar evidencia externa del contenedor."],
      ["portInternalInspection", "../puerto-ze/inspeccion-interna.html", "Inspeccion interna ZE", "Validar interior con rango de fotos requerido."],
      ["zeDispatch", "../puerto-ze/despacho-finca.html", "Despachar a finca", "Registrar salida desde ZE hacia finca."],
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
        `<span>${event.timestamp} - ${event.sync}</span>`,
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
      return `El contenedor no esta en la ubicacion requerida: ${form.dataset.assertContainerLocation}.`;
    }
    if (form.dataset.assertContainerStatusAny && !hasAny(state.containerStatus, form.dataset.assertContainerStatusAny)) {
      return `El estado actual del contenedor no permite este registro: ${state.containerStatus}.`;
    }
    if (form.dataset.assertVehicleAssociated === "true" && !state.hasVehicleAssociation) {
      return "El contenedor no tiene vehiculo asociado.";
    }
    if (form.dataset.assertNotExported === "true" && state.containerExported) {
      return "El contenedor ya fue exportado.";
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
  }

  const showToast = (options) => {
    if (window.SialMobileUI && typeof window.SialMobileUI.showToast === "function") {
      window.SialMobileUI.showToast(options);
    }
  };

  function boot() {
    const state = readState();
    hydrateSummary(state);
    hydrateGuard(state);
    hydrateTimeline(state);
    hydrateLists(state);
    hydrateAlerts(state);

    document.addEventListener("submit", (event) => {
      const form = event.target.closest("[data-flow-form]");
      if (!form) return;
      event.preventDefault();
      clearInline(form);
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
      applyEvent(state, eventName, form);
      writeState(state);
      hydrateSummary(state);
      hydrateGuard(state);
      hydrateTimeline(state);
      hydrateLists(state);
      hydrateAlerts(state);
      const selectResult = form.querySelector("select[name='resultado']");
      if (String(selectResult?.value || "").toLowerCase() === "rechazado") {
        showToast({ type: "warning", title: "Alerta generada", message: "La inspeccion rechazada queda marcada para gestion." });
      } else {
        showToast({ type: "success", title: "Evento registrado", message: labels[eventName] || "Registro completado." });
      }
      if (form.dataset.next) {
        window.setTimeout(() => { window.location.href = form.dataset.next; }, 650);
      }
    });

    document.addEventListener("click", (event) => {
      const photo = event.target.closest("[data-add-photo]");
      if (photo) {
        if (pageHasBlockingRequirement()) {
          showToast({ type: "warning", title: "Flujo bloqueado", message: "Completa primero el evento requerido." });
          return;
        }
        const state = readState();
        const key = photo.dataset.addPhoto;
        state.photos[key] = (state.photos[key] || 0) + 1;
        writeState(state);
        hydrateSummary(state);
        const slot = photo.closest(".sial-evidence-slot");
        if (slot) {
          slot.classList.add("done");
          slot.textContent = `Foto ${state.photos[key]}`;
        }
        showToast({ type: "success", title: "Foto agregada", message: "Evidencia asociada al registro." });
      }

      const photoSet = event.target.closest("[data-add-photo-set]");
      if (photoSet) {
        if (pageHasBlockingRequirement()) {
          showToast({ type: "warning", title: "Flujo bloqueado", message: "Completa primero el evento requerido." });
          return;
        }
        const state = readState();
        const keys = photoSet.dataset.addPhotoSet.split(",").map((key) => key.trim()).filter(Boolean);
        const count = Number(photoSet.dataset.photoSetCount || 1);
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
