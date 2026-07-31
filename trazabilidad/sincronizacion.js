(function () {
  "use strict";

  var queueKey = "sial-mobile-sync-queue";
  var workflowKey = "sial-mobile-workflow";
  var currentFilter = "attention";
  var activeSyncIds = [];
  var progressAnimationFrame = 0;
  var labels = {
    LOCAL_PENDING_SYNC: "Pendiente",
    SYNCING: "Sincronizando",
    SYNCED: "Confirmado",
    SYNC_ERROR: "Error",
    BLOCKED: "Bloqueado"
  };
  var moduleDefinitions = [
    { id: "farm", label: "Recepción e inspecciones", match: ["HU759", "Finca"], icon: '<path d="M4 17 10 7l4 6 2-3 4 7Z"/><path d="M3 20h18"/>' },
    { id: "pallets", label: "Pallets", match: ["HU591"], icon: '<path d="M4 7h16v10H4z"/><path d="M8 7V5h8v2"/><path d="M8 17v2"/><path d="M16 17v2"/>' },
    { id: "loading", label: "Cargue de contenedor", match: ["HU332"], icon: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 9h8"/><path d="M8 13h8"/>' },
    { id: "evidence", label: "Evidencias", match: [], evidence: true, icon: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m6 17 4-4 3 3 2-2 3 3"/>' }
  ];

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch (_) {
      return fallback;
    }
  }

  function writeQueue(queue) {
    localStorage.setItem(queueKey, JSON.stringify(queue));
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char];
    });
  }

  function toast(type, title, message) {
    if (window.SialMobileUI && typeof window.SialMobileUI.showToast === "function") {
      window.SialMobileUI.showToast({ type: type, title: title, message: message });
    }
  }

  function nowLabel() {
    return new Date().toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
  }

  function baseSeedQueue() {
    return [
      {
        id: "sync-hu759-ingreso",
        hu: "HU759",
        title: "Ingreso de vehículo a finca",
        subtitle: "Recepción local de TUL458 en Finca Santa Isabel.",
        operation: "EXP-2026-0418",
        entity: "SIALU1234567",
        status: "LOCAL_PENDING_SYNC",
        evidence: 2,
        attempts: 0,
        createdAt: "31/07/2026, 8:20 a. m.",
        localId: "loc_hu759_0418",
        idempotencyKey: "EXP-2026-0418_vehicleFarmIngress_loc_hu759_0418",
        detail: "Checklist técnico y sellos de llegada conservados en el dispositivo.",
        dependency: ""
      },
      {
        id: "sync-hu591-pallet",
        hu: "HU591",
        title: "Pallet armado",
        subtitle: "SSCC 177012345678900073 con 216 cajas.",
        operation: "EXP-2026-0418",
        entity: "SSCC 177012345678900073",
        status: "SYNCED",
        evidence: 0,
        attempts: 1,
        createdAt: "31/07/2026, 8:32 a. m.",
        syncedAt: "31/07/2026, 8:33 a. m.",
        localId: "loc_hu591_123456789",
        idempotencyKey: "EXP-2026-0418_palletBuilt_loc_hu591_123456789",
        detail: "Pallet confirmado por el servidor y disponible para cargue.",
        dependency: ""
      },
      {
        id: "sync-hu332-cargue",
        hu: "HU332",
        title: "Cargue de contenedor",
        subtitle: "Tres posiciones cargadas; falló el envío de evidencias.",
        operation: "EXP-2026-0418",
        entity: "SIALU1234567",
        status: "SYNC_ERROR",
        evidence: 4,
        attempts: 2,
        createdAt: "31/07/2026, 8:48 a. m.",
        localId: "loc_hu332_0418",
        idempotencyKey: "EXP-2026-0418_hu332Load_loc_hu332_0418",
        detail: "Los datos permanecen guardados. Revisa la conexión y vuelve a intentar.",
        dependency: ""
      },
      {
        id: "sync-inspeccion-finca",
        hu: "Finca",
        title: "Inspección externa",
        subtitle: "Espera la confirmación del ingreso del vehículo.",
        operation: "EXP-2026-0418",
        entity: "SIALU1234567",
        status: "BLOCKED",
        evidence: 6,
        attempts: 0,
        createdAt: "31/07/2026, 8:55 a. m.",
        localId: "loc_finca_ext_0418",
        idempotencyKey: "EXP-2026-0418_farmExternalInspection_loc_finca_ext_0418",
        detail: "Este trabajo se enviará después de confirmar el ingreso a finca.",
        dependency: "HU759 pendiente"
      }
    ];
  }

  function normalizeStatus(status) {
    if (!status) return "LOCAL_PENDING_SYNC";
    if (status === "SYNC_FAILED") return "SYNC_ERROR";
    return status;
  }

  function fromWorkflow() {
    var workflow = readJson(workflowKey, {});
    var events = Array.isArray(workflow.events) ? workflow.events : [];
    var statuses = workflow.eventSyncStatus || {};
    var localIds = workflow.eventLocalIds || {};
    var keys = workflow.eventIdempotencyKeys || {};
    return events.map(function (event, index) {
      var eventName = event.event || event.name || "evento-" + index;
      var status = normalizeStatus(statuses[eventName] || event.sync || "LOCAL_PENDING_SYNC");
      return {
        id: "wf-" + eventName + "-" + index,
        hu: eventName.toLowerCase().indexOf("pallet") >= 0 ? "HU591" : "Operación",
        title: event.label || eventName,
        subtitle: event.detail || "Evento guardado en la trazabilidad local.",
        operation: workflow.operation || "Operación local",
        entity: workflow.container || workflow.vehicle || "Entidad local",
        status: status,
        evidence: workflow.photos ? Object.keys(workflow.photos).length : 0,
        attempts: status === "SYNC_ERROR" ? 1 : 0,
        createdAt: event.timestamp || nowLabel(),
        localId: localIds[eventName] || "loc_" + eventName,
        idempotencyKey: keys[eventName] || ((workflow.operation || "SIAL") + "_" + eventName + "_" + index),
        detail: event.detail || "Trabajo generado desde una vista operacional.",
        dependency: ""
      };
    });
  }

  function readQueue() {
    var queue = readJson(queueKey, null);
    if (Array.isArray(queue) && queue.length) return queue.map(function (item) {
      item.status = normalizeStatus(item.status);
      return item;
    });
    var workflowItems = fromWorkflow();
    queue = workflowItems.length ? workflowItems.concat(baseSeedQueue().slice(1, 3)) : baseSeedQueue();
    writeQueue(queue);
    return queue;
  }

  function statusClass(status) {
    if (status === "SYNCING") return "syncing";
    if (status === "SYNCED") return "synced";
    if (status === "SYNC_ERROR") return "error";
    if (status === "BLOCKED") return "blocked";
    return "pending";
  }

  function canSync(item) {
    return item.status === "LOCAL_PENDING_SYNC" || item.status === "SYNC_ERROR";
  }

  function queueCounts(queue) {
    return {
      total: queue.length,
      pending: queue.filter(function (item) { return item.status === "LOCAL_PENDING_SYNC" || item.status === "SYNCING"; }).length,
      synced: queue.filter(function (item) { return item.status === "SYNCED"; }).length,
      error: queue.filter(function (item) { return item.status === "SYNC_ERROR"; }).length,
      attention: queue.filter(function (item) { return item.status === "SYNC_ERROR" || item.status === "BLOCKED"; }).length
    };
  }

  function animateProgressValue(target) {
    var node = $("[data-sync-progress]");
    if (!node) return;
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var start = Number(String(node.textContent || "0").replace(/\D/g, "")) || 0;
    if (progressAnimationFrame) window.cancelAnimationFrame(progressAnimationFrame);
    if (reduceMotion || start === target) {
      node.textContent = target + "%";
      return;
    }
    var startedAt = 0;
    var duration = 680;
    function step(timestamp) {
      if (!startedAt) startedAt = timestamp;
      var elapsed = Math.min(1, (timestamp - startedAt) / duration);
      var eased = 1 - Math.pow(1 - elapsed, 3);
      node.textContent = Math.round(start + ((target - start) * eased)) + "%";
      if (elapsed < 1) progressAnimationFrame = window.requestAnimationFrame(step);
      else progressAnimationFrame = 0;
    }
    progressAnimationFrame = window.requestAnimationFrame(step);
  }

  function matchesFilter(item) {
    if (currentFilter === "all") return true;
    if (currentFilter === "attention") return item.status !== "SYNCED";
    return item.status === currentFilter;
  }

  function actionLabel(item) {
    if (item.status === "SYNC_ERROR") return "Reintentar";
    if (item.status === "SYNCING") return "Sincronizando";
    if (item.status === "SYNCED") return "Confirmado";
    if (item.status === "BLOCKED") return "Ver dependencia";
    return "Sincronizar";
  }

  function renderOverview(queue) {
    var counts = queueCounts(queue);
    var syncing = queue.filter(function (item) { return item.status === "SYNCING"; }).length;
    var progress = counts.total ? Math.round(((counts.synced + (syncing * 0.45)) / counts.total) * 100) : 100;
    var degrees = Math.round(progress * 3.6);
    var hasActiveSync = queue.some(function (item) { return item.status === "SYNCING"; });
    var command = $("[data-sync-command]");

    command.classList.toggle("is-syncing", hasActiveSync);
    $("[data-sync-orbit]").style.setProperty("--sync-progress", degrees + "deg");
    animateProgressValue(progress);
    $("[data-sync-progress-label]").textContent = hasActiveSync ? "Enviando datos" : (progress === 100 ? "Operación al día" : "Progreso confirmado");
    $("[data-sync-progress-copy]").textContent = counts.synced + " de " + counts.total + " trabajos confirmados";
    $("[data-sync-headline]").textContent = hasActiveSync ? "Sincronizando operación" : (counts.attention ? "Revisa la operación" : (counts.pending ? "Operación por actualizar" : "Todo está sincronizado"));
    $("[data-sync-all-label]").textContent = hasActiveSync ? "Sincronizando…" : "Sincronizar operación";
    $("[data-sync-all]").disabled = hasActiveSync || !queue.some(canSync) || !navigator.onLine;
    $("[data-retry-errors]").disabled = hasActiveSync || counts.error === 0 || !navigator.onLine;
    $("[data-sync-total]").textContent = counts.total + (counts.total === 1 ? " trabajo" : " trabajos");

    ["pending", "synced", "error", "attention"].forEach(function (key) {
      $all("[data-sync-count='" + key + "']").forEach(function (node) { node.textContent = String(counts[key]); });
    });
  }

  function moduleItems(queue, definition) {
    if (definition.evidence) return queue.filter(function (item) { return Number(item.evidence || 0) > 0; });
    return queue.filter(function (item) { return definition.match.indexOf(item.hu) >= 0; });
  }

  function moduleStatus(items) {
    if (!items.length) return { className: "warning", icon: '<path d="M12 8v4"/><path d="M12 16h.01"/><circle cx="12" cy="12" r="9"/>' };
    if (items.some(function (item) { return item.status === "SYNC_ERROR" || item.status === "BLOCKED"; })) {
      return { className: "error", icon: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>' };
    }
    if (items.every(function (item) { return item.status === "SYNCED"; })) {
      return { className: "", icon: '<path d="m5 12 4 4L19 6"/>' };
    }
    return { className: "warning", icon: '<path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="9"/>' };
  }

  function renderModules(queue) {
    $("[data-sync-modules]").innerHTML = moduleDefinitions.map(function (definition) {
      var items = moduleItems(queue, definition);
      var confirmed = items.filter(function (item) { return item.status === "SYNCED"; }).length;
      var progress = items.length ? Math.round((confirmed / items.length) * 100) : 0;
      var state = moduleStatus(items);
      var countCopy = definition.evidence
        ? items.reduce(function (total, item) { return total + Number(item.evidence || 0); }, 0) + " archivos"
        : confirmed + "/" + items.length + " confirmados";
      return [
        '<article class="sync-module">',
        '<span class="sync-module-icon" aria-hidden="true"><svg class="sial-icon" viewBox="0 0 24 24">' + definition.icon + '</svg></span>',
        '<div class="sync-module-main">',
        '<div class="sync-module-copy"><strong>' + escapeHtml(definition.label) + '</strong><span>' + escapeHtml(countCopy) + '</span></div>',
        '<div class="sync-module-progress" aria-label="' + progress + '% confirmado"><i style="--module-progress:' + progress + '%"></i></div>',
        '</div>',
        '<span class="sync-module-status ' + state.className + '" aria-hidden="true"><svg class="sial-icon" viewBox="0 0 24 24">' + state.icon + '</svg></span>',
        '</article>'
      ].join("");
    }).join("");
  }

  function rowTemplate(item) {
    var disabled = canSync(item) ? "" : " disabled";
    return [
      '<article class="sync-row ' + statusClass(item.status) + '" data-sync-id="' + escapeHtml(item.id) + '">',
      '<div class="sync-row-head">',
      '<div class="sync-row-title"><span>' + escapeHtml(item.hu + " · " + item.operation) + '</span><strong>' + escapeHtml(item.title) + '</strong></div>',
      '<span class="sync-state-pill ' + statusClass(item.status) + '">' + escapeHtml(labels[item.status] || item.status) + '</span>',
      '</div>',
      '<p class="sync-row-copy">' + escapeHtml(item.subtitle) + '</p>',
      '<div class="sync-row-meta"><span>' + escapeHtml(item.createdAt) + '</span><span>' + Number(item.evidence || 0) + ' evidencias</span><span>' + Number(item.attempts || 0) + ' intentos</span></div>',
      '<div class="sync-row-actions">',
      '<button class="sial-btn sial-btn-ghost" type="button" data-view-sync="' + escapeHtml(item.id) + '">Ver detalle</button>',
      '<button class="sial-btn sial-btn-primary" type="button" data-force-sync="' + escapeHtml(item.id) + '"' + disabled + '>' + actionLabel(item) + '</button>',
      '</div>',
      '</article>'
    ].join("");
  }

  function renderList(queue) {
    var visible = queue.filter(matchesFilter);
    var copy = currentFilter === "SYNCED" ? "Trabajos confirmados por el servidor." : (currentFilter === "all" ? "Toda la actividad de la operación." : "Trabajos que requieren sincronización o revisión.");
    $("[data-sync-filter-copy]").textContent = copy;
    if (!visible.length) {
      $("[data-sync-list]").innerHTML = '<div class="sial-empty-state"><strong>Sin trabajos en este filtro</strong><p>La operación no tiene registros para mostrar aquí.</p></div>';
      return;
    }
    $("[data-sync-list]").innerHTML = visible.map(rowTemplate).join("");
  }

  function render() {
    var queue = readQueue();
    renderOverview(queue);
    renderModules(queue);
    renderList(queue);
  }

  function updateItems(ids, updater) {
    var queue = readQueue().map(function (item) {
      return ids.indexOf(item.id) >= 0 ? updater(Object.assign({}, item)) : item;
    });
    writeQueue(queue);
    render();
    return queue;
  }

  function unlockDependencies(queue) {
    var hasPendingIngress = queue.some(function (item) { return item.hu === "HU759" && item.status !== "SYNCED"; });
    if (!hasPendingIngress) {
      queue.forEach(function (item) {
        if (item.status === "BLOCKED" && item.dependency) {
          item.status = "LOCAL_PENDING_SYNC";
          item.dependency = "";
          item.detail = "La dependencia fue confirmada. Este trabajo ya puede sincronizarse.";
        }
      });
    }
    return queue;
  }

  function finishItem(id, index, total) {
    window.setTimeout(function () {
      var queue = updateItems([id], function (item) {
        item.status = "SYNCED";
        item.attempts = Number(item.attempts || 0) + 1;
        item.syncedAt = nowLabel();
        return item;
      });
      queue = unlockDependencies(queue);
      writeQueue(queue);
      activeSyncIds = activeSyncIds.filter(function (activeId) { return activeId !== id; });
      render();
      var row = document.querySelector("[data-sync-id='" + id.replace(/'/g, "\\'") + "']");
      if (row) row.classList.add("is-completing");
      if (index === total - 1) {
        var remaining = readQueue().filter(canSync).length;
        $("[data-sync-last-review]").textContent = "ahora";
        toast(
          "success",
          "Sincronización completada",
          total + (total === 1 ? " trabajo fue confirmado." : " trabajos fueron confirmados.") +
            (remaining ? " " + remaining + (remaining === 1 ? " trabajo quedó listo para enviar." : " trabajos quedaron listos para enviar.") : "")
        );
      }
    }, 520 + (index * 560));
  }

  function forceSync(ids) {
    if (!navigator.onLine) {
      toast("error", "Sin conexión", "Los datos siguen guardados. Intenta nuevamente cuando recuperes internet.");
      return;
    }
    var allowed = readQueue().filter(function (item) {
      return ids.indexOf(item.id) >= 0 && canSync(item);
    }).map(function (item) { return item.id; });
    if (!allowed.length) {
      toast("info", "Sin trabajos disponibles", "No hay registros listos para sincronizar en este momento.");
      return;
    }
    activeSyncIds = allowed.slice();
    updateItems(allowed, function (item) {
      item.status = "SYNCING";
      return item;
    });
    toast("info", "Sincronizando operación", allowed.length + (allowed.length === 1 ? " trabajo en proceso." : " trabajos en proceso."));
    allowed.forEach(function (id, index) { finishItem(id, index, allowed.length); });
  }

  function detailContent(item) {
    var content = document.createElement("div");
    content.className = "sync-detail-content";
    content.innerHTML = [
      '<section class="sync-detail-status">',
      '<div><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.detail) + '</span></div>',
      '<span class="sync-state-pill ' + statusClass(item.status) + '">' + escapeHtml(labels[item.status] || item.status) + '</span>',
      '</section>',
      '<section class="sync-detail-grid" aria-label="Información del trabajo">',
      '<div class="sial-list-row"><strong>Operación</strong><span>' + escapeHtml(item.operation) + '</span></div>',
      '<div class="sial-list-row"><strong>Entidad</strong><span>' + escapeHtml(item.entity) + '</span></div>',
      '<div class="sial-list-row"><strong>Creado localmente</strong><span>' + escapeHtml(item.createdAt) + '</span></div>',
      '<div class="sial-list-row"><strong>Evidencias</strong><span>' + Number(item.evidence || 0) + ' archivos</span></div>',
      '<div class="sial-list-row"><strong>Intentos</strong><span>' + Number(item.attempts || 0) + '</span></div>',
      item.dependency ? '<div class="sial-list-row"><strong>Dependencia</strong><span>' + escapeHtml(item.dependency) + '</span></div>' : "",
      '<div class="sial-list-row"><strong>Id local</strong><span>' + escapeHtml(item.localId) + '</span></div>',
      '<div class="sial-list-row sync-detail-key-row"><strong>Idempotencia</strong><span class="sync-detail-key">' + escapeHtml(item.idempotencyKey) + '</span></div>',
      '</section>'
    ].join("");
    return content;
  }

  function showDetail(id) {
    var item = readQueue().find(function (entry) { return entry.id === id; });
    if (!item || !window.SialMobileUI) return;
    window.SialMobileUI.openDialog({
      id: "sync-work-detail",
      title: "Detalle de sincronización",
      variant: "sheet",
      content: detailContent(item),
      actions: [{ label: "Cerrar", variant: "primary" }]
    });
  }

  function updateNetwork() {
    var network = $("[data-sync-network]");
    var online = navigator.onLine;
    network.classList.toggle("offline", !online);
    network.innerHTML = '<i aria-hidden="true"></i>' + (online ? "En línea" : "Sin conexión");
    render();
  }

  function wireEvents() {
    document.addEventListener("click", function (event) {
      var filter = event.target.closest("[data-sync-filter]");
      if (filter) {
        currentFilter = filter.dataset.syncFilter;
        $all("[data-sync-filter]").forEach(function (node) {
          var active = node === filter;
          node.classList.toggle("active", active);
          node.setAttribute("aria-pressed", String(active));
        });
        render();
        return;
      }
      var force = event.target.closest("[data-force-sync]");
      if (force) {
        var item = readQueue().find(function (entry) { return entry.id === force.dataset.forceSync; });
        if (item && item.status === "BLOCKED") showDetail(item.id);
        else forceSync([force.dataset.forceSync]);
        return;
      }
      var detail = event.target.closest("[data-view-sync]");
      if (detail) {
        showDetail(detail.dataset.viewSync);
        return;
      }
      if (event.target.closest("[data-sync-all]")) {
        forceSync(readQueue().filter(canSync).map(function (item) { return item.id; }));
        return;
      }
      if (event.target.closest("[data-retry-errors]")) {
        currentFilter = "attention";
        $all("[data-sync-filter]").forEach(function (node) {
          var active = node.dataset.syncFilter === "attention";
          node.classList.toggle("active", active);
          node.setAttribute("aria-pressed", String(active));
        });
        render();
        var firstError = $(".sync-row.error");
        if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (event.target.closest("[data-reset-sync]")) {
        writeQueue(baseSeedQueue());
        currentFilter = "attention";
        render();
        toast("info", "Demostración restaurada", "Se restablecieron los estados de sincronización para revisión.");
      }
    });
    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);
  }

  wireEvents();
  updateNetwork();
})();
