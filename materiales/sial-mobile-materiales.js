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
      id: "PED-071",
      finca: "Finca Santa Isabel",
      week: "Semana 27 - 2026",
      material: "Caja carton corrugado",
      quantity: "1400 unidades",
      stock: "1280 unidades",
      document: "RPT",
      status: "SUGERIDO"
    },
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
      return { activeOrderId: "OTI-546-001", consulted: false, podPhoto: false, podSignature: false, closed: false, ...(JSON.parse(localStorage.getItem(stateKey)) || {}) };
    } catch (_) {
      return { activeOrderId: "OTI-546-001", consulted: false, podPhoto: false, podSignature: false, closed: false };
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
          <div><strong>${esc(pedido.id)}</strong><span>${esc(pedido.finca)} - ${esc(pedido.week)}</span></div>
          ${status(state.consulted ? "Consultado" : pedido.status)}
        </div>
        <div class="sial-material-matrix">
          ${mini("Material", pedido.material)}
          ${mini("Cantidad sugerida", pedido.quantity)}
          ${mini("Stock finca", pedido.stock)}
          ${mini("Documento", pedido.document)}
        </div>
        <button class="sial-btn sial-btn-primary sial-btn-full" type="button" data-material-action="confirm-suggestion">Marcar consultado</button>
      </section>
      <section class="sial-card sial-card-pad sial-form">
        <h2 class="sial-section-title">Pedido adicional</h2>
        <div class="sial-field"><label class="sial-label">Motivo</label><textarea class="sial-textarea" placeholder="Necesidad extraordinaria de finca vinculada al corte"></textarea></div>
        <button class="sial-btn sial-btn-secondary sial-btn-full" type="button" data-material-action="additional-order">Registrar adicional</button>
      </section>
    `;
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

  const renderers = { index: dashboard, "pedido-sugerido": suggested, "inventario-finca": inventory, "ordenes-asignadas": orders, "detalle-orden": detail, "registrar-entrega": delivery, pod, pallets };

  function render() {
    const root = qs("[data-material-mobile-view]");
    if (!root) return;
    const view = root.dataset.materialMobileView || "index";
    root.innerHTML = (renderers[view] || dashboard)();
  }

  function navigate(path) {
    ui().clearUnsavedChanges?.();
    if (ui().navigateTo) ui().navigateTo(path);
    else window.location.href = path;
  }

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
      toast("success", "Pedido consultado", "La consulta queda registrada localmente en la propuesta.");
      render();
      return;
    }
    if (action === "additional-order") {
      toast("success", "Adicional registrado", "Entrara al flujo de validacion y despacho.");
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
        toast("warning", "POD requerido", "Captura foto y firma antes de cerrar la entrega.");
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
