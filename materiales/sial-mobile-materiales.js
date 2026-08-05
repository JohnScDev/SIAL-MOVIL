(function () {
  const stateKey = "sial-mobile-materiales";
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const dataset = {
    suggested: {
      id: "PED-SUG-2026-032-014",
      notice: "AC-2026-032",
      finca: "Finca La Ceiba",
      week: "SEM-2026-32",
      reference: "AGSTDRA",
      recipe: "Receta versión 3",
      inventory: "03/08/2026, 06:40",
      status: "SUGERIDO",
      materials: [
        { name: "Caja de cartón corrugado", quantity: "744 unidades" },
        { name: "Tapa de cartón", quantity: "804 unidades" },
        { name: "Etiqueta de trazabilidad", quantity: "25 rollos" },
        { name: "Estiba de exportación", quantity: "28 unidades" }
      ]
    },
    additionalMaterials: [
      { code: "MAT-CAR-001", name: "Caja de cartón corrugado", unit: "unidades", base: 790, stock: 1280 },
      { code: "MAT-TAP-001", name: "Tapa de cartón", unit: "unidades", base: 925, stock: 900 },
      { code: "MAT-ETQ-001", name: "Etiqueta de trazabilidad", unit: "rollos", base: 25, stock: 12 },
      { code: "MAT-EST-001", name: "Estiba de exportación", unit: "unidades", base: 28, stock: 12 }
    ],
    stock: [
      { material: "Caja carton corrugado", finca: "Finca Santa Isabel", available: "1280 und", updated: "28/06/2026 07:40", status: "Disponible" },
      { material: "Caja carton corrugado", finca: "Finca El Retiro", available: "360 und", updated: "28/06/2026 07:50", status: "Bajo" },
      { material: "Estiba madera exportacion", finca: "Finca Santa Isabel", available: "94 und", updated: "28/06/2026 06:58", status: "Disponible" },
      { material: "Separador de pallet", finca: "Finca Las Palmas", available: "18 pq", updated: "27/06/2026 18:12", status: "Revision" }
    ],
    orders: [
      { id: "OTI-546-001", document: "RPT-2026-0881", finca: "Finca Santa Isabel", material: "Caja carton corrugado + estibas", quantity: "1480 unidades", vehicle: "TUL458", driver: "Carlos Mendoza", status: "ASIGNADO", notified: "Transporte, conductor, seguridad y finca" },
      { id: "OTI-546-002", document: "REM-2026-0184", finca: "Finca El Retiro", material: "Caja carton corrugado", quantity: "520 unidades", vehicle: "CAM-102", driver: "Ana Ramirez", status: "EN_TRANSITO", notified: "Transporte y conductor" }
    ],
    pallets: [
      { reference: "BAN-REF-001", finca: "Finca Santa Isabel", type: "Completo", pallets: "18", boxes: "0", destination: "SIALU1234567" },
      { reference: "BAN-REF-011", finca: "Finca Las Palmas", type: "Mocho", pallets: "1", boxes: "14", destination: "Consolidacion posterior" },
      { reference: "BAN-REF-014", finca: "Finca Santa Isabel", type: "Mocho", pallets: "1", boxes: "8", destination: "Consolidacion posterior" }
    ]
  };

  function loadState() {
    try {
      return { activeOrderId: "OTI-546-001", consulted: false, additional: null, podPhoto: false, podSignature: false, closed: false, ...(JSON.parse(localStorage.getItem(stateKey)) || {}) };
    } catch (_) {
      return { activeOrderId: "OTI-546-001", consulted: false, additional: null, podPhoto: false, podSignature: false, closed: false };
    }
  }

  function saveState(state) {
    localStorage.setItem(stateKey, JSON.stringify(state));
  }

  function ui() {
    return window.SialMobileUI || {};
  }

  function toast(type, title, message) {
    ui().showToast?.({ type, title, message });
  }

  function icon(path) {
    return `<svg class="sial-icon" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
  }

  function status(text) {
    const value = String(text || "").toLowerCase();
    const type = value.includes("bajo") || value.includes("revision") || value.includes("transito") || value.includes("asignado") || value.includes("sugerido") ? "warning" : "info";
    const done = value.includes("entregada") || value.includes("cerrada") || value.includes("disponible") || value.includes("consultado");
    return `<span class="sial-chip-action ${done ? "success" : type}">${esc(text)}</span>`;
  }

  function actionCard(href, title, text, path) {
    return `<a class="sial-action-card" href="${esc(href)}"><span><strong>${esc(title)}</strong><span>${esc(text)}</span></span><span class="sial-action-icon">${icon(path)}</span></a>`;
  }

  function mini(label, value) {
    return `<div class="sial-material-mini"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
  }

  function activeOrder(state = loadState()) {
    return dataset.orders.find((item) => item.id === state.activeOrderId) || dataset.orders[0];
  }

  function orderCard(order, selected) {
    return `
      <article class="sial-card sial-card-pad sial-material-order-card">
        <div class="sial-material-order-head">
          <div><strong>${esc(order.id)}</strong><span>${esc(order.document)} - ${esc(order.finca)}</span></div>
          ${status(order.status)}
        </div>
        <div class="sial-material-matrix">
          ${mini("Materiales", order.material)}
          ${mini("Cantidad", order.quantity)}
          ${mini("Vehiculo", order.vehicle)}
          ${mini("Conductor", order.driver)}
        </div>
        <button class="sial-btn ${selected ? "sial-btn-secondary" : "sial-btn-primary"} sial-btn-full" type="button" data-material-action="select-order" data-order-id="${esc(order.id)}">${selected ? "Orden seleccionada" : "Seleccionar orden"}</button>
      </article>
    `;
  }

  function dashboard() {
    const state = loadState();
    const order = activeOrder(state);
    return `
      <section class="sial-command-hero">
        <div><h1>Materiales y suministros</h1><p>Pedidos, stock, ordenes asignadas, entrega movil y POD.</p></div>
        <a class="sial-btn sial-btn-primary sial-btn-full" href="ordenes-asignadas.html">Continuar con ${esc(order.id)}</a>
      </section>
      <section class="sial-stat-row">
        <div class="sial-stat"><strong>${dataset.orders.length}</strong><span>Ordenes asignadas</span></div>
        <div class="sial-stat"><strong>${dataset.stock.length}</strong><span>Stocks visibles</span></div>
      </section>
      <section class="sial-quick-grid">
        ${actionCard("pedido-sugerido.html", "Pedido sugerido", "HU659 conectado con stock finca.", '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>')}
        ${actionCard("inventario-finca.html", "Inventario finca", "Consulta stock antes de confirmar.", '<path d="M4 7h16v10H4z"/><path d="M8 7V5h8v2"/>')}
        ${actionCard("pedido-adicional.html", "Pedido adicional", "Solicitud excepcional vinculada al corte.", '<path d="M12 5v14"/><path d="M5 12h14"/>')}
        ${actionCard("ordenes-asignadas.html", "Ordenes asignadas", "Despacho y notificaciones.", '<path d="M3 7h11v10H3z"/><path d="M14 11h4l3 3v3h-7z"/>')}
        ${actionCard("pallets.html", "Pallets", "Completos y mochos para consolidacion.", '<path d="M5 7h14"/><path d="M5 12h14"/><path d="M5 17h14"/>')}
      </section>
    `;
  }

  function suggested() {
    const state = loadState();
    const pedido = dataset.suggested;
    return `
      <section class="sial-card sial-card-pad sial-material-order-card">
        <div class="sial-material-order-head">
          <div><strong>${esc(pedido.id)}</strong><span>${esc(pedido.finca)} · ${esc(pedido.week)}</span></div>
          ${status(state.consulted ? "Consultado" : pedido.status)}
        </div>
        <div class="sial-material-source-line"><span>Aviso</span><strong>${esc(pedido.notice)}</strong></div>
        <div class="sial-material-source-line"><span>Referencia</span><strong>${esc(pedido.reference)}</strong></div>
        <div class="sial-material-source-line"><span>Receta aplicada</span><strong>${esc(pedido.recipe)}</strong></div>
        <div class="sial-material-source-line"><span>Inventario consultado</span><strong>${esc(pedido.inventory)}</strong></div>
      </section>
      <section class="sial-card sial-card-pad">
        <div class="sial-material-section-head"><div><h2 class="sial-section-title">Materiales sugeridos</h2><p>Resultado calculado en Web para esta finca.</p></div><span class="sial-chip-action info">${pedido.materials.length} materiales</span></div>
        <div class="sial-list sial-material-suggestion-list">${pedido.materials.map((item) => `<div class="sial-list-row"><strong>${esc(item.name)}</strong><span>${esc(item.quantity)}</span></div>`).join("")}</div>
      </section>
      <section class="sial-status info" role="status"><span class="sial-feedback-copy"><strong>Consulta de solo lectura</strong><p>Los ajustes de cantidades se gestionan en el paso de revisión del pedido.</p></span></section>
      <div class="sial-bottom-actions"><button class="sial-btn sial-btn-primary sial-btn-full" type="button" data-material-action="confirm-suggestion" ${state.consulted ? "disabled" : ""}>${state.consulted ? "Consulta registrada" : "Marcar como revisado"}</button><button class="sial-btn sial-btn-secondary sial-btn-full" type="button" data-material-action="open-additional" ${state.consulted ? "" : "disabled"}>Solicitar material adicional</button></div>
    `;
  }

  function additionalStock(code) {
    return dataset.additionalMaterials.find((item) => item.code === code) || dataset.additionalMaterials[0];
  }

  function additionalOrder() {
    const state = loadState();
    const pedido = dataset.suggested;
    const params = new URLSearchParams(location.search);
    if (params.get("access") === "denied") {
      return `<section class="sial-status error" role="alert"><span class="sial-feedback-copy"><strong>Solicitud no disponible</strong><p>No existe información visible dentro de tu compañía y finca autorizada.</p></span></section><a class="sial-btn sial-btn-secondary sial-btn-full" href="index.html">Volver a Materiales</a>`;
    }
    if (!state.consulted) {
      return `<section class="sial-status warning" role="alert"><span class="sial-feedback-copy"><strong>Revisa primero el pedido base</strong><p>Marca ${esc(pedido.id)} como revisado antes de registrar una necesidad adicional.</p></span></section><a class="sial-btn sial-btn-primary sial-btn-full" href="pedido-sugerido.html">Revisar pedido sugerido</a>`;
    }
    if (state.additional) {
      const item = state.additional;
      return `
        <section class="sial-card sial-card-pad sial-material-order-card">
          <div class="sial-material-order-head"><div><strong>${esc(item.id)}</strong><span>${esc(pedido.finca)} · ${esc(pedido.week)}</span></div>${status(item.sync === "pending" ? "Pendiente de sincronización" : item.status)}</div>
          <div class="sial-material-source-line"><span>Pedido base</span><strong>${esc(pedido.id)}</strong></div>
          <div class="sial-material-source-line"><span>Aviso de corte</span><strong>${esc(pedido.notice)}</strong></div>
          <div class="sial-material-source-line"><span>Material</span><strong>${esc(item.materialName)}</strong></div>
          <div class="sial-material-source-line"><span>Cantidad adicional</span><strong>${esc(item.quantity)} ${esc(item.unit)}</strong></div>
          <div class="sial-material-source-line"><span>Motivo</span><strong>${esc(item.reasonLabel)}</strong></div>
        </section>
        <section class="sial-card sial-card-pad"><h2 class="sial-section-title">Seguimiento</h2><div class="sial-additional-timeline">
          <div class="is-done"><i>${icon('<path d="m20 6-11 11-5-5"/>')}</i><span><strong>Solicitud registrada</strong><small>Guardada una sola vez en este dispositivo.</small></span></div>
          <div class="is-current"><i></i><span><strong>${item.sync === "pending" ? "Pendiente de sincronización" : "Pendiente de validación"}</strong><small>${item.stockWarning ? "Requiere revisar disponibilidad de abastecimiento." : "Materiales validará cantidad, motivo y stock."}</small></span></div>
          <div><i></i><span><strong>Clasificación y despacho</strong><small>Continuará en Web después de la aprobación.</small></span></div>
        </div></section>
        <section class="sial-status info" role="status"><span class="sial-feedback-copy"><strong>Consulta de estado</strong><p>La aprobación y el procesamiento no se realizan desde esta vista móvil.</p></span></section>
        <a class="sial-btn sial-btn-secondary sial-btn-full" href="pedido-sugerido.html">Volver al pedido base</a>
      `;
    }
    const material = dataset.additionalMaterials[0];
    return `
      <section class="sial-additional-origin" aria-label="Origen de la solicitud"><div><span>Aviso</span><strong>${esc(pedido.notice)}</strong></div><b>→</b><div><span>Pedido base</span><strong>${esc(pedido.id)}</strong></div><b>→</b><div class="active"><span>Nueva solicitud</span><strong>Adicional 3</strong></div></section>
      <section class="sial-card sial-card-pad sial-material-order-card">
        <div class="sial-material-order-head"><div><strong>${esc(pedido.finca)}</strong><span>${esc(pedido.reference)} · ${esc(pedido.week)}</span></div>${status("Pedido validado")}</div>
        <div class="sial-status info"><span class="sial-feedback-copy"><strong>Necesidad excepcional</strong><p>Ya existe 1 adicional esta semana. No se reemplazará el pedido base.</p></span></div>
      </section>
      <form class="sial-card sial-card-pad sial-form sial-additional-form" data-flow-form data-additional-mobile-form>
        <h2 class="sial-section-title">Material y cantidad</h2>
        <div class="sial-field"><label class="sial-label" for="mobileAdditionalMaterial">Material</label><select class="sial-select" id="mobileAdditionalMaterial" required>${dataset.additionalMaterials.map((item) => `<option value="${esc(item.code)}">${esc(item.name)}</option>`).join("")}</select></div>
        <div class="sial-additional-stock" data-additional-mobile-stock><div><span>Pedido base</span><strong>${esc(material.base)} ${esc(material.unit)}</strong></div><div><span>Stock visible</span><strong>${esc(material.stock)} ${esc(material.unit)}</strong></div></div>
        <div class="sial-field"><label class="sial-label" for="mobileAdditionalQuantity">Cantidad adicional</label><input class="sial-input-wrap sial-input" id="mobileAdditionalQuantity" type="number" min="1" step="1" inputmode="numeric" placeholder="Ingresa la cantidad" required></div>
        <div class="sial-field"><label class="sial-label" for="mobileAdditionalReason">Motivo</label><select class="sial-select" id="mobileAdditionalReason" required><option value="">Seleccionar motivo</option><option value="incremento-corte">Incremento extraordinario del corte</option><option value="inventario">Diferencia de inventario</option><option value="entrega-incompleta">Entrega incompleta del proveedor</option><option value="dano">Material dañado o no utilizable</option><option value="otro">Otra necesidad operativa</option></select></div>
        <div class="sial-field"><label class="sial-label" for="mobileAdditionalDetail">Detalle <span>(opcional)</span></label><textarea class="sial-textarea" id="mobileAdditionalDetail" rows="3" placeholder="Información útil para quien validará la solicitud"></textarea></div>
      </form>
      <div data-additional-mobile-status></div>
      <div class="sial-bottom-actions"><button class="sial-btn sial-btn-primary sial-btn-full" type="button" data-material-action="additional-order">Enviar a validación</button></div>
    `;
  }

  function updateAdditionalStock(code) {
    const target = qs("[data-additional-mobile-stock]");
    if (!target) return;
    const material = additionalStock(code);
    target.innerHTML = `<div><span>Pedido base</span><strong>${esc(material.base)} ${esc(material.unit)}</strong></div><div><span>Stock visible</span><strong>${esc(material.stock)} ${esc(material.unit)}</strong></div>`;
  }

  function inventory() {
    return `<section class="sial-card sial-card-pad"><h2 class="sial-section-title">Stock por finca</h2><div class="sial-list">${dataset.stock.map((item) => `
      <div class="sial-list-row"><strong>${esc(item.material)}</strong><span>${esc(item.finca)} - ${esc(item.available)}</span>${status(item.status)}</div>
    `).join("")}</div></section>`;
  }

  function orders() {
    const state = loadState();
    return `<section class="sial-material-summary">${dataset.orders.map((order) => orderCard(order, order.id === state.activeOrderId)).join("")}</section>`;
  }

  function detail() {
    const order = activeOrder();
    return `
      <section class="sial-card sial-card-pad sial-material-order-card">
        <div class="sial-material-order-head"><div><strong>${esc(order.id)}</strong><span>${esc(order.document)} - ${esc(order.finca)}</span></div>${status(order.status)}</div>
        <div class="sial-material-matrix">${mini("Materiales", order.material)}${mini("Cantidad", order.quantity)}${mini("Vehiculo", order.vehicle)}${mini("Conductor", order.driver)}</div>
        <div class="sial-list-row"><strong>Notificado a</strong><span>${esc(order.notified)}</span></div>
      </section>
      <section class="sial-card sial-card-pad">
        <h2 class="sial-section-title">Ruta de entrega</h2>
        <div class="sial-material-route">
          <div class="sial-material-route-step"><i>1</i><div class="sial-list-row"><strong>Orden asignada</strong><span>Documento visible para transportista</span></div></div>
          <div class="sial-material-route-step"><i>2</i><div class="sial-list-row"><strong>Entrega en finca</strong><span>Registrar fecha, receptor y evidencia</span></div></div>
          <div class="sial-material-route-step"><i>3</i><div class="sial-list-row"><strong>POD obligatorio</strong><span>Foto y firma antes de cerrar</span></div></div>
        </div>
      </section>
      <div class="sial-bottom-actions"><a class="sial-btn sial-btn-primary sial-btn-full" href="registrar-entrega.html">Registrar entrega</a></div>
    `;
  }

  function delivery() {
    const state = loadState();
    const order = activeOrder(state);
    return `
      <form class="sial-card sial-card-pad sial-form" data-flow-form>
        <h2 class="sial-section-title">${esc(order.id)}</h2>
        <div class="sial-field"><label class="sial-label">Receptor</label><input class="sial-input-wrap sial-input" value="Laura Pineda"></div>
        <div class="sial-field"><label class="sial-label">Fecha y hora entrega</label><input class="sial-input-wrap sial-input" type="datetime-local" value="2026-06-28T15:40"></div>
        <div class="sial-field"><label class="sial-label">Observacion</label><textarea class="sial-textarea">Entrega conforme en finca.</textarea></div>
      </form>
      <section class="sial-material-pod-grid">
        <button class="sial-material-pod-box ${state.podPhoto ? "done" : ""}" type="button" data-material-action="capture-pod">${icon('<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>')}<strong>${state.podPhoto ? "Foto POD capturada" : "Capturar foto POD"}</strong></button>
        <button class="sial-material-pod-box ${state.podSignature ? "done" : ""}" type="button" data-material-action="sign-pod">${icon('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>')}<strong>${state.podSignature ? "Firma digital capturada" : "Capturar firma digital"}</strong></button>
      </section>
      <div data-material-pod-status></div>
      <div class="sial-bottom-actions"><button class="sial-btn sial-btn-primary sial-btn-full" type="button" data-material-action="close-delivery">Cerrar entrega</button></div>
    `;
  }

  function pod() {
    const state = loadState();
    const order = activeOrder(state);
    return `
      <section class="sial-card sial-card-pad sial-material-order-card">
        <div class="sial-material-order-head"><div><strong>POD - ${esc(order.id)}</strong><span>${esc(order.document)} - ${esc(order.finca)}</span></div>${status(state.closed ? "Cerrada" : "Pendiente")}</div>
        <div class="sial-material-matrix">${mini("Foto receptor", state.podPhoto ? "Capturada" : "Pendiente")}${mini("Firma digital", state.podSignature ? "Capturada" : "Pendiente")}${mini("Usuario", "transportista.app")}${mini("Fecha", state.closed ? "28/06/2026 15:40" : "Sin cierre")}</div>
      </section>
      <a class="sial-btn sial-btn-secondary sial-btn-full" href="ordenes-asignadas.html">Volver a ordenes</a>
    `;
  }

  function pallets() {
    return `<section class="sial-card sial-card-pad"><h2 class="sial-section-title">Pallets disponibles</h2><div class="sial-list">${dataset.pallets.map((item) => `
      <div class="sial-list-row"><strong>${esc(item.reference)}</strong><span>${esc(item.finca)} - ${esc(item.destination)}</span>${status(`${item.type} / ${item.boxes} cajas`)}</div>
    `).join("")}</div></section><a class="sial-btn sial-btn-secondary sial-btn-full" href="../pallets/armar-pallet.html">Abrir flujo existente de pallets</a>`;
  }

  const renderers = { index: dashboard, "pedido-sugerido": suggested, "pedido-adicional": additionalOrder, "inventario-finca": inventory, "ordenes-asignadas": orders, "detalle-orden": detail, "registrar-entrega": delivery, pod, pallets };

  function render() {
    const root = qs("[data-material-mobile-view]");
    if (!root) return;
    const view = root.dataset.materialMobileView || "index";
    root.innerHTML = (renderers[view] || dashboard)();
    const state = loadState();
    const accessDenied = new URLSearchParams(location.search).get("access") === "denied";
    if (view === "pedido-adicional" && !accessDenied && state.additional?.sync === "pending") {
      ui().showBanner?.({ id: "additional-sync", type: "warning", title: "Sin conexión", message: "La solicitud está guardada en el dispositivo y pendiente de sincronización.", dismissible: false });
    } else {
      ui().hideBanner?.("additional-sync");
    }
  }

  function navigate(path) {
    ui().clearUnsavedChanges?.();
    if (ui().navigateTo) ui().navigateTo(path);
    else window.location.href = path;
  }

  document.addEventListener("change", (event) => {
    const material = event.target.closest("#mobileAdditionalMaterial");
    if (material) updateAdditionalStock(material.value);
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-material-action]");
    if (!button) return;
    const state = loadState();
    const action = button.dataset.materialAction;
    if (action === "select-order") {
      state.activeOrderId = button.dataset.orderId;
      saveState(state);
      toast("success", "Orden seleccionada", "Se cargo la orden para detalle y entrega.");
      navigate("detalle-orden.html");
      return;
    }
    if (action === "confirm-suggestion") {
      state.consulted = true;
      saveState(state);
      toast("success", "Pedido revisado", "Tu revisión quedó registrada.");
      render();
      return;
    }
    if (action === "open-additional") {
      if (!state.consulted) return;
      const offlineSimulation = new URLSearchParams(location.search).get("offline") === "1" ? "?offline=1" : "";
      navigate(`pedido-adicional.html${offlineSimulation}`);
      return;
    }
    if (action === "additional-order") {
      const statusTarget = qs("[data-additional-mobile-status]");
      const materialCode = qs("#mobileAdditionalMaterial")?.value || "";
      const material = additionalStock(materialCode);
      const quantity = Number(qs("#mobileAdditionalQuantity")?.value || 0);
      const reason = qs("#mobileAdditionalReason")?.value || "";
      const detail = qs("#mobileAdditionalDetail")?.value.trim() || "";
      if (!Number.isInteger(quantity) || quantity <= 0 || !reason) {
        ui().setInlineStatus?.(statusTarget, {
          type: "error",
          title: "Completa la solicitud",
          message: !Number.isInteger(quantity) || quantity <= 0 ? "Ingresa una cantidad entera mayor que cero." : "Selecciona el motivo del pedido adicional."
        });
        const target = !Number.isInteger(quantity) || quantity <= 0 ? qs("#mobileAdditionalQuantity") : qs("#mobileAdditionalReason");
        target?.focus({ preventScroll: true });
        statusTarget?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (state.additional) {
        toast("info", "Solicitud ya registrada", `${state.additional.id} ya existe y no se creó un duplicado.`);
        render();
        return;
      }
      const offline = new URLSearchParams(location.search).get("offline") === "1" || navigator.onLine === false;
      state.additional = {
        id: "PAD-2026-32-003",
        material: material.code,
        materialName: material.name,
        quantity,
        unit: material.unit,
        stock: material.stock,
        stockWarning: quantity > material.stock,
        reason,
        reasonLabel: qs("#mobileAdditionalReason").selectedOptions[0].textContent,
        detail,
        status: "Pendiente de validación",
        sync: offline ? "pending" : "synced",
        createdAt: "03/08/2026, 11:35"
      };
      saveState(state);
      ui().clearUnsavedChanges?.();
      if (offline) {
        ui().showBanner?.({ id: "additional-sync", type: "warning", title: "Sin conexión", message: "La solicitud quedó guardada en el dispositivo y se enviará al recuperar conexión.", dismissible: false });
      } else {
        toast("success", "Pedido adicional registrado", "La solicitud quedó pendiente de validación.");
      }
      render();
      return;
    }
    if (action === "capture-pod") {
      const complete = () => {
        const next = loadState();
        next.podPhoto = true;
        saveState(next);
        toast("success", "Foto registrada", "La evidencia POD quedo vinculada a la orden.");
        render();
      };
      if (ui().openPhotoCapture) {
        ui().openPhotoCapture({ title: "Foto POD", allowMultiple: false, maxPhotos: 1, onComplete: complete });
      } else {
        complete();
      }
      return;
    }
    if (action === "sign-pod") {
      state.podSignature = true;
      saveState(state);
      toast("success", "Firma registrada", "Firma digital asociada a la entrega.");
      render();
      return;
    }
    if (action === "close-delivery") {
      if (!state.podPhoto || !state.podSignature) {
        const missing = [
          !state.podPhoto ? "la fotografía POD" : "",
          !state.podSignature ? "la firma digital" : ""
        ].filter(Boolean);
        const status = qs("[data-material-pod-status]");
        ui().setInlineStatus?.(status, {
          type: "error",
          title: "Evidencia pendiente",
          message: `Completa ${missing.join(" y ")} antes de cerrar la entrega.`
        });
        status?.setAttribute("tabindex", "-1");
        status?.focus({ preventScroll: true });
        status?.scrollIntoView({ behavior: "smooth", block: "center" });
        qs(!state.podPhoto ? '[data-material-action="capture-pod"]' : '[data-material-action="sign-pod"]')?.focus({ preventScroll: true });
        return;
      }
      state.closed = true;
      saveState(state);
      toast("success", "Entrega cerrada", "La orden queda entregada con soporte digital.");
      navigate("pod.html");
    }
  });

  render();
})();
