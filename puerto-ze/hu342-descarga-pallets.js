(function () {
  "use strict";

  var workflowKey = "sial-mobile-workflow";
  var pageKey = "sial-mobile-hu342-unload";
  var expectedPallets = [
    { position: 1, sscc: "177012345678900019", reference: "BAN-REF-001", farm: "0435 · La Bacota", boxes: 48 },
    { position: 2, sscc: "177012345678900026", reference: "BAN-REF-001", farm: "0527 · Santa Isabel", boxes: 48 },
    { position: 3, sscc: "177012345678900033", reference: "BAN-REF-004", farm: "0412 · La Esperanza", boxes: 48 },
    { position: 4, sscc: "177012345678900040", reference: "BAN-REF-004", farm: "0435 · La Bacota", boxes: 48 },
    { position: 5, sscc: "177012345678900057", reference: "BAN-REF-018", farm: "0527 · Santa Isabel", boxes: 48 },
    { position: 6, sscc: "177012345678900064", reference: "BAN-REF-018", farm: "0412 · La Esperanza", boxes: 48 },
    { position: 7, sscc: "177012345678900071", reference: "BAN-REF-022", farm: "0435 · La Bacota", boxes: 48 },
    { position: 8, sscc: "177012345678900088", reference: "BAN-REF-022", farm: "0527 · Santa Isabel", boxes: 48 }
  ];

  var currentSscc = "";
  var selectedClassification = "";
  var records = readJson(pageKey, {}).records || {};

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || "") || fallback; }
    catch (_) { return fallback; }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char];
    });
  }

  function normalizeSscc(value) {
    if (window.SialMobileUI && typeof window.SialMobileUI.normalizeSscc === "function") {
      return window.SialMobileUI.normalizeSscc(value);
    }
    return String(value || "").replace(/\D/g, "").slice(0, 18);
  }

  function statusMeta(classification) {
    return {
      COMPLETE: { label: "Completo", className: "success", slotClass: "is-complete" },
      INCOMPLETE: { label: "Incompleto", className: "warning", slotClass: "is-novelty" },
      NOVELTY: { label: "Con novedad", className: "warning", slotClass: "is-novelty" },
      REJECTED: { label: "Rechazado", className: "error", slotClass: "is-rejected" }
    }[classification] || { label: "Pendiente", className: "", slotClass: "" };
  }

  function findPallet(sscc) {
    return expectedPallets.find(function (item) { return item.sscc === sscc; }) || null;
  }

  function setScanStatus(message, type) {
    var node = $("[data-hu342-scan-status]");
    if (!node) return;
    node.textContent = message;
    node.className = "sial-field-note" + (type ? " " + type : "");
  }

  function setInlineError(message, field) {
    var form = $("[data-event='zePalletUnload']");
    var status = form && $("[data-flow-error]", form);
    if (!status) return;
    if (window.SialMobileUI && typeof window.SialMobileUI.setInlineStatus === "function") {
      window.SialMobileUI.setInlineStatus(status, {
        type: "error",
        title: "No es posible finalizar la descarga",
        message: message,
        field: field || status,
        form: form
      });
    } else {
      status.hidden = false;
      status.textContent = message;
    }
  }

  function renderMap() {
    var map = $("[data-hu342-container-map]");
    if (!map) return;
    map.innerHTML = expectedPallets.map(function (item) {
      var record = records[item.sscc];
      var meta = statusMeta(record && record.classification);
      var current = currentSscc === item.sscc ? " is-current" : "";
      return '<button class="ze-container-slot ' + meta.slotClass + current + '" type="button" data-hu342-slot="' + escapeHtml(item.sscc) + '">' +
        '<b>' + String(item.position).padStart(2, "0") + '</b><span><strong>' + escapeHtml(item.reference) + '</strong><small>' + escapeHtml(record ? meta.label : "Pendiente de lectura") + '</small></span></button>';
    }).join("");
  }

  function renderList() {
    var list = $("[data-hu342-pallet-list]");
    if (!list) return;
    list.innerHTML = expectedPallets.map(function (item) {
      var record = records[item.sscc];
      var meta = statusMeta(record && record.classification);
      var actualBoxes = record ? record.actualBoxes : item.boxes;
      return '<article class="ze-pallet-row">' +
        '<span class="ze-pallet-row-index">' + String(item.position).padStart(2, "0") + '</span>' +
        '<div class="ze-pallet-row-copy"><strong>' + escapeHtml(item.sscc) + '</strong><span>' + escapeHtml(item.reference + " · " + item.farm + " · " + actualBoxes + " cajas") + '</span></div>' +
        '<span class="sial-pill ' + meta.className + '">' + escapeHtml(meta.label) + '</span></article>';
    }).join("");
  }

  function renderSummary() {
    var completed = Object.keys(records).length;
    var noveltyCount = Object.keys(records).filter(function (key) { return records[key].classification !== "COMPLETE"; }).length;
    $("[data-hu342-unloaded-count]").textContent = String(completed);
    $("[data-hu342-pending-count]").textContent = String(expectedPallets.length - completed);
    $("[data-hu342-novelty-count]").textContent = String(noveltyCount);
    $("[data-hu342-progress-pill]").textContent = completed + " de " + expectedPallets.length;
    $("[data-hu342-result-copy]").textContent = completed === expectedPallets.length
      ? noveltyCount + " novedad" + (noveltyCount === 1 ? "" : "es") + " registrada" + (noveltyCount === 1 ? "" : "s")
      : completed + " de " + expectedPallets.length + " pallets conciliados";
  }

  function render() {
    renderMap();
    renderList();
    renderSummary();
    writeJson(pageKey, { records: records, updatedAt: new Date().toISOString() });
  }

  function resetCurrentForm() {
    selectedClassification = "";
    $("[data-hu342-classification]").querySelectorAll("button").forEach(function (button) {
      button.setAttribute("aria-pressed", "false");
    });
    $("[data-hu342-detail]").hidden = true;
    $("[data-hu342-actual-wrap]").hidden = true;
    $("[data-hu342-reason]").value = "";
    $("[data-hu342-observation]").value = "";
    $("[data-hu342-confirm-classification]").disabled = true;
  }

  function openPallet(sscc) {
    var pallet = findPallet(sscc);
    if (!pallet) {
      setScanStatus("El SSCC no pertenece a la carga esperada de este contenedor.", "error");
      return false;
    }
    currentSscc = sscc;
    resetCurrentForm();
    $("[data-hu342-current-sscc]").textContent = pallet.sscc;
    $("[data-hu342-current-position]").textContent = "Posición " + pallet.position;
    $("[data-hu342-current-reference]").textContent = pallet.reference;
    $("[data-hu342-current-farm]").textContent = pallet.farm;
    $("[data-hu342-current-boxes]").textContent = pallet.boxes + " cajas";
    $("[data-hu342-actual-boxes]").value = String(pallet.boxes);
    $("[data-hu342-current]").hidden = false;
    $("[data-hu342-sscc]").value = pallet.sscc;
    setScanStatus(records[sscc] ? "Este pallet ya fue clasificado. Puedes actualizar su resultado." : "Pallet encontrado. Confirma su estado físico.", records[sscc] ? "warning" : "success");
    renderMap();
    $("[data-hu342-current]").scrollIntoView({ behavior: "smooth", block: "center" });
    return true;
  }

  function chooseClassification(classification, button) {
    selectedClassification = classification;
    $("[data-hu342-classification]").querySelectorAll("button").forEach(function (candidate) {
      candidate.setAttribute("aria-pressed", candidate === button ? "true" : "false");
    });
    var needsDetail = classification !== "COMPLETE";
    $("[data-hu342-detail]").hidden = !needsDetail;
    $("[data-hu342-actual-wrap]").hidden = classification !== "INCOMPLETE";
    $("[data-hu342-confirm-classification]").disabled = false;
  }

  function confirmClassification() {
    var pallet = findPallet(currentSscc);
    if (!pallet || !selectedClassification) return;
    var reason = $("[data-hu342-reason]").value;
    var observation = $("[data-hu342-observation]").value.trim();
    var actualBoxes = selectedClassification === "INCOMPLETE" ? Number($("[data-hu342-actual-boxes]").value) : pallet.boxes;
    if (selectedClassification !== "COMPLETE" && !reason) {
      setScanStatus("Selecciona el motivo antes de confirmar la novedad.", "error");
      $("[data-hu342-reason]").focus();
      return;
    }
    if (selectedClassification === "INCOMPLETE" && (!Number.isFinite(actualBoxes) || actualBoxes < 0 || actualBoxes >= pallet.boxes)) {
      setScanStatus("Las cajas recibidas deben ser menores que la cantidad esperada.", "error");
      $("[data-hu342-actual-boxes]").focus();
      return;
    }
    records[pallet.sscc] = {
      sscc: pallet.sscc,
      position: pallet.position,
      reference: pallet.reference,
      farm: pallet.farm,
      expectedBoxes: pallet.boxes,
      actualBoxes: actualBoxes,
      classification: selectedClassification,
      reason: reason,
      observation: observation,
      registeredAt: new Date().toISOString()
    };
    currentSscc = "";
    $("[data-hu342-current]").hidden = true;
    $("[data-hu342-sscc]").value = "";
    setScanStatus("Pallet conciliado. Continúa con la siguiente posición.", "success");
    if (window.SialMobileUI && typeof window.SialMobileUI.markUnsavedChanges === "function") {
      window.SialMobileUI.markUnsavedChanges("scan");
    }
    render();
  }

  function scanPallet() {
    var next = expectedPallets.find(function (item) { return !records[item.sscc]; }) || expectedPallets[0];
    if (!window.SialMobileUI || typeof window.SialMobileUI.openBarcodeScanner !== "function") {
      openPallet(normalizeSscc($("[data-hu342-sscc]").value));
      return;
    }
    window.SialMobileUI.openBarcodeScanner({
      title: "Escanear pallet descargado",
      eyebrow: "HU342 · Muelle ZE",
      normalize: normalizeSscc,
      validate: function (value) {
        var pallet = findPallet(normalizeSscc(value));
        return pallet
          ? { ok: true, message: "Pallet esperado en la posición " + pallet.position + "." }
          : { ok: false, message: "El SSCC no pertenece a esta carga." };
      },
      onDetected: function (value) { openPallet(normalizeSscc(value)); }
    });
  }

  function reconcileManifest() {
    expectedPallets.forEach(function (pallet, index) {
      var classification = index === 2 ? "INCOMPLETE" : index === 4 ? "NOVELTY" : "COMPLETE";
      records[pallet.sscc] = {
        sscc: pallet.sscc,
        position: pallet.position,
        reference: pallet.reference,
        farm: pallet.farm,
        expectedBoxes: pallet.boxes,
        actualBoxes: classification === "INCOMPLETE" ? 32 : pallet.boxes,
        classification: classification,
        reason: classification === "INCOMPLETE" ? "DIFERENCIA_CAJAS" : classification === "NOVELTY" ? "EMBALAJE_DANADO" : "",
        observation: classification === "NOVELTY" ? "Esquinero exterior golpeado; contenido íntegro." : "",
        registeredAt: new Date().toISOString()
      };
    });
    if (window.SialMobileUI) window.SialMobileUI.markUnsavedChanges("scan");
    render();
    setScanStatus("Manifiesto conciliado. Revisa novedades y evidencia antes de finalizar.", "success");
  }

  function persistUnloadResult() {
    var state = readJson(workflowKey, {});
    var inventory = expectedPallets.map(function (pallet) {
      var record = records[pallet.sscc];
      return {
        sscc: pallet.sscc,
        reference: pallet.reference,
        farm: pallet.farm,
        boxes: record.actualBoxes,
        sourceContainer: state.container || "SIALU1234567",
        unloadClassification: record.classification,
        status: record.classification === "COMPLETE" || record.classification === "NOVELTY" ? "AVAILABLE_FOR_CONSOLIDATION" : record.classification === "INCOMPLETE" ? "REQUIRES_REASSEMBLY" : "REJECTED"
      };
    });
    state.zePalletInventory = inventory;
    state.zeUnloadSummary = {
      total: inventory.length,
      eligible: inventory.filter(function (item) { return item.status === "AVAILABLE_FOR_CONSOLIDATION"; }).length,
      requiresReassembly: inventory.filter(function (item) { return item.status === "REQUIRES_REASSEMBLY"; }).length,
      rejected: inventory.filter(function (item) { return item.status === "REJECTED"; }).length,
      registeredAt: new Date().toISOString()
    };
    writeJson(workflowKey, state);
  }

  function validateBeforeSubmit(event) {
    if (Object.keys(records).length !== expectedPallets.length) {
      event.preventDefault();
      event.stopPropagation();
      setInlineError("Debes escanear y clasificar los 8 pallets esperados.", $("[data-hu342-sscc]"));
      return;
    }
    if (!$("[data-hu342-reconcile]").checked) {
      event.preventDefault();
      event.stopPropagation();
      setInlineError("Confirma la conciliación física antes de finalizar.", $("[data-hu342-reconcile]"));
      return;
    }
    var state = readJson(workflowKey, {});
    var missingEvidence = ["hu342-puertas", "hu342-zona-descarga"].filter(function (key) { return !(state.photos || {})[key]; });
    if (missingEvidence.length) {
      event.preventDefault();
      event.stopPropagation();
      setInlineError("Agrega la evidencia de puertas/sello y de la zona de descarga.", $("[data-add-photo='hu342-puertas']"));
      return;
    }
    persistUnloadResult();
  }

  function hydrateGuard() {
    var state = readJson(workflowKey, {});
    var guard = $("[data-hu342-guard]");
    if (guard) guard.hidden = Boolean(state.flags && state.flags.zeReturnReception);
  }

  document.addEventListener("DOMContentLoaded", function () {
    hydrateGuard();
    render();
    $("[data-hu342-scan]").addEventListener("click", scanPallet);
    $("[data-hu342-sscc]").addEventListener("keydown", function (event) {
      if (event.key !== "Enter") return;
      event.preventDefault();
      openPallet(normalizeSscc(event.currentTarget.value));
    });
    $("[data-hu342-container-map]").addEventListener("click", function (event) {
      var button = event.target.closest("[data-hu342-slot]");
      if (button) openPallet(button.dataset.hu342Slot);
    });
    $("[data-hu342-classification]").addEventListener("click", function (event) {
      var button = event.target.closest("[data-classification]");
      if (button) chooseClassification(button.dataset.classification, button);
    });
    $("[data-hu342-confirm-classification]").addEventListener("click", confirmClassification);
    $("[data-hu342-select-all]").addEventListener("click", reconcileManifest);
    $("[data-event='zePalletUnload']").addEventListener("submit", validateBeforeSubmit);
  });
})();
