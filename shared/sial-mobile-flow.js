(function () {
  const stateKey = "sial-mobile-workflow";
  const zeReceptionEvidenceKey = "ze-rec-evidencia-inicial";
  const zeReceptionEvidenceMax = 6;
  var activePhotoViewerKeydown = null;

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
    inspectionWeek: "34 / 2026",
    inspectionTape: "AZ",
    inspectionContainerType: "Contenedor reefer aislado",
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
    photoCollections: {},
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
    ],
    selectedInspectionContainers: {},
    availableContainers: [
      {
        id: "C-ZE-EXT-001",
        container: "SIALU1234567",
        operation: "EXP-2026-0418",
        reference: "BAN-REF-001",
        order: "ORD-ZE-2041",
        journey: "VIAJE-7751",
        vehicle: "TUL458",
        trailer: "RML789",
        driver: "Carlos Mendoza",
        driverDocument: "1012345678",
        carrier: "Transbanasan",
        ze: "ZE Puerto Norte",
        finca: "Finca Santa Isabel",
        containerStatus: "RECIBIDO_EN_ZE",
        operationStatus: "RECIBIDO_EN_ZE",
        containerLocation: "ZE",
        vehicleStatus: "RECIBIDO_ZE",
        active: true,
        nextInspectionEvent: "portExternalInspection",
        flags: { zeReception: true }
      },
      {
        id: "C-ZE-INT-001",
        container: "SIALB7654321",
        operation: "EXP-2026-0422",
        reference: "BAN-REF-004",
        order: "ORD-ZE-2048",
        journey: "VIAJE-7764",
        vehicle: "XYZ789",
        trailer: "LMN012",
        driver: "Pedro Gutierrez",
        driverDocument: "1034567890",
        carrier: "Transbanasan",
        ze: "ZE Puerto Norte",
        finca: "Finca Santa Isabel",
        containerStatus: "INSPECCION_EXTERNA_APTA",
        operationStatus: "INSPECCION_EXTERNA_APTA",
        containerLocation: "ZE",
        vehicleStatus: "EN_ZE",
        active: true,
        nextInspectionEvent: "portInternalInspection",
        flags: { zeReception: true, portExternalInspection: true }
      },
      {
        id: "C-FINCA-EXT-001",
        container: "SIALF4455667",
        operation: "EXP-2026-0430",
        reference: "BAN-REF-011",
        order: "ORD-FIN-1182",
        journey: "VIAJE-7801",
        vehicle: "MNO456",
        trailer: "TRF221",
        driver: "Diana Torres",
        driverDocument: "1056789012",
        carrier: "Logistica Sur",
        ze: "ZE Puerto Norte",
        finca: "Finca El Retiro",
        containerStatus: "RECIBIDO_EN_FINCA",
        operationStatus: "RECIBIDO_EN_FINCA",
        containerLocation: "FINCA",
        vehicleStatus: "EN_FINCA",
        active: true,
        nextInspectionEvent: "farmExternalInspection",
        flags: { zeDispatch: true, farmReception: true }
      },
      {
        id: "C-FINCA-INT-001",
        container: "SIALF9988776",
        operation: "EXP-2026-0437",
        reference: "BAN-REF-014",
        order: "ORD-FIN-1190",
        journey: "VIAJE-7812",
        vehicle: "JKL321",
        trailer: "TRF544",
        driver: "Hector Ruiz",
        driverDocument: "1067890123",
        carrier: "Transportes Norte",
        ze: "ZE Puerto Norte",
        finca: "Finca Las Palmas",
        containerStatus: "INSPECCION_EXTERNA_FINCA_APTA",
        operationStatus: "INSPECCION_EXTERNA_FINCA_APTA",
        containerLocation: "FINCA",
        vehicleStatus: "EN_FINCA",
        active: true,
        nextInspectionEvent: "farmInternalInspection",
        flags: { zeDispatch: true, farmReception: true, farmExternalInspection: true }
      },
      {
        id: "C-ZE-EXT-002",
        container: "SIALU7788990",
        operation: "EXP-2026-0444",
        reference: "BAN-REF-018",
        order: "ORD-ZE-2059",
        journey: "VIAJE-7830",
        vehicle: "BNX234",
        trailer: "TRL118",
        driver: "Nicolas Mejia",
        driverDocument: "1078901234",
        carrier: "Transbanasan",
        ze: "ZE Terminal Sur",
        finca: "Finca Santa Isabel",
        containerStatus: "RECIBIDO_EN_ZE",
        operationStatus: "RECIBIDO_EN_ZE",
        containerLocation: "ZE",
        vehicleStatus: "RECIBIDO_ZE",
        active: true,
        nextInspectionEvent: "portExternalInspection",
        flags: { zeReception: true }
      },
      {
        id: "C-ZE-EXT-003",
        container: "SIALU6677881",
        operation: "EXP-2026-0445",
        reference: "BAN-REF-019",
        order: "ORD-ZE-2060",
        journey: "VIAJE-7831",
        vehicle: "CTG908",
        trailer: "TRL442",
        driver: "Paola Rivas",
        driverDocument: "1089012345",
        carrier: "Logistica Sur",
        ze: "ZE Puerto Norte",
        finca: "Finca El Retiro",
        containerStatus: "RECIBIDO_EN_ZE",
        operationStatus: "RECIBIDO_EN_ZE",
        containerLocation: "ZE",
        vehicleStatus: "RECIBIDO_ZE",
        active: true,
        nextInspectionEvent: "portExternalInspection",
        flags: { zeReception: true }
      },
      {
        id: "C-ZE-INT-002",
        container: "SIALB2244668",
        operation: "EXP-2026-0450",
        reference: "BAN-REF-022",
        order: "ORD-ZE-2064",
        journey: "VIAJE-7838",
        vehicle: "BGA551",
        trailer: "TRL774",
        driver: "Andres Molina",
        driverDocument: "1090123456",
        carrier: "Transportes Norte",
        ze: "ZE Bananera",
        finca: "Finca Las Palmas",
        containerStatus: "INSPECCION_EXTERNA_APTA",
        operationStatus: "INSPECCION_EXTERNA_APTA",
        containerLocation: "ZE",
        vehicleStatus: "EN_ZE",
        active: true,
        nextInspectionEvent: "portInternalInspection",
        flags: { zeReception: true, portExternalInspection: true }
      },
      {
        id: "C-FINCA-EXT-002",
        container: "SIALF1122334",
        operation: "EXP-2026-0457",
        reference: "BAN-REF-027",
        order: "ORD-FIN-1201",
        journey: "VIAJE-7845",
        vehicle: "SMR782",
        trailer: "TRF661",
        driver: "Julian Mora",
        driverDocument: "1101234567",
        carrier: "Transbanasan",
        ze: "ZE Puerto Norte",
        finca: "Finca Santa Isabel",
        containerStatus: "RECIBIDO_EN_FINCA",
        operationStatus: "RECIBIDO_EN_FINCA",
        containerLocation: "FINCA",
        vehicleStatus: "EN_FINCA",
        active: true,
        nextInspectionEvent: "farmExternalInspection",
        flags: { zeDispatch: true, farmReception: true }
      },
      {
        id: "C-FINCA-EXT-003",
        container: "SIALF5566778",
        operation: "EXP-2026-0461",
        reference: "BAN-REF-030",
        order: "ORD-FIN-1208",
        journey: "VIAJE-7851",
        vehicle: "VUP315",
        trailer: "TRF902",
        driver: "Martha Leon",
        driverDocument: "1112345678",
        carrier: "Logistica Sur",
        ze: "ZE Terminal Sur",
        finca: "Finca El Retiro",
        containerStatus: "RECIBIDO_EN_FINCA",
        operationStatus: "RECIBIDO_EN_FINCA",
        containerLocation: "FINCA",
        vehicleStatus: "EN_FINCA",
        active: true,
        nextInspectionEvent: "farmExternalInspection",
        flags: { zeDispatch: true, farmReception: true }
      },
      {
        id: "C-FINCA-INT-002",
        container: "SIALF8899001",
        operation: "EXP-2026-0468",
        reference: "BAN-REF-035",
        order: "ORD-FIN-1215",
        journey: "VIAJE-7859",
        vehicle: "RIO620",
        trailer: "TRF120",
        driver: "Sergio Paez",
        driverDocument: "1123456789",
        carrier: "Transportes Norte",
        ze: "ZE Bananera",
        finca: "Finca Las Palmas",
        containerStatus: "INSPECCION_EXTERNA_FINCA_APTA",
        operationStatus: "INSPECCION_EXTERNA_FINCA_APTA",
        containerLocation: "FINCA",
        vehicleStatus: "EN_FINCA",
        active: true,
        nextInspectionEvent: "farmInternalInspection",
        flags: { zeDispatch: true, farmReception: true, farmExternalInspection: true }
      },
      {
        id: "C-ZE-INT-003",
        container: "SIALB3344559",
        operation: "EXP-2026-0472",
        reference: "BAN-REF-038",
        order: "ORD-ZE-2072",
        journey: "VIAJE-7864",
        vehicle: "MTR417",
        trailer: "TRL335",
        driver: "Camila Suarez",
        driverDocument: "1134567890",
        carrier: "Transbanasan",
        ze: "ZE Puerto Norte",
        finca: "Finca Santa Isabel",
        containerStatus: "INSPECCION_EXTERNA_APTA",
        operationStatus: "INSPECCION_EXTERNA_APTA",
        containerLocation: "ZE",
        vehicleStatus: "EN_ZE",
        active: true,
        nextInspectionEvent: "portInternalInspection",
        flags: { zeReception: true, portExternalInspection: true }
      }
    ]
  };

  const inspectionContainerPageSize = 4;

  const requirements = {
    zeReception: [],
    portExternalInspection: ["zeReception"],
    portInternalInspection: ["zeReception", "portExternalInspection"],
    zeDispatch: ["zeReception", "portExternalInspection", "portInternalInspection"],
    farmReception: ["zeDispatch"],
    farmExternalInspection: ["farmReception"],
    farmInternalInspection: ["farmReception"],
    responsibility: ["farmReception"],
    palletBuilt: [],
    palletsLoaded: ["farmReception"],
    containerClosed: ["farmReception", "palletsLoaded"],
    farmDispatch: ["containerClosed"],
    zeReturnReception: ["farmDispatch"],
    zePalletUnload: ["zeReturnReception"],
    zePalletReassembly: ["zePalletUnload"],
    zeConsolidatedLoad: ["zePalletReassembly"],
    portDispatch: ["zeConsolidatedLoad"],
    portReception: ["portDispatch"],
    portDelivery: ["portReception"]
  };

  const labels = {
    zeReception: "Recepción en ZE",
    portExternalInspection: "Inspeccion externa ZE",
    portInternalInspection: "Inspeccion interna ZE",
    zeDispatch: "Salida ZE",
    farmReception: "Ingreso en Finca",
    farmExternalInspection: "Inspeccion externa en finca",
    farmInternalInspection: "Inspeccion interna en finca",
    responsibility: "Sesion de responsabilidad",
    palletBuilt: "HU591 - Armado de pallet",
    palletsLoaded: "HU332 - Cargue contenedor",
    containerClosed: "Cierre de contenedor",
    farmDispatch: "Salida de Finca",
    zeReturnReception: "Recepcion en ZE desde finca",
    zePalletUnload: "HU342 - Descarga de pallets en ZE",
    zePalletReassembly: "HU344 - Rearmado de pallets en ZE",
    zeConsolidatedLoad: "HU347 - Cargue consolidado en ZE",
    portDispatch: "Despacho a puerto",
    portReception: "Recepcion en puerto",
    portDelivery: "Entrega final en puerto"
  };

  const inspectionEvents = [
    "portExternalInspection",
    "portInternalInspection",
    "farmExternalInspection",
    "farmInternalInspection"
  ];

  const evidencePointCatalog = {
    portExternalInspection: [
      { value: "ext-vista-frontal", label: "Vista general frontal" },
      { value: "ext-vista-posterior", label: "Vista general posterior" },
      { value: "ext-pared-izq", label: "Pared lateral izquierda" },
      { value: "ext-pared-der", label: "Pared lateral derecha" },
      { value: "ext-pared-frontal", label: "Pared frontal" },
      { value: "ext-techo", label: "Techo exterior" },
      { value: "ext-puertas", label: "Puertas exteriores" },
      { value: "ext-piso", label: "Piso/base externa visible" },
      { value: "ext-esquina-si", label: "Esquina sup. izq." },
      { value: "ext-esquina-sd", label: "Esquina superior derecha" },
      { value: "ext-esquina-ii", label: "Esquina inferior izquierda" },
      { value: "ext-esquina-id", label: "Esquina inferior derecha" },
      { value: "ext-bisagras", label: "Bisagras" },
      { value: "ext-barras-cierre", label: "Barras de cierre" },
      { value: "ext-sellos", label: "Sellos / aseguramiento" },
      { value: "ext-estado-general", label: "Estado general estructura" }
    ],
    portInternalInspection: [
      { value: "int-vista-puerta", label: "Vista general desde puerta" },
      { value: "int-pared-izq", label: "Pared interna izquierda" },
      { value: "int-pared-der", label: "Pared interna derecha" },
      { value: "int-pared-frontal", label: "Pared frontal interna" },
      { value: "int-piso-inicial", label: "Piso zona inicial" },
      { value: "int-piso-medio", label: "Piso zona media" },
      { value: "int-piso-final", label: "Piso zona final" },
      { value: "int-techo-inicial", label: "Techo zona inicial" },
      { value: "int-techo-medio", label: "Techo zona media" },
      { value: "int-techo-final", label: "Techo zona final" },
      { value: "int-puerta-izq", label: "Puerta interna izquierda" },
      { value: "int-puerta-der", label: "Puerta interna derecha" },
      { value: "int-esquina-si", label: "Esq. int. sup. izq." },
      { value: "int-esquina-sd", label: "Esq. int. sup. der." },
      { value: "int-esquina-ii", label: "Esq. int. inf. izq." },
      { value: "int-esquina-id", label: "Esq. int. inf. der." },
      { value: "int-cableado", label: "Cableado / ductos visibles" },
      { value: "int-novedad-adicional", label: "Evidencia novedad adicional" }
    ],
    farmExternalInspection: Array.from({ length: 12 }, function(_, index) {
      var position = index + 1;
      return { value: "farm-ext-evidence-" + position, label: "Evidencia " + position };
    }),
    farmInternalInspection: Array.from({ length: 16 }, function(_, index) {
      var position = index + 1;
      return { value: "farm-int-evidence-" + position, label: "Evidencia " + position };
    }),
    zeDispatch: [
      { value: "dispatch-vehiculo", label: "Vehículo y placas" },
      { value: "dispatch-contenedor", label: "Contenedor y sellos" },
      { value: "dispatch-documentacion", label: "Documentación de salida" },
      { value: "dispatch-carga", label: "Carga asegurada" },
      { value: "dispatch-zona", label: "Zona de salida" },
      { value: "dispatch-novedad", label: "Novedad de salida" }
    ],
    farmDispatch: [
      { value: "farm-dispatch-vehiculo", label: "Vehículo y placas" },
      { value: "farm-dispatch-contenedor", label: "Contenedor y sellos" },
      { value: "farm-dispatch-documentacion", label: "Documentación de salida" },
      { value: "farm-dispatch-carga", label: "Carga asegurada" },
      { value: "farm-dispatch-zona", label: "Zona de salida" },
      { value: "farm-dispatch-novedad", label: "Novedad de salida" }
    ]
  };

  const evidenceCaptureLimits = {
    portExternalInspection: 12,
    portInternalInspection: 23,
    farmExternalInspection: 12,
    farmInternalInspection: 16,
    zeDispatch: 6,
    farmDispatch: 6
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

  function setNamedFieldValue(names, value) {
    names.forEach(function(name) {
      document.querySelectorAll("[data-flow-form] [name='" + name + "']").forEach(function(field) {
        if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
          field.value = value || "";
        }
      });
    });
  }

  function hydrateFlowFormFields(state) {
    setNamedFieldValue(["contenedor", "numeroContenedor"], state.container);
    setNamedFieldValue(["operacion", "operacionLogistica"], state.operation);
    setNamedFieldValue(["orden", "ordenViaje"], state.order);
    setNamedFieldValue(["viaje"], state.journey);
    setNamedFieldValue(["placa", "placaCabezote"], state.vehicle);
    setNamedFieldValue(["placaRemolque"], state.trailer || "");
    setNamedFieldValue(["conductor"], state.driver);
    setNamedFieldValue(["documentoConductor"], state.driverDocument || "");
    setNamedFieldValue(["transportista"], state.carrier);
    setNamedFieldValue(["finca"], state.finca || "");
    setNamedFieldValue(["zonaExterna", "ze"], state.ze || "");
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
    document.querySelectorAll("[data-flow-finca]").forEach((node) => { node.textContent = state.finca || ""; });
    document.querySelectorAll("[data-flow-user]").forEach((node) => { node.textContent = state.user; });
    document.querySelectorAll("[data-flow-supervisor]").forEach((node) => { node.textContent = state.supervisor; });
    document.querySelectorAll("[data-flow-carrier]").forEach((node) => { node.textContent = state.carrier; });
    document.querySelectorAll("[data-flow-order]").forEach((node) => { node.textContent = state.order; });
    document.querySelectorAll("[data-flow-journey]").forEach((node) => { node.textContent = state.journey; });
    document.querySelectorAll("[data-flow-inspection-week]").forEach((node) => { node.textContent = state.inspectionWeek || ""; });
    document.querySelectorAll("[data-flow-inspection-tape]").forEach((node) => { node.textContent = state.inspectionTape || ""; });
    document.querySelectorAll("[data-flow-inspection-container-type]").forEach((node) => { node.textContent = state.inspectionContainerType || ""; });
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
    hydrateFlowFormFields(state);
  }

  function getNextAction(state) {
    const sequence = [
      ["zeReception", "../puerto-ze/recepcion-ze.html", "HU758 · Recepción en ZE", "Registrar llegada de vehículo en zona externa."],
      ["portExternalInspection", "../puerto-ze/inspeccion-externa.html?selectContainer=1", "Inspeccion externa ZE", "Evidencia fotografica externa estructural."],
      ["portInternalInspection", "../puerto-ze/inspeccion-interna.html?selectContainer=1", "Inspeccion interna ZE", "Evidencia fotografica interna de 15 a 23 fotos."],
      ["zeDispatch", "../puerto-ze/despacho-finca.html", "HU303 · Salida ZE", "Registrar salida operativa hacia finca."],
      ["farmReception", "../finca/recepcion-finca.html", "HU759 · Ingreso en Finca", "Confirmar llegada e iniciar la operación de finca."],
      ["farmExternalInspection", "../finca/inspeccion-externa.html?selectContainer=1", "Inspeccion externa finca", "Validar condiciones antes del cargue."],
      ["farmInternalInspection", "../finca/inspeccion-interna.html?selectContainer=1", "Inspeccion interna finca", "Registrar evidencia interna antes del cargue."],
      ["responsibility", "../finca/sesion-responsabilidad.html", "Sesion responsabilidad", "Capturar responsables y firmas."],
      ["palletBuilt", "../pallets/armar-pallet.html", "HU591 - Armar pallet", "Registrar SSCC, múltiples referencias, cajas y lotes reales."],
      ["palletsLoaded", "../pallets/cargar-pallets.html", "HU332 - Cargue contenedor", "Registrar cargue scan-to-load del contenedor."],
      ["containerClosed", "../finca/cierre-contenedor.html", "Cerrar contenedor", "Validar sellos, cantidades y evidencia."],
      ["farmDispatch", "../finca/despacho-ze.html", "Salida de Finca", "Registrar salida operativa hacia zona externa."],
      ["zeReturnReception", "../puerto-ze/recepcion-ze-retorno.html", "Recibir retorno ZE", "Confirmar llegada desde finca."],
      ["zePalletUnload", "../puerto-ze/hu342-descarga-pallets.html", "HU342 - Descargar pallets", "Conciliar cada SSCC y clasificar su estado físico."],
      ["zePalletReassembly", "../pallets/rearmar-pallet.html", "HU344 - Rearmar pallets", "Preparar los pallets incompletos o mixtos antes del cargue final."],
      ["zeConsolidatedLoad", "../puerto-ze/hu347-cargue-consolidado.html", "HU347 - Cargue consolidado", "Construir y asegurar la estiba del contenedor final."],
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
    const firstInvalid = form.querySelector("input:invalid, select:invalid, textarea:invalid");
    if (firstInvalid) firstInvalid.setAttribute("aria-invalid", "true");
    if (window.SialMobileUI && typeof window.SialMobileUI.setInlineStatus === "function") {
      window.SialMobileUI.setInlineStatus(box, {
        type: "error",
        title: firstInvalid ? "Revisa el campo indicado" : "No es posible continuar",
        message,
        field: firstInvalid,
        form
      });
    } else {
      box.hidden = false;
      box.textContent = message;
      const destination = firstInvalid || box;
      destination.tabIndex = destination.tabIndex < 0 ? -1 : destination.tabIndex;
      destination.scrollIntoView({ behavior: "smooth", block: "center" });
      destination.focus({ preventScroll: true });
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

  function controlPointStatusClass(value) {
    if (value === "SIN_NOVEDAD" || value === "VERIFICADO") return " success";
    if (value === "CON_NOVEDAD") return " warning";
    if (value === "NO_INSPECCIONABLE" || value === "NO_APLICA") return " info";
    return "";
  }

  function controlPointStatusLabel(value) {
    if (value === "VERIFICADO") return "Verificado";
    if (value === "NO_APLICA") return "No aplica";
    if (value === "SIN_NOVEDAD") return "Sin novedad";
    if (value === "CON_NOVEDAD") return "Con novedad";
    if (value === "NO_INSPECCIONABLE") return "No inspeccionable";
    return value || "Pendiente";
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
    if (form.dataset.requireControlPoints === "true") {
      var missingControlPoints = Array.from(form.querySelectorAll("[data-control-point]")).filter(function(container) {
        return !(container.querySelector("[data-cp-value]") || {}).value;
      });
      if (missingControlPoints.length) {
        return "Completa la verificación de todos los puntos inspeccionados.";
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

  function blockingRequirementMessage() {
    var requirement = Array.from(document.querySelectorAll("[data-requires]")).find(function(node) { return !node.hidden; });
    if (!requirement) return "Completa el evento requerido antes de continuar.";
    var detail = requirement.dataset.requiresDetail || "";
    var missing = requirement.querySelector("[data-missing-list]");
    if (detail) return detail;
    if (missing && missing.textContent.trim()) return "Completa primero: " + missing.textContent.trim() + ".";
    return "Completa el evento requerido antes de continuar.";
  }

  function showFlowBlocked() {
    showBanner({
      id: "flow-blocked",
      type: "warning",
      title: "Operación bloqueada",
      message: blockingRequirementMessage(),
      dismissible: true
    });
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

  function normalizePhotoCollection(photos) {
    return (photos || []).filter(function(photo) {
      return photo && photo.dataUrl;
    }).slice(0, zeReceptionEvidenceMax).map(function(photo, index) {
      return {
        id: photo.id || generateId(),
        dataUrl: photo.dataUrl,
        title: photo.title || photo.label || "Foto " + (index + 1),
        timestamp: photo.timestamp || Date.now(),
        source: photo.source || "camera"
      };
    });
  }

  function readZeReceptionEvidencePhotos(form, state) {
    if (form && isPrototypeReviewForm(form)) {
      window._sialPrototypePhotoCollections = window._sialPrototypePhotoCollections || {};
      window._sialPrototypePhotoCollections[zeReceptionEvidenceKey] = window._sialPrototypePhotoCollections[zeReceptionEvidenceKey] || [];
      return window._sialPrototypePhotoCollections[zeReceptionEvidenceKey];
    }
    var currentState = state || readState();
    currentState.photoCollections = currentState.photoCollections || {};
    return currentState.photoCollections[zeReceptionEvidenceKey] || [];
  }

  function writeZeReceptionEvidencePhotos(form, photos) {
    var normalized = normalizePhotoCollection(photos);
    if (form && isPrototypeReviewForm(form)) {
      window._sialPrototypePhotoCollections = window._sialPrototypePhotoCollections || {};
      window._sialPrototypePhotoCollections[zeReceptionEvidenceKey] = normalized;
      renderZeReceptionEvidenceGallery(form, normalized);
      markUnsaved("photo");
      return normalized;
    }
    var state = readState();
    state.photoCollections = state.photoCollections || {};
    state.photoCollections[zeReceptionEvidenceKey] = normalized;
    writeState(state);
    hydrateSummary(state);
    renderZeReceptionEvidenceGallery(form, normalized);
    markUnsaved("photo");
    return normalized;
  }

  function renderZeReceptionEvidenceGallery(form, photos) {
    if (!form) return;
    var items = normalizePhotoCollection(photos || readZeReceptionEvidencePhotos(form));
    var gallery = form.querySelector("[data-ze-reception-photo-gallery]");
    var countEl = form.querySelector("[data-ze-reception-photo-count]");
    var trigger = form.querySelector("[data-ze-reception-photo-trigger]");
    if (countEl) countEl.textContent = items.length + " de " + zeReceptionEvidenceMax + " fotos";
    if (trigger) {
      var isMaxed = items.length >= zeReceptionEvidenceMax;
      trigger.classList.toggle("is-maxed", isMaxed);
      trigger.dataset.maxed = String(isMaxed);
      trigger.title = isMaxed ? "Maximo de 6 fotos alcanzado" : "";
    }
    if (!gallery) return;
    gallery.innerHTML = items.map(function(photo, index) {
      var label = "Foto " + (index + 1);
      return [
        '<article class="sial-ze-evidence-card" data-ze-reception-photo-card role="listitem">',
        '<button class="sial-ze-evidence-photo-button" type="button" data-ze-reception-photo-open="' + index + '" aria-label="Abrir ' + escapeHtml(label) + '">',
        '<img src="' + photo.dataUrl + '" alt="' + escapeHtml(label) + '" loading="lazy">',
        '</button>',
        '<div class="sial-ze-evidence-card-meta">',
        '<strong>' + escapeHtml(label) + '</strong>',
        '<button class="sial-chip-action danger" type="button" data-ze-reception-photo-remove="' + index + '">Quitar</button>',
        '</div>',
        '</article>'
      ].join("");
    }).join("");
  }

  function hydrateZeReceptionEvidenceGalleries(state) {
    document.querySelectorAll("[data-flow-form][data-event='zeReception']").forEach(function(form) {
      renderZeReceptionEvidenceGallery(form, readZeReceptionEvidencePhotos(form, state));
    });
  }

  function openZeReceptionEvidenceCapture(form) {
    if (!form) return;
    var existing = readZeReceptionEvidencePhotos(form);
    if (existing.length >= zeReceptionEvidenceMax) {
      showToast({ type: "warning", title: "Maximo alcanzado", message: "La evidencia inicial permite maximo " + zeReceptionEvidenceMax + " fotos." });
      return;
    }
    var captureApi = photoCaptureApi();
    if (!captureApi) {
      showToast({ type: "warning", title: "Camara no disponible", message: "No se pudo abrir la captura fotografica." });
      return;
    }
    captureApi({
      title: "Evidencia inicial",
      eventName: "zeReception",
      pointKey: zeReceptionEvidenceKey,
      allowMultiple: true,
      maxPhotos: zeReceptionEvidenceMax - existing.length,
      onComplete: function(photos) {
        if (!photos || !photos.length) return;
        var merged = existing.concat(photos).slice(0, zeReceptionEvidenceMax);
        writeZeReceptionEvidencePhotos(form, merged);
        showToast({ type: "success", title: "Evidencia agregada", message: photos.length + " foto(s) asociada(s)." });
      },
      onCancel: function() {}
    });
  }

  function closePhotoViewer() {
    var viewer = document.querySelector("[data-photo-viewer]");
    if (activePhotoViewerKeydown) {
      document.removeEventListener("keydown", activePhotoViewerKeydown);
      activePhotoViewerKeydown = null;
    }
    if (viewer) {
      if (window.SialMobileUI && typeof window.SialMobileUI.unmountModalLayer === "function") {
        window.SialMobileUI.unmountModalLayer(viewer);
      }
      viewer.remove();
    }
    document.body.classList.remove("photo-viewer-open");
  }

  function openPhotoViewer(options) {
    options = options || {};
    var getItems = typeof options.getItems === "function" ? options.getItems : function() { return []; };
    var onRetake = typeof options.onRetake === "function" ? options.onRetake : null;
    var currentIndex = Math.max(0, Number(options.initialIndex || 0));

    closePhotoViewer();

    var viewer = document.createElement("div");
    viewer.className = "sial-photo-viewer";
    viewer.dataset.photoViewer = "";
    viewer.setAttribute("role", "dialog");
    viewer.setAttribute("aria-modal", "true");
    viewer.setAttribute("aria-labelledby", "sial-photo-viewer-title");
    viewer.tabIndex = -1;
    viewer.innerHTML = [
      '<header class="sial-photo-viewer-header">',
      '<button class="sial-photo-viewer-icon" type="button" data-photo-viewer-close aria-label="Cerrar visor"><svg class="sial-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>',
      '<div class="sial-photo-viewer-title-stack">',
      '<h2 id="sial-photo-viewer-title" data-photo-viewer-title>Foto</h2>',
      '<span data-photo-viewer-counter>1 de 1</span>',
      '</div>',
      '<span class="sial-photo-viewer-spacer" aria-hidden="true"></span>',
      '</header>',
      '<div class="sial-photo-viewer-stage">',
      '<button class="sial-photo-viewer-nav" type="button" data-photo-viewer-prev aria-label="Foto anterior"><svg class="sial-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button>',
      '<figure class="sial-photo-viewer-frame">',
      '<img data-photo-viewer-image alt="">',
      '</figure>',
      '<button class="sial-photo-viewer-nav" type="button" data-photo-viewer-next aria-label="Foto siguiente"><svg class="sial-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>',
      '</div>',
      '<footer class="sial-photo-viewer-actions">',
      '<button class="sial-photo-viewer-retake" type="button" data-photo-viewer-retake><svg class="sial-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>Volver a tomar foto</button>',
      '</footer>'
    ].join("");

    document.body.appendChild(viewer);
    document.body.classList.add("photo-viewer-open");
    if (window.SialMobileUI && typeof window.SialMobileUI.mountModalLayer === "function") {
      window.SialMobileUI.mountModalLayer(viewer, {
        panel: viewer,
        initialFocus: "[data-photo-viewer-close]",
        onEscape: closePhotoViewer
      });
    }

    var titleEl = viewer.querySelector("[data-photo-viewer-title]");
    var counterEl = viewer.querySelector("[data-photo-viewer-counter]");
    var imageEl = viewer.querySelector("[data-photo-viewer-image]");
    var prevBtn = viewer.querySelector("[data-photo-viewer-prev]");
    var nextBtn = viewer.querySelector("[data-photo-viewer-next]");
    var retakeBtn = viewer.querySelector("[data-photo-viewer-retake]");

    function currentItems() {
      return (getItems() || []).filter(function(item) { return item && item.dataUrl; });
    }

    function itemLabel(item, index) {
      return String(item.label || item.title || ("Foto " + (index + 1))).replace(/\s+/g, " ").trim() || "Foto";
    }

    function render() {
      var items = currentItems();
      if (!items.length) {
        closePhotoViewer();
        return;
      }
      currentIndex = Math.min(Math.max(currentIndex, 0), items.length - 1);
      var item = items[currentIndex];
      var label = itemLabel(item, currentIndex);
      if (titleEl) titleEl.textContent = label;
      if (counterEl) counterEl.textContent = (currentIndex + 1) + " de " + items.length;
      if (imageEl) {
        imageEl.src = item.dataUrl;
        imageEl.alt = label;
      }
      if (prevBtn) prevBtn.disabled = currentIndex <= 0;
      if (nextBtn) nextBtn.disabled = currentIndex >= items.length - 1;
    }

    function move(delta) {
      currentIndex += delta;
      render();
    }

    viewer.querySelector("[data-photo-viewer-close]").addEventListener("click", closePhotoViewer);
    prevBtn.addEventListener("click", function() { move(-1); });
    nextBtn.addEventListener("click", function() { move(1); });
    if (retakeBtn) {
      retakeBtn.hidden = !onRetake;
      retakeBtn.addEventListener("click", function() {
        var items = currentItems();
        var item = items[currentIndex];
        if (item && onRetake) onRetake(item, currentIndex);
      });
    }
    viewer.addEventListener("click", function(event) {
      if (event.target === viewer) closePhotoViewer();
    });
    activePhotoViewerKeydown = function(event) {
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    document.addEventListener("keydown", activePhotoViewerKeydown);
    render();
  }

  function evidenceStateContext(eventName) {
    if (isPrototypeReviewPage()) {
      window._sialPrototypeEvidence = window._sialPrototypeEvidence || {};
      window._sialPrototypeEvidence[eventName] = window._sialPrototypeEvidence[eventName] || [];
      return {
        items: window._sialPrototypeEvidence[eventName],
        write: function(items) {
          window._sialPrototypeEvidence[eventName] = items;
          renderEvidenceGallery({ evidence: window._sialPrototypeEvidence }, eventName);
        }
      };
    }
    var state = readState();
    state.evidence = state.evidence || {};
    state.evidence[eventName] = state.evidence[eventName] || [];
    return {
      items: state.evidence[eventName],
      write: function(items) {
        state.evidence[eventName] = items;
        writeState(state);
        renderEvidenceGallery(state, eventName);
      }
    };
  }

  function retakeEvidencePhoto(eventName, evidenceId) {
    var context = evidenceStateContext(eventName);
    var item = context.items.find(function(entry) { return entry.id === evidenceId; });
    if (!item) return;
    var captureApi = photoCaptureApi();
    if (!captureApi) {
      showToast({ type: "warning", title: "Camara no disponible", message: "No se pudo retomar la evidencia." });
      return;
    }
    closePhotoViewer();
    captureApi({
      title: item.label || item.title || "Evidencia",
      eventName: eventName,
      pointKey: item.controlPoint || "",
      allowMultiple: false,
      maxPhotos: 1,
      onComplete: function(photos) {
        var photo = photos && photos[0];
        if (photo && photo.dataUrl) {
          var fresh = evidenceStateContext(eventName);
          var updated = fresh.items.map(function(entry) {
            if (entry.id !== evidenceId) return entry;
            return {
              ...entry,
              dataUrl: photo.dataUrl,
              timestamp: photo.timestamp || Date.now(),
              source: photo.source || "camera"
            };
          });
          fresh.write(updated);
          markUnsaved("evidence");
          showToast({ type: "success", title: "Foto actualizada", message: "La evidencia fue retomada." });
        }
        openEvidencePhotoViewer(eventName, evidenceId);
      },
      onCancel: function() {
        openEvidencePhotoViewer(eventName, evidenceId);
      }
    });
  }

  function openEvidencePhotoViewer(eventName, evidenceId) {
    var visibleItems = evidenceStateContext(eventName).items.filter(function(item) { return item && item.dataUrl; });
    var initialIndex = visibleItems.findIndex(function(item) { return item.id === evidenceId; });
    if (initialIndex < 0) return;
    openPhotoViewer({
      initialIndex: initialIndex,
      getItems: function() {
        return evidenceStateContext(eventName).items.filter(function(item) { return item && item.dataUrl; });
      },
      onRetake: function(item) {
        retakeEvidencePhoto(eventName, item.id);
      }
    });
  }

  function retakeZeReceptionPhoto(form, index) {
    var items = readZeReceptionEvidencePhotos(form);
    var current = items[index];
    if (!current) return;
    var label = "Foto " + (index + 1);
    var captureApi = photoCaptureApi();
    if (!captureApi) {
      showToast({ type: "warning", title: "Camara no disponible", message: "No se pudo retomar la evidencia." });
      return;
    }
    closePhotoViewer();
    captureApi({
      title: label,
      eventName: "zeReception",
      pointKey: zeReceptionEvidenceKey,
      allowMultiple: false,
      maxPhotos: 1,
      onComplete: function(photos) {
        var photo = photos && photos[0];
        if (photo && photo.dataUrl) {
          var fresh = readZeReceptionEvidencePhotos(form).slice();
          fresh[index] = {
            ...fresh[index],
            dataUrl: photo.dataUrl,
            title: label,
            timestamp: photo.timestamp || Date.now(),
            source: photo.source || "camera"
          };
          writeZeReceptionEvidencePhotos(form, fresh);
          showToast({ type: "success", title: "Foto actualizada", message: "La evidencia inicial fue retomada." });
        }
        openZeReceptionPhotoViewer(form, index);
      },
      onCancel: function() {
        openZeReceptionPhotoViewer(form, index);
      }
    });
  }

  function openZeReceptionPhotoViewer(form, index) {
    openPhotoViewer({
      initialIndex: index,
      getItems: function() {
        return readZeReceptionEvidencePhotos(form).map(function(photo, photoIndex) {
          var label = "Foto " + (photoIndex + 1);
          return { ...photo, title: label, label: label };
        });
      },
      onRetake: function(_, currentIndex) {
        retakeZeReceptionPhoto(form, currentIndex);
      }
    });
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
        noveltyType: "",
        severity: "MEDIA",
        blocking: false,
        noveltyDesc: "",
        timestamp: new Date().toLocaleString("es-CO")
      });
      renderEvidenceGallery({ evidence: window._sialPrototypeEvidence }, eventName);
      markUnsaved("evidence");
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
    markUnsaved("evidence");
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

  function getEvidenceContext(eventName) {
    if (isPrototypeReviewPage()) {
      window._sialPrototypeEvidence = window._sialPrototypeEvidence || {};
      window._sialPrototypeEvidence[eventName] = window._sialPrototypeEvidence[eventName] || [];
      return {
        isPrototype: true,
        state: { evidence: window._sialPrototypeEvidence },
        items: window._sialPrototypeEvidence[eventName]
      };
    }
    var state = readState();
    state.evidence = state.evidence || {};
    state.evidence[eventName] = state.evidence[eventName] || [];
    return {
      isPrototype: false,
      state: state,
      items: state.evidence[eventName]
    };
  }

  function getEvidenceEntry(eventName, evidenceId) {
    var context = getEvidenceContext(eventName);
    return {
      context: context,
      entry: context.items.find(function(item) { return item.id === evidenceId; }) || null
    };
  }

  function renderSelectOptions(options, selectedValue) {
    return options.map(function(option) {
      return '<option value="' + escapeHtml(option.value) + '"' + (option.value === selectedValue ? " selected" : "") + ">" + escapeHtml(option.label) + "</option>";
    }).join("");
  }

  function createEvidenceNoveltyForm(item) {
    var form = document.createElement("form");
    var selectedType = item.noveltyType || "OTRO";
    var selectedSeverity = item.severity || "MEDIA";
    form.className = "sial-novelty-form";
    form.dataset.evidenceNoveltyForm = "";
    form.innerHTML = [
      '<label>Tipo <select data-novelty-type>',
      renderSelectOptions([
        { value: "CONTAMINANTE", label: "Contaminante" },
        { value: "OBJETO_EXTRANO", label: "Objeto extraño" },
        { value: "DANO_ESTRUCTURAL", label: "Daño estructural" },
        { value: "MODIFICACION", label: "Modificacion" },
        { value: "CORROSION", label: "Corrosion" },
        { value: "OTRO", label: "Otro" }
      ], selectedType),
      '</select></label>',
      '<label>Severidad <select data-novelty-severity>',
      renderSelectOptions([
        { value: "BAJA", label: "Baja" },
        { value: "MEDIA", label: "Media" },
        { value: "ALTA", label: "Alta" },
        { value: "CRITICA", label: "Crítica" }
      ], selectedSeverity),
      '</select></label>',
      '<label class="sial-checkbox-row"><input type="checkbox" data-novelty-blocking' + (item.blocking ? " checked" : "") + "> Impide continuar la operación</label>",
      '<label>Descripción <textarea data-novelty-desc placeholder="Describe la novedad">' + escapeHtml(item.noveltyDesc || "") + "</textarea></label>"
    ].join("");
    form.addEventListener("submit", function(event) {
      event.preventDefault();
    });
    return form;
  }

  function readEvidenceNoveltyForm(form) {
    return {
      noveltyType: (form.querySelector("[data-novelty-type]") || {}).value || "OTRO",
      severity: (form.querySelector("[data-novelty-severity]") || {}).value || "MEDIA",
      blocking: form.querySelector("[data-novelty-blocking]") ? form.querySelector("[data-novelty-blocking]").checked : false,
      noveltyDesc: (form.querySelector("[data-novelty-desc]") || {}).value || ""
    };
  }

  function saveEvidenceNovelty(eventName, evidenceId, values) {
    var result = getEvidenceEntry(eventName, evidenceId);
    if (!result.entry) return false;
    result.entry.hasNovelty = true;
    result.entry.noveltyType = values.noveltyType;
    result.entry.severity = values.severity;
    result.entry.blocking = values.blocking;
    result.entry.noveltyDesc = values.noveltyDesc;

    if (!result.context.isPrototype) {
      writeState(result.context.state);
    }
    renderEvidenceGallery(result.context.state, eventName);
    markUnsaved("novelty");
    showToast({
      type: "success",
      title: "Novedad asignada",
      message: result.context.isPrototype ? "La evidencia queda marcada en esta vista." : "La evidencia quedo marcada con novedad."
    });
    return true;
  }

  function openEvidenceNoveltySheet(eventName, evidenceId) {
    var result = getEvidenceEntry(eventName, evidenceId);
    if (!result.entry) return;
    if (!window.SialMobileUI || typeof window.SialMobileUI.openDialog !== "function") {
      showToast({ type: "warning", title: "Editor no disponible", message: "No se pudo abrir el editor de novedad." });
      return;
    }
    var form = createEvidenceNoveltyForm(result.entry);
    window.SialMobileUI.openDialog({
      id: "evidence-novelty-" + evidenceId,
      variant: "sheet",
      title: "Guardar novedad",
      message: result.entry.label || "Evidencia fotografica",
      content: form,
      actions: [
        { label: "Cancelar", variant: "secondary" },
        {
          label: "Guardar novedad",
          onClick: function() {
            saveEvidenceNovelty(eventName, evidenceId, readEvidenceNoveltyForm(form));
          }
        }
      ]
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
      var readyPallets = Array.isArray(state.readyPallets)
        ? state.readyPallets.filter(function(item) { return item && item.status !== "ANULADO"; }).length
        : 0;
      state.pallets = Math.max(1, readyPallets, state.pallets || 0);
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

  const showBanner = (options) => {
    if (window.SialMobileUI && typeof window.SialMobileUI.showBanner === "function") {
      window.SialMobileUI.showBanner(options);
    }
  };

  function updateConnectionBanner() {
    if (!window.SialMobileUI) return;
    if (navigator.onLine) {
      window.SialMobileUI.hideBanner("network-offline");
      return;
    }
    showBanner({
      id: "network-offline",
      type: "warning",
      title: "Sin conexión",
      message: "Los cambios se conservarán en este dispositivo y se sincronizarán cuando recuperes la conexión.",
      dismissible: false
    });
  }

  window.addEventListener("online", updateConnectionBanner);
  window.addEventListener("offline", updateConnectionBanner);
  window.setTimeout(updateConnectionBanner, 0);

  function markUnsaved(reason) {
    if (window.SialMobileUI && typeof window.SialMobileUI.markUnsavedChanges === "function") {
      window.SialMobileUI.markUnsavedChanges(reason || "flow");
    }
  }

  function clearUnsaved() {
    if (window.SialMobileUI && typeof window.SialMobileUI.clearUnsavedChanges === "function") {
      window.SialMobileUI.clearUnsavedChanges();
    }
  }

  function isInspectionEvent(eventName) {
    return inspectionEvents.includes(eventName);
  }

  function currentInspectionForm() {
    var form = document.querySelector("[data-flow-form]");
    if (!form || !isInspectionEvent(form.dataset.event || "")) return null;
    return form;
  }

  function availableInspectionContainers(state) {
    var containers = Array.isArray(state.availableContainers) && state.availableContainers.length
      ? state.availableContainers
      : defaults.availableContainers;
    return (containers || []).filter(function(item) {
      return item && item.container && item.active !== false && item.nextInspectionEvent;
    });
  }

  function inspectionAvailabilityLabel(item) {
    return labels[item.nextInspectionEvent] || "otra inspeccion";
  }

  function compactInspectionAvailabilityLabel(item) {
    var eventName = item.nextInspectionEvent || "";
    if (eventName === "portExternalInspection") return "inspección externa en Zona Externa";
    if (eventName === "portInternalInspection") return "inspección interna en Zona Externa";
    if (eventName === "farmExternalInspection") return "inspección externa en finca";
    if (eventName === "farmInternalInspection") return "inspección interna en finca";
    return "otra operación";
  }

  function normalizeContainerSearch(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function updateInspectionContainerPagination(selector, requestedPage) {
    if (!selector) return;
    var input = selector.querySelector("[data-inspection-container-search-input]");
    var query = normalizeContainerSearch(input ? input.value : "");
    var matches = [];
    var options = Array.from(selector.querySelectorAll("[data-inspection-container-option]"));
    options.forEach(function(option) {
      var haystack = option.dataset.inspectionContainerSearch || "";
      var isMatch = !query || haystack.includes(query);
      option.dataset.inspectionContainerMatch = String(isMatch);
      option.hidden = true;
      if (isMatch) matches.push(option);
    });

    var totalPages = Math.max(1, Math.ceil(matches.length / inspectionContainerPageSize));
    var requested = Number(requestedPage || selector.dataset.inspectionContainerCurrentPage || 1);
    var currentPage = Math.min(Math.max(1, requested || 1), totalPages);
    var start = (currentPage - 1) * inspectionContainerPageSize;
    var end = start + inspectionContainerPageSize;
    selector.dataset.inspectionContainerCurrentPage = String(currentPage);

    matches.slice(start, end).forEach(function(option) {
      option.hidden = false;
    });

    var empty = selector.querySelector("[data-inspection-container-empty]");
    if (empty) empty.hidden = matches.length > 0;

    var pagination = selector.querySelector("[data-inspection-container-pagination]");
    var status = selector.querySelector("[data-inspection-container-page-status]");
    var prev = selector.querySelector("[data-inspection-container-page='prev']");
    var next = selector.querySelector("[data-inspection-container-page='next']");
    var shouldShowPagination = matches.length > inspectionContainerPageSize;

    if (pagination) pagination.hidden = !shouldShowPagination;
    if (status) {
      status.textContent = matches.length
        ? "Pagina " + currentPage + " de " + totalPages + " - " + matches.length + " contenedores"
        : "Sin contenedores para mostrar";
    }
    if (prev) {
      prev.disabled = currentPage <= 1;
      prev.setAttribute("aria-disabled", String(prev.disabled));
    }
    if (next) {
      next.disabled = currentPage >= totalPages;
      next.setAttribute("aria-disabled", String(next.disabled));
    }
  }

  function filterInspectionContainerOptions(input) {
    var selector = input.closest(".sial-container-selector");
    if (!selector) return;
    selector.dataset.inspectionContainerCurrentPage = "1";
    updateInspectionContainerPagination(selector, 1);
  }

  function applyInspectionContainerToState(state, item, eventName) {
    var previousId = state.selectedInspectionContainers ? state.selectedInspectionContainers[eventName] : "";
    state.container = item.container || state.container;
    state.operation = item.operation || state.operation;
    state.reference = item.reference || state.reference;
    state.order = item.order || state.order;
    state.journey = item.journey || state.journey;
    state.vehicle = item.vehicle || state.vehicle;
    state.trailer = item.trailer || "";
    state.driver = item.driver || state.driver;
    state.driverDocument = item.driverDocument || "";
    state.carrier = item.carrier || state.carrier;
    state.ze = item.ze || state.ze;
    state.finca = item.finca || state.finca;
    state.containerStatus = item.containerStatus || state.containerStatus;
    state.operationStatus = item.operationStatus || state.operationStatus;
    state.containerLocation = item.containerLocation || state.containerLocation;
    state.vehicleStatus = item.vehicleStatus || state.vehicleStatus;
    state.containerExists = true;
    state.hasActiveDispatch = false;
    state.hasVehicleAssociation = true;
    state.containerExported = false;
    state.flags = { ...(state.flags || {}), ...(item.flags || {}) };
    state.selectedInspectionContainers = { ...(state.selectedInspectionContainers || {}), [eventName]: item.id };

    if (previousId && previousId !== item.id) {
      if (state.evidence && state.evidence[eventName]) state.evidence[eventName] = [];
      if (state.controlPoints && state.controlPoints[eventName]) state.controlPoints[eventName] = [];
      if (state.inspectionLabels && state.inspectionLabels[eventName]) state.inspectionLabels[eventName] = [];
      if (window._sialPrototypeEvidence && window._sialPrototypeEvidence[eventName]) {
        window._sialPrototypeEvidence[eventName] = [];
      }
      if (window._sialPrototypeInspectionLabels && window._sialPrototypeInspectionLabels[eventName]) {
        window._sialPrototypeInspectionLabels[eventName] = [];
      }
    }
  }

  function ensureInspectionContextSummary(state) {
    var form = currentInspectionForm();
    if (!form) return;
    if (document.querySelector("[data-flow-container]") || document.querySelector("[data-inspection-context-summary]")) {
      ensureInspectionContainerChangeAction(form);
      return;
    }

    var banner = document.createElement("div");
    banner.className = "sial-flow-banner";
    banner.dataset.inspectionContextSummary = "true";
    banner.innerHTML = '<strong>Contenedor <span data-flow-container></span></strong><span><span data-flow-location></span></span>';

    var card = document.createElement("section");
    card.className = "sial-card sial-card-pad sial-form";
    card.dataset.inspectionContextSummary = "true";
    card.innerHTML = [
      '<div class="sial-list-row"><strong>Operacion</strong><span data-flow-operation></span></div>',
      '<div class="sial-list-row"><strong>Orden / viaje</strong><span><span data-flow-order></span> / <span data-flow-journey></span></span></div>',
      '<div class="sial-list-row"><strong>Vehiculo</strong><span data-flow-vehicle></span></div>',
      '<div class="sial-list-row"><strong>Transportista</strong><span data-flow-carrier></span></div>',
      '<div class="sial-list-row"><strong>Finca</strong><span data-flow-finca></span></div>',
      '<div class="sial-list-row"><strong>Estado contenedor</strong><span data-flow-container-status></span></div>'
    ].join("");

    form.parentNode.insertBefore(banner, form);
    form.parentNode.insertBefore(card, form);
    ensureInspectionContainerChangeAction(form);
    hydrateSummary(state);
  }

  function ensureInspectionContainerChangeAction(form) {
    if (!form || document.querySelector("[data-change-inspection-container]")) return;
    var button = document.createElement("button");
    button.className = "sial-btn sial-btn-secondary sial-btn-full sial-container-change-action";
    button.type = "button";
    button.dataset.changeInspectionContainer = form.dataset.event || "";
    button.innerHTML = [
      '<svg class="sial-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg>',
      "<span>Cambiar contenedor</span>"
    ].join("");

    var summaryCard = document.querySelector("[data-inspection-context-summary].sial-card");
    if (summaryCard) {
      summaryCard.appendChild(button);
      return;
    }

    var flowBanner = document.querySelector(".sial-flow-banner");
    if (flowBanner) {
      flowBanner.appendChild(button);
      return;
    }

    form.parentNode.insertBefore(button, form);
  }

  function createInspectionContainerSelectorContent(eventName, state) {
    var activeContainers = availableInspectionContainers(state);
    var content = document.createElement("div");
    content.className = "sial-container-selector";

    var copy = document.createElement("p");
    copy.className = "sial-container-selector-copy";
    copy.textContent = "Busca por contenedor, viaje o placa.";
    content.appendChild(copy);

    if (!activeContainers.length) {
      var empty = document.createElement("div");
      empty.className = "sial-status warning";
      empty.innerHTML = "<span><strong>Sin contenedores activos</strong>No hay contenedores disponibles para inspeccion.</span>";
      content.appendChild(empty);
      return content;
    }

    var search = document.createElement("input");
    search.className = "sial-container-search";
    search.type = "search";
    search.placeholder = "Buscar contenedor";
    search.autocomplete = "off";
    search.dataset.inspectionContainerSearchInput = "true";
    search.setAttribute("aria-label", "Buscar contenedor");
    content.appendChild(search);

    var list = document.createElement("div");
    list.className = "sial-container-selector-list";
    activeContainers.forEach(function(item) {
      var isAvailable = item.nextInspectionEvent === eventName;
      var option = document.createElement("button");
      option.type = "button";
      option.className = "sial-container-option" + (isAvailable ? " is-available" : " is-locked");
      option.dataset.inspectionContainerOption = item.id;
      option.dataset.inspectionTargetEvent = eventName;
      option.dataset.inspectionContainerSearch = normalizeContainerSearch([
        item.container,
        item.operation,
        item.order,
        item.journey,
        item.vehicle,
        item.trailer,
        item.driver,
        item.carrier,
        item.finca,
        inspectionAvailabilityLabel(item)
      ].join(" "));
      option.setAttribute("aria-pressed", String((state.selectedInspectionContainers || {})[eventName] === item.id));
      option.disabled = !isAvailable;
      option.setAttribute("aria-disabled", String(!isAvailable));
      option.innerHTML = [
        '<span class="sial-container-option-main">',
        '<span class="sial-container-option-head">',
        '<strong class="sial-container-option-title">' + escapeHtml(item.container) + '</strong>',
        '<span class="sial-pill ' + (isAvailable ? 'success' : 'warning') + '">' + escapeHtml(isAvailable ? "Disponible" : "Disponible para " + compactInspectionAvailabilityLabel(item)) + '</span>',
        '</span>',
        '<span class="sial-container-option-meta">' + escapeHtml(item.operation || "") + ' - ' + escapeHtml(item.journey || "") + ' - ' + escapeHtml(item.vehicle || "") + '</span>',
        '</span>'
      ].join("");
      list.appendChild(option);
    });
    content.appendChild(list);

    var pagination = document.createElement("div");
    pagination.className = "sial-container-pagination";
    pagination.dataset.inspectionContainerPagination = "true";
    pagination.innerHTML = [
      '<button class="sial-btn sial-btn-secondary" type="button" data-inspection-container-page="prev">Anterior</button>',
      '<span class="sial-container-page-status" data-inspection-container-page-status aria-live="polite"></span>',
      '<button class="sial-btn sial-btn-secondary" type="button" data-inspection-container-page="next">Siguiente</button>'
    ].join("");
    content.appendChild(pagination);

    var emptySearch = document.createElement("p");
    emptySearch.className = "sial-container-selector-empty";
    emptySearch.dataset.inspectionContainerEmpty = "true";
    emptySearch.hidden = true;
    emptySearch.textContent = "Sin resultados para la busqueda.";
    content.appendChild(emptySearch);
    updateInspectionContainerPagination(content, 1);
    return content;
  }

  function showPendingInspectionContext() {
    document.querySelectorAll("[data-flow-container]").forEach(function(node) { node.textContent = "Sin seleccionar"; });
    document.querySelectorAll("[data-flow-container-status]").forEach(function(node) { node.textContent = "Pendiente"; });
  }

  function selectedInspectionContainerId(state, eventName) {
    return (state.selectedInspectionContainers || {})[eventName] || "";
  }

  function shouldForceInspectionContainerSelector() {
    try {
      return new URLSearchParams(window.location.search || "").get("selectContainer") === "1";
    } catch (_) {
      return false;
    }
  }

  function openInspectionContainerSelector(options) {
    options = options || {};
    var form = currentInspectionForm();
    if (!form || !window.SialMobileUI || typeof window.SialMobileUI.openDialog !== "function") return;
    var eventName = form.dataset.event || "";
    var shouldForce = options.force || shouldForceInspectionContainerSelector();
    window.setTimeout(function() {
      var latest = readState();
      if (!shouldForce && selectedInspectionContainerId(latest, eventName)) return;
      var hasAvailableForEvent = availableInspectionContainers(latest).some(function(item) {
        return item.nextInspectionEvent === eventName;
      });
      if (shouldForce && !selectedInspectionContainerId(latest, eventName)) showPendingInspectionContext();
      window.SialMobileUI.openDialog({
        id: "inspection-container-selector",
        variant: "modal",
        title: "Selecciona un contenedor",
        message: "Elige un contenedor disponible para " + (labels[eventName] || "esta inspección") + ".",
        content: createInspectionContainerSelectorContent(eventName, latest),
        dismissible: !hasAvailableForEvent,
        initialFocus: "[data-inspection-container-search-input]",
        actions: []
      });
    }, 0);
  }

  function mountCompactInspectionPointSelects() {
    document.querySelectorAll("[data-compact-control-point-selects] [data-control-point]").forEach(function(node) {
      if (node.dataset.compactControlPointMounted === "true") return;
      var sourceInput = node.querySelector("[data-cp-value]");
      var header = node.querySelector(".sial-checkpoint-header");
      var body = node.querySelector(".sial-checkpoint-body");
      if (!sourceInput || !header || !body) return;

      var pointKey = node.dataset.controlPoint || "point";
      var controlId = "inspection-point-" + pointKey + "-select";
      var menuId = controlId + "-options";
      var currentValue = sourceInput.value || "";
      var status = header.querySelector("[data-cp-status]");
      if (status) status.remove();

      var control = document.createElement("div");
      control.className = "sial-select-control";
      control.dataset.sialSelect = "";

      var select = document.createElement("select");
      select.className = "sial-select-native";
      select.id = controlId;
      select.name = sourceInput.name;
      select.dataset.cpValue = "";
      select.dataset.cpSelect = "";
      select.tabIndex = -1;
      select.setAttribute("aria-hidden", "true");
      select.setAttribute("inert", "");
      [
        { value: "", label: "Pendiente" },
        { value: "VERIFICADO", label: "Verificado" },
        { value: "NO_APLICA", label: "No aplica" }
      ].forEach(function(item) {
        var option = document.createElement("option");
        option.value = item.value;
        option.textContent = item.label;
        select.appendChild(option);
      });
      select.value = currentValue;

      var trigger = document.createElement("button");
      trigger.className = "sial-select-trigger";
      trigger.type = "button";
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-controls", menuId);
      trigger.setAttribute("aria-label", "Estado de " + (node.dataset.controlPointName || pointKey));
      trigger.innerHTML = '<span data-sial-select-value>Pendiente</span><svg class="sial-select-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>';

      var menu = document.createElement("div");
      menu.className = "sial-select-menu";
      menu.id = menuId;
      menu.setAttribute("role", "listbox");
      menu.tabIndex = -1;
      menu.hidden = true;

      control.append(select, trigger, menu);
      header.classList.add("sial-checkpoint-compact-row");
      header.appendChild(control);
      body.remove();
      sourceInput.remove();
      node.dataset.compactControlPointMounted = "true";
      if (window.SialMobileUI && typeof window.SialMobileUI.mountSelectControls === "function") {
        window.SialMobileUI.mountSelectControls(node);
      }
    });
  }

  function persistControlPointSelect(select) {
    var container = select.closest("[data-control-point]");
    if (!container) return;
    var eventName = container.dataset.controlPointEvent || "";
    var pointKey = container.dataset.controlPoint || "";
    if (!eventName || !pointKey) return;
    var value = select.value || "";
    if (isPrototypeReviewPage()) {
      markUnsaved("control-point");
      return;
    }

    var state = readState();
    state.controlPoints = state.controlPoints || {};
    state.controlPoints[eventName] = state.controlPoints[eventName] || [];
    var existingIndex = state.controlPoints[eventName].findIndex(function(point) { return point.code === pointKey; });
    if (!value) {
      if (existingIndex >= 0) state.controlPoints[eventName].splice(existingIndex, 1);
    } else if (existingIndex >= 0) {
      state.controlPoints[eventName][existingIndex].value = value;
    } else {
      state.controlPoints[eventName].push({ code: pointKey, name: container.dataset.controlPointName || pointKey, value: value, observation: "", hasPhoto: false });
    }
    writeState(state);
  }

  function hydrateControlPoints(state) {
    document.querySelectorAll("[data-control-point]").forEach((node) => {
      const eventName = node.dataset.controlPointEvent || "";
      const pointKey = node.dataset.controlPoint;
      if (!eventName || !pointKey) return;
      const points = (state.controlPoints || {})[eventName] || [];
      const pointData = points.find(function(p) { return p.code === pointKey; });
      if (!pointData) return;
      const valueInput = node.querySelector("[data-cp-value]");
      if (valueInput) {
        valueInput.value = pointData.value || "";
        if (valueInput.matches("select")) {
          var valueNode = valueInput.closest("[data-sial-select]")?.querySelector("[data-sial-select-value]");
          var selectedOption = valueInput.options[valueInput.selectedIndex];
          if (valueNode && selectedOption) valueNode.textContent = selectedOption.textContent;
        }
      }
      node.querySelectorAll("[data-cp-option]").forEach(function(button) {
        var isSelected = button.dataset.cpOption === pointData.value;
        button.classList.toggle("active", isSelected);
        button.setAttribute("aria-pressed", String(isSelected));
      });
      const obsInput = node.querySelector("[data-cp-observation]");
      if (obsInput) obsInput.value = pointData.observation || "";
      const statusEl = node.querySelector("[data-cp-status]");
      if (statusEl) {
        statusEl.textContent = controlPointStatusLabel(pointData.value);
        statusEl.className = "sial-pill" + controlPointStatusClass(pointData.value);
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
      var safeId = escapeHtml(item.id || "");
      var safeLabel = escapeHtml(item.label || "Evidencia");
      var safeEventName = escapeHtml(eventName || "");
      var noveltyBadge = item.hasNovelty ? '<span class="sial-evidence-badge">' + (item.blocking ? '!! ' : '') + 'Novedad</span>' : '';
      var cardClass = 'sial-evidence-card' + (item.hasNovelty ? (item.blocking ? ' has-blocking-novelty' : ' has-novelty') : '');
      var thumbContent = item.dataUrl
        ? '<img src="' + item.dataUrl + '" alt="' + safeLabel + '" loading="lazy">'
        : '<svg class="sial-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
      var thumbNode = item.dataUrl
        ? '<button class="sial-evidence-thumb sial-photo-open-button" type="button" data-view-evidence-photo="' + safeEventName + '" data-evidence-id="' + safeId + '" aria-label="Abrir ' + safeLabel + '">' + thumbContent + '</button>'
        : '<div class="sial-evidence-thumb">' + thumbContent + '</div>';
      return [
        '<article class="' + cardClass + '" data-evidence-card data-evidence-id="' + safeId + '" aria-label="' + safeLabel + (item.hasNovelty ? ', con novedad' : '') + '">',
        noveltyBadge,
        thumbNode,
        '<div class="sial-evidence-label">' + safeLabel + '</div>',
        '<div class="sial-evidence-actions">',
        '<button class="sial-chip-action" type="button" data-toggle-novelty="' + safeEventName + '" data-evidence-id="' + safeId + '">' + (item.hasNovelty ? 'Editar' : 'Novedad') + '</button>',
        '<button class="sial-chip-action danger" type="button" data-remove-evidence="' + safeEventName + '" data-evidence-id="' + safeId + '">Quitar</button>',
        '</div>',
        '</article>'
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

  function syncOperationalMenuLabels() {
    const labels = {
      "ze-action-recepcion": ["HU758 · Recepción en ZE", "Registrar llegada de vehículo en zona externa."],
      "ze-action-despacho": ["HU303 · Salida ZE", "Registrar salida operativa hacia finca."]
    };
    Object.entries(labels).forEach(([id, copy]) => {
      const link = document.getElementById(id);
      if (!link) return;
      const title = link.querySelector("strong");
      const detail = title?.nextElementSibling;
      if (title) title.textContent = copy[0];
      if (detail) detail.textContent = copy[1];
    });
  }

  function normalizeInspectionLabel(value) {
    return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
  }

  function inspectionLabelEventName(capture) {
    return capture.closest("[data-flow-form]")?.dataset.event || "portExternalInspection";
  }

  function readInspectionLabels(eventName) {
    if (isPrototypeReviewPage()) {
      window._sialPrototypeInspectionLabels = window._sialPrototypeInspectionLabels || {};
      return window._sialPrototypeInspectionLabels[eventName] || [];
    }
    var state = readState();
    return (state.inspectionLabels || {})[eventName] || [];
  }

  function writeInspectionLabels(eventName, labels) {
    if (isPrototypeReviewPage()) {
      window._sialPrototypeInspectionLabels = window._sialPrototypeInspectionLabels || {};
      window._sialPrototypeInspectionLabels[eventName] = labels;
      return;
    }
    var state = readState();
    state.inspectionLabels = state.inspectionLabels || {};
    state.inspectionLabels[eventName] = labels;
    writeState(state);
  }

  function selectedInspectionLabelType(capture) {
    return capture.querySelector("[data-inspection-label-type] .sial-segment-option[aria-pressed='true']")?.dataset.value || "INTERNA";
  }

  function renderInspectionLabels() {
    document.querySelectorAll("[data-inspection-label-capture]").forEach(function(capture) {
      var eventName = inspectionLabelEventName(capture);
      var labels = readInspectionLabels(eventName);
      var list = capture.querySelector("[data-inspection-label-list]");
      var hiddenFields = capture.querySelector("[data-inspection-label-hidden-fields]");
      var internalCount = labels.filter(function(item) { return item.type === "INTERNA"; }).length;
      var externalCount = labels.filter(function(item) { return item.type === "EXTERNA"; }).length;
      var damagedCount = labels.filter(function(item) { return item.damaged; }).length;
      capture.querySelectorAll("[data-inspection-label-count]").forEach(function(node) {
        node.textContent = String(node.dataset.inspectionLabelCount === "INTERNA" ? internalCount : externalCount);
      });
      var damagedNode = capture.querySelector("[data-inspection-label-damaged-count]");
      if (damagedNode) damagedNode.textContent = String(damagedCount);
      if (hiddenFields) {
        hiddenFields.replaceChildren();
        labels.forEach(function(item) {
          var field = document.createElement("input");
          field.type = "hidden";
          field.name = "etiquetas_inspeccion[]";
          field.value = JSON.stringify({ codigo: item.code, tipo: item.type, danada: Boolean(item.damaged) });
          hiddenFields.appendChild(field);
        });
      }
      if (!list) return;
      if (!labels.length) {
        list.innerHTML = '<div class="sial-inspection-label-empty"><strong>Sin etiquetas registradas</strong><span>Escanea la primera etiqueta para iniciar el registro.</span></div>';
        return;
      }
      list.innerHTML = labels.map(function(item, index) {
        var type = item.type === "EXTERNA" ? "Externa" : "Interna";
        var damageLabel = item.damaged ? "Marcada dañada" : "Marcar dañada";
        return '<article class="sial-inspection-label-item' + (item.damaged ? ' is-damaged' : '') + '" data-inspection-label-item>' +
          '<div><span class="sial-pill info">' + type + '</span><strong>' + escapeHtml(item.code) + '</strong></div>' +
          '<div class="sial-inspection-label-actions"><button class="sial-chip-action' + (item.damaged ? ' danger' : '') + '" type="button" data-inspection-label-damage="' + index + '">' + damageLabel + '</button><button class="sial-chip-action" type="button" data-inspection-label-remove="' + index + '">Quitar</button></div>' +
          '</article>';
      }).join("");
    });
  }

  function scanInspectionLabel(capture) {
    if (!window.SialMobileUI || typeof window.SialMobileUI.openBarcodeScanner !== "function") {
      showToast({ type: "error", title: "Escáner no disponible", message: "No fue posible abrir el lector de etiquetas." });
      return;
    }
    var eventName = inspectionLabelEventName(capture);
    var labelType = selectedInspectionLabelType(capture);
    window.SialMobileUI.openBarcodeScanner({
      title: "Escanear etiqueta " + (labelType === "EXTERNA" ? "externa" : "interna"),
      eyebrow: "Inspección externa ZE",
      manualLabel: "Registrar etiqueta",
      normalize: normalizeInspectionLabel,
      validate: function(value) {
        var code = normalizeInspectionLabel(value);
        if (code.length < 2 || !/^[A-Z0-9-]+$/.test(code)) return { ok: false, message: "Ingresa un código de etiqueta válido." };
        if (readInspectionLabels(eventName).some(function(item) { return item.code === code; })) return { ok: false, message: "Esta etiqueta ya fue registrada." };
        return { ok: true, message: "Etiqueta lista para registrar." };
      },
      onDetected: function(value) {
        var code = normalizeInspectionLabel(value);
        var labels = readInspectionLabels(eventName).slice();
        labels.push({ code: code, type: labelType, damaged: false });
        writeInspectionLabels(eventName, labels);
        renderInspectionLabels();
        markUnsaved("inspection-label");
        showToast({ type: "success", title: "Etiqueta registrada", message: code + " se agregó como " + (labelType === "EXTERNA" ? "externa" : "interna") + "." });
      }
    });
  }

  function boot() {
    syncOperationalMenuLabels();
    mountCompactInspectionPointSelects();
    const state = readState();
    ensureInspectionContextSummary(state);
    hydrateSummary(state);
    hydrateGuard(state);
    hydrateTimeline(state);
    hydrateLists(state);
    hydrateAlerts(state);
    hydrateControlPoints(state);
    renderInspectionLabels();
    hydrateSignatures(state);
    hydrateEvidence(state);
    hydratePhotoSlots(state);
    hydrateZeReceptionEvidenceGalleries(state);
    openInspectionContainerSelector();

    document.addEventListener("input", (event) => {
      const inspectionContainerSearch = event.target.closest("[data-inspection-container-search-input]");
      if (!inspectionContainerSearch) return;
      filterInspectionContainerOptions(inspectionContainerSearch);
    });

    document.addEventListener("change", (event) => {
      const pointSelect = event.target.closest("select[data-cp-select]");
      if (pointSelect) persistControlPointSelect(pointSelect);
    });

    document.addEventListener("click", (event) => {
      const scanButton = event.target.closest("[data-inspection-label-scan]");
      if (scanButton) {
        const capture = scanButton.closest("[data-inspection-label-capture]");
        if (capture) scanInspectionLabel(capture);
        return;
      }
      const damageButton = event.target.closest("[data-inspection-label-damage]");
      if (damageButton) {
        const capture = damageButton.closest("[data-inspection-label-capture]");
        if (!capture) return;
        const eventName = inspectionLabelEventName(capture);
        const labels = readInspectionLabels(eventName).slice();
        const index = Number(damageButton.dataset.inspectionLabelDamage);
        if (!labels[index]) return;
        labels[index].damaged = !labels[index].damaged;
        writeInspectionLabels(eventName, labels);
        renderInspectionLabels();
        markUnsaved("inspection-label");
        return;
      }
      const removeButton = event.target.closest("[data-inspection-label-remove]");
      if (removeButton) {
        const capture = removeButton.closest("[data-inspection-label-capture]");
        if (!capture) return;
        const eventName = inspectionLabelEventName(capture);
        const labels = readInspectionLabels(eventName).slice();
        const index = Number(removeButton.dataset.inspectionLabelRemove);
        if (index < 0 || index >= labels.length) return;
        labels.splice(index, 1);
        writeInspectionLabels(eventName, labels);
        renderInspectionLabels();
        markUnsaved("inspection-label");
      }
    });

    document.addEventListener("click", (event) => {
      const changeInspectionContainer = event.target.closest("[data-change-inspection-container]");
      if (changeInspectionContainer) {
        openInspectionContainerSelector({ force: true });
        return;
      }

      const inspectionContainerPage = event.target.closest("[data-inspection-container-page]");
      if (inspectionContainerPage) {
        var selector = inspectionContainerPage.closest(".sial-container-selector");
        if (!selector) return;
        var currentPage = Number(selector.dataset.inspectionContainerCurrentPage || 1);
        var direction = inspectionContainerPage.dataset.inspectionContainerPage;
        updateInspectionContainerPagination(selector, direction === "next" ? currentPage + 1 : currentPage - 1);
        return;
      }

      const inspectionContainerOption = event.target.closest("[data-inspection-container-option]");
      if (inspectionContainerOption) {
        var targetEvent = inspectionContainerOption.dataset.inspectionTargetEvent || "";
        var containerId = inspectionContainerOption.dataset.inspectionContainerOption || "";
        var stContainer = readState();
        var selectedContainer = availableInspectionContainers(stContainer).find(function(item) { return item.id === containerId; });
        if (!selectedContainer || !targetEvent) return;
        if (selectedContainer.nextInspectionEvent !== targetEvent) return;
        applyInspectionContainerToState(stContainer, selectedContainer, targetEvent);
        writeState(stContainer);
        ensureInspectionContextSummary(stContainer);
        hydrateSummary(stContainer);
        hydrateGuard(stContainer);
        hydrateAlerts(stContainer);
        hydrateControlPoints(stContainer);
        hydrateEvidence(stContainer);
        if (window.SialMobileUI && typeof window.SialMobileUI.closeDialog === "function") {
          window.SialMobileUI.closeDialog("inspection-container-selector", { immediate: true });
        }
        showToast({
          type: "success",
          title: "Contenedor seleccionado",
          message: selectedContainer.container + " cargado para " + (labels[targetEvent] || "inspeccion") + "."
        });
        return;
      }

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
        markUnsaved("field");
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
          return;
        }
        if (!found.active) {
          if (statusEl) window.SialMobileUI && window.SialMobileUI.setInlineStatus(statusEl, { type: "warning", title: "Vehiculo inactivo", message: found.truckPlate + " esta inactivo. Contacte al administrador." });
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
        markUnsaved("field");
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
        const valueInput = container.querySelector("[data-cp-value]");
        if (valueInput) valueInput.value = value;
        if (isPrototypeReviewPage()) {
          container.querySelectorAll("[data-cp-option]").forEach(function(b) {
            var isSelected = b === cpOption;
            b.classList.toggle("active", isSelected);
            b.setAttribute("aria-pressed", String(isSelected));
          });
          cpOption.classList.add("active");
          const statusEl = container.querySelector("[data-cp-status]");
          if (statusEl) {
            statusEl.textContent = controlPointStatusLabel(value);
            statusEl.className = "sial-pill" + controlPointStatusClass(value);
          }
          var needsNovelty = value === "CON_NOVEDAD";
          var needsReason = value === "NO_INSPECCIONABLE";
          var noveltyArea = container.querySelector("[data-cp-novelty-area]");
          if (noveltyArea) noveltyArea.hidden = !needsNovelty;
          var reasonArea = container.querySelector("[data-cp-reason-area]");
          if (reasonArea) reasonArea.hidden = !needsReason;
          markUnsaved("control-point");
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
        container.querySelectorAll("[data-cp-option]").forEach(function(b) {
          var isSelected = b === cpOption;
          b.classList.toggle("active", isSelected);
          b.setAttribute("aria-pressed", String(isSelected));
        });
        cpOption.classList.add("active");
        const statusEl = container.querySelector("[data-cp-status]");
        if (statusEl) {
          statusEl.textContent = controlPointStatusLabel(value);
          statusEl.className = "sial-pill" + controlPointStatusClass(value);
        }
        var needsNovelty = value === "CON_NOVEDAD";
        var needsReason = value === "NO_INSPECCIONABLE";
        var noveltyArea = container.querySelector("[data-cp-novelty-area]");
        if (noveltyArea) noveltyArea.hidden = !needsNovelty;
        var reasonArea = container.querySelector("[data-cp-reason-area]");
        if (reasonArea) reasonArea.hidden = !needsReason;
        markUnsaved("control-point");
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
        var evidenceLimit = evidenceCaptureLimits[evEventName] || 0;
        if (evidenceLimit && currentCount >= evidenceLimit) {
          showToast({ type: "warning", title: "Máximo alcanzado", message: "Se alcanzó el máximo de " + evidenceLimit + " evidencias." });
          return;
        }
        var pointList = (evidencePointCatalog[evEventName] || []).slice();
        if (!pointList.length) {
          document.querySelectorAll("[data-control-point][data-control-point-event='" + evEventName + "']").forEach(function(cp) {
            pointList.push({ label: cp.dataset.controlPointName || cp.dataset.controlPoint, value: cp.dataset.controlPoint });
          });
        }
        if (!pointList.length) { showToast({ type: "warning", title: "Sin evidencias", message: "No hay evidencias configuradas para esta vista." }); return; }

        function pendingPoints(points) {
          var capturedKeys = {};
          ((st.evidence || {})[evEventName] || []).forEach(function(item) {
            if (item.controlPoint) capturedKeys[item.controlPoint] = true;
          });
          var pending = points.filter(function(point) { return !capturedKeys[point.value]; });
          return pending.length ? pending : points;
        }

        function maxCaptureSlots() {
          return evidenceLimit ? Math.max(0, evidenceLimit - currentCount) : pointList.length;
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

      const viewEvidencePhoto = event.target.closest("[data-view-evidence-photo]");
      if (viewEvidencePhoto) {
        var viewEvent = viewEvidencePhoto.dataset.viewEvidencePhoto;
        var viewId = viewEvidencePhoto.dataset.evidenceId;
        if (viewEvent && viewId) openEvidencePhotoViewer(viewEvent, viewId);
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
          markUnsaved("evidence");
          showToast({ type: "info", title: "Evidencia eliminada", message: "La foto fue retirada de la vista." });
          return;
        }
        var st = readState();
        st.evidence = st.evidence || {};
        st.evidence[rmEvent] = (st.evidence[rmEvent] || []).filter(function(e) { return e.id !== rmId; });
        writeState(st);
        renderEvidenceGallery(st, rmEvent);
        markUnsaved("evidence");
        showToast({ type: "info", title: "Evidencia eliminada", message: "La foto fue retirada del registro." });
        return;
      }

      const toggleNovelty = event.target.closest("[data-toggle-novelty]");
      if (toggleNovelty) {
        var tgEvent = toggleNovelty.dataset.toggleNovelty;
        var tgId = toggleNovelty.dataset.evidenceId;
        if (!tgEvent || !tgId) return;
        openEvidenceNoveltySheet(tgEvent, tgId);
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
            markUnsaved("signature");
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
            markUnsaved("signature");
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
        clearUnsaved();
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
        return;
      }
      const ruleError = validateFormRules(form, state, eventName);
      if (ruleError) {
        showInline(form, ruleError);
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
      clearUnsaved();

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
        window.setTimeout(function() {
          if (window.SialMobileUI && typeof window.SialMobileUI.navigateTo === "function") {
            window.SialMobileUI.navigateTo(form.dataset.next, { force: true });
          } else {
            window.location.href = form.dataset.next;
          }
        }, 650);
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
          updateConnectionBanner();
          return;
        }
        if (window.SialMobileUI) window.SialMobileUI.hideBanner("network-offline");
        state.eventSyncStatus = state.eventSyncStatus || {};
        state.eventSyncStatus[eventName] = "SYNCING";
        writeState(state);
        hydrateSummary(state);
        showBanner({
          id: "sync-event",
          type: "info",
          title: "Sincronizando",
          message: "Enviando el evento al servidor.",
          dismissible: false
        });
        window.setTimeout(function() {
          var fresh = readState();
          fresh.eventSyncStatus = fresh.eventSyncStatus || {};
          var success = Math.random() > 0.2;
          fresh.eventSyncStatus[eventName] = success ? "SYNCED" : "SYNC_FAILED";
          writeState(fresh);
          hydrateSummary(fresh);
          if (success) {
            if (window.SialMobileUI) window.SialMobileUI.hideBanner("sync-event");
            showToast({ type: "success", title: "Sincronizado", message: "El evento fue confirmado por el servidor." });
          } else {
            showBanner({
              id: "sync-event",
              type: "error",
              title: "No se pudo sincronizar",
              message: "El servidor no procesó el evento. Puedes volver a intentarlo sin perder la información local.",
              action: { label: "Reintentar", onClick: function() { retryBtn.click(); } }
            });
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
      const zeReceptionTrigger = event.target.closest("[data-ze-reception-photo-trigger]");
      if (zeReceptionTrigger) {
        if (pageHasBlockingRequirement()) {
          showFlowBlocked();
          return;
        }
        openZeReceptionEvidenceCapture(zeReceptionTrigger.closest("[data-flow-form]"));
        return;
      }

      const zeReceptionOpen = event.target.closest("[data-ze-reception-photo-open]");
      if (zeReceptionOpen) {
        var zeOpenForm = zeReceptionOpen.closest("[data-flow-form]");
        var openIndex = Number(zeReceptionOpen.dataset.zeReceptionPhotoOpen);
        openZeReceptionPhotoViewer(zeOpenForm, openIndex);
        return;
      }

      const zeReceptionRemove = event.target.closest("[data-ze-reception-photo-remove]");
      if (zeReceptionRemove) {
        var zeForm = zeReceptionRemove.closest("[data-flow-form]");
        var removeIndex = Number(zeReceptionRemove.dataset.zeReceptionPhotoRemove);
        var zePhotos = readZeReceptionEvidencePhotos(zeForm).filter(function(_, index) { return index !== removeIndex; });
        writeZeReceptionEvidencePhotos(zeForm, zePhotos);
        showToast({ type: "info", title: "Evidencia retirada", message: "La foto fue retirada de la recepcion." });
        return;
      }

      const photo = event.target.closest("[data-add-photo]");
      if (photo) {
        if (pageHasBlockingRequirement()) {
          showFlowBlocked();
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
                markUnsaved("photo");
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
              markUnsaved("photo");
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
        markUnsaved("photo");
        showToast({ type: "success", title: "Foto agregada", message: "Evidencia asociada al registro." });
      }

      const photoSet = event.target.closest("[data-add-photo-set]");
      if (photoSet) {
        if (pageHasBlockingRequirement()) {
          showFlowBlocked();
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
                markUnsaved("photo");
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
              markUnsaved("photo");
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
        markUnsaved("photo");
        showToast({ type: "success", title: "Evidencia completada", message: `${count} foto(s) por punto obligatorio.` });
      }

      const scan = event.target.closest("[data-add-box]");
      if (scan) {
        if (pageHasBlockingRequirement()) {
          showFlowBlocked();
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
        markUnsaved("box");
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
        markUnsaved("box");
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
        markUnsaved("box");
        showToast({ type: "info", title: "Caja lista para editar", message: "Ajusta el codigo y vuelve a registrarla." });
      }

      const resetForm = event.target.closest("[data-reset-form]");
      if (resetForm) {
        var resetFormId = resetForm.dataset.resetForm || "";
        var targetForm = resetFormId ? document.getElementById(resetFormId) : resetForm.closest("form");
        if (!targetForm) return;
        targetForm.reset();
        targetForm.querySelectorAll(".sial-select-native").forEach(function(select) {
          select.dispatchEvent(new Event("change", { bubbles: true }));
        });
        clearInline(targetForm);
        showToast({ type: "info", title: "Formulario limpio", message: "Puedes registrar un nuevo despacho." });
        return;
      }

      const reset = event.target.closest("[data-reset-flow]");
      if (reset) {
        clearUnsaved();
        localStorage.removeItem(stateKey);
        showToast({ type: "info", title: "Flujo reiniciado", message: "Datos restaurados." });
        window.setTimeout(() => window.location.reload(), 450);
      }
    });
  }

  boot();
})();
