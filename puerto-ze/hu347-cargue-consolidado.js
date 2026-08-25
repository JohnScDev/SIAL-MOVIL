(function () {
  "use strict";

  var workflowKey = "sial-mobile-workflow";
  var pageKey = "sial-mobile-hu347-load";
  var maxPositions = 6;
  var selected = readJson(pageKey, {}).selected || [];
  var eligiblePallets = [];

  var fallbackPallets = [
    { sscc: "177012345678900019", reference: "BAN-REF-001", farm: "0435 · La Bacota", boxes: 48, status: "AVAILABLE_FOR_CONSOLIDATION" },
    { sscc: "177012345678900026", reference: "BAN-REF-001", farm: "0527 · Santa Isabel", boxes: 48, status: "AVAILABLE_FOR_CONSOLIDATION" },
    { sscc: "177012345678900040", reference: "BAN-REF-004", farm: "0435 · La Bacota", boxes: 48, status: "AVAILABLE_FOR_CONSOLIDATION" },
    { sscc: "177012345678900064", reference: "BAN-REF-018", farm: "0412 · La Esperanza", boxes: 48, status: "AVAILABLE_FOR_CONSOLIDATION" },
    { sscc: "177012345678900071", reference: "BAN-REF-022", farm: "0435 · La Bacota", boxes: 48, status: "AVAILABLE_FOR_CONSOLIDATION" },
    { sscc: "177012345678900088", reference: "BAN-REF-022", farm: "0527 · Santa Isabel", boxes: 48, status: "AVAILABLE_FOR_CONSOLIDATION" }
  ];

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

  function loadInventory() {
    var state = readJson(workflowKey, {});
    var inventory = Array.isArray(state.zePalletInventory) ? state.zePalletInventory : [];
    eligiblePallets = inventory.filter(function (item) {
      return item && item.status === "AVAILABLE_FOR_CONSOLIDATION" && Number(item.boxes) > 0;
    });
    if (!eligiblePallets.length) eligiblePallets = fallbackPallets.slice();
    selected = selected.filter(function (sscc) { return eligiblePallets.some(function (item) { return item.sscc === sscc; }); }).slice(0, maxPositions);
  }

  function selectedPallets() {
    return selected.map(function (sscc) {
      return eligiblePallets.find(function (item) { return item.sscc === sscc; });
    }).filter(Boolean);
  }

  function setScanStatus(message, type) {
    var node = $("[data-hu347-scan-status]");
    if (!node) return;
    node.textContent = message;
    node.className = "sial-field-note" + (type ? " " + type : "");
  }

  function setInlineError(message, field) {
    var form = $("[data-event='zeConsolidatedLoad']");
    var status = form && $("[data-flow-error]", form);
    if (!status) return;
    if (window.SialMobileUI && typeof window.SialMobileUI.setInlineStatus === "function") {
      window.SialMobileUI.setInlineStatus(status, {
        type: "error",
        title: "No es posible confirmar el cargue",
        message: message,
        field: field || status,
        form: form
      });
    } else {
      status.hidden = false;
      status.textContent = message;
    }
  }

  function togglePallet(sscc) {
    var index = selected.indexOf(sscc);
    if (index >= 0) {
      selected.splice(index, 1);
      setScanStatus("Pallet retirado de la estiba.", "warning");
    } else {
      if (selected.length >= maxPositions) {
        setScanStatus("Las 6 posiciones del contenedor ya están ocupadas.", "error");
        return false;
      }
      selected.push(sscc);
      setScanStatus("Pallet agregado a la siguiente posición disponible.", "success");
    }
    if (window.SialMobileUI && typeof window.SialMobileUI.markUnsavedChanges === "function") {
      window.SialMobileUI.markUnsavedChanges("scan");
    }
    render();
    return true;
  }

  function renderEligible() {
    var list = $("[data-hu347-eligible-list]");
    if (!list) return;
    list.innerHTML = eligiblePallets.map(function (item) {
      var isSelected = selected.indexOf(item.sscc) >= 0;
      var origin = item.unloadClassification === "NOVELTY" ? "Apto con novedad" : item.reassembled ? "Rearmado en ZE" : "Completo";
      return '<button class="sial-selectable-row ze-eligible-row" type="button" data-hu347-pallet="' + escapeHtml(item.sscc) + '" aria-pressed="' + String(isSelected) + '">' +
        '<span class="ze-eligible-check">' + (isSelected ? "✓" : "+") + '</span>' +
        '<span class="ze-eligible-copy"><strong>' + escapeHtml(item.sscc) + '</strong><span>' + escapeHtml(item.reference + " · " + item.farm + " · " + origin) + '</span></span>' +
        '<span class="sial-pill">' + Number(item.boxes) + ' cajas</span></button>';
    }).join("");
  }

  function renderStowage() {
    var pallets = selectedPallets();
    var map = $("[data-hu347-stowage-map]");
    if (!map) return;
    map.innerHTML = Array.from({ length: maxPositions }, function (_, index) {
      var pallet = pallets[index];
      return '<div class="ze-stowage-slot' + (pallet ? " is-filled" : "") + '">' +
        '<b>' + String(index + 1).padStart(2, "0") + '</b><span>' +
        (pallet ? '<strong>' + escapeHtml(pallet.sscc) + '</strong><small>' + escapeHtml(pallet.reference + " · " + pallet.boxes + " cajas") + '</small>' : '<strong>Posición libre</strong><small>Esperando pallet</small>') +
        '</span></div>';
    }).join("");
  }

  function renderSummary() {
    var pallets = selectedPallets();
    var boxes = pallets.reduce(function (total, item) { return total + Number(item.boxes || 0); }, 0);
    var capacity = Math.round((pallets.length / maxPositions) * 100);
    $("[data-hu347-selected-count]").textContent = String(pallets.length);
    $("[data-hu347-box-count]").textContent = String(boxes);
    $("[data-hu347-position-count]").textContent = pallets.length + "/" + maxPositions;
    $("[data-hu347-capacity-pill]").textContent = capacity + "% ocupado";
    $("[data-hu347-capacity-bar]").style.width = capacity + "%";
    $("[data-hu347-balance-status]").textContent = pallets.length === maxPositions
      ? "Estiba completa: " + pallets.length + " pallets y " + boxes + " cajas conciliadas."
      : "Faltan " + (maxPositions - pallets.length) + " posiciones por completar.";
    $("[data-hu347-result-copy]").textContent = pallets.length === maxPositions
      ? boxes + " cajas · estiba completa"
      : "Selecciona " + (maxPositions - pallets.length) + " pallet" + (maxPositions - pallets.length === 1 ? "" : "s") + " más";
  }

  function render() {
    renderEligible();
    renderStowage();
    renderSummary();
    writeJson(pageKey, { selected: selected, updatedAt: new Date().toISOString() });
  }

  function selectEligible() {
    selected = eligiblePallets.slice(0, maxPositions).map(function (item) { return item.sscc; });
    if (window.SialMobileUI) window.SialMobileUI.markUnsavedChanges("scan");
    setScanStatus("Se ocuparon las 6 posiciones con pallets aptos.", "success");
    render();
  }

  function addFromValue(value) {
    var sscc = normalizeSscc(value);
    var pallet = eligiblePallets.find(function (item) { return item.sscc === sscc; });
    if (!pallet) {
      setScanStatus("El SSCC no está disponible para consolidación.", "error");
      return false;
    }
    if (selected.indexOf(sscc) >= 0) {
      setScanStatus("Este pallet ya ocupa una posición en la estiba.", "warning");
      return false;
    }
    var added = togglePallet(sscc);
    if (added) $("[data-hu347-sscc]").value = "";
    return added;
  }

  function scanPallet() {
    var next = eligiblePallets.find(function (item) { return selected.indexOf(item.sscc) < 0; }) || eligiblePallets[0];
    if (!window.SialMobileUI || typeof window.SialMobileUI.openBarcodeScanner !== "function") {
      addFromValue($("[data-hu347-sscc]").value);
      return;
    }
    window.SialMobileUI.openBarcodeScanner({
      title: "Escanear pallet para estiba",
      eyebrow: "HU347 · Cargue final",
      normalize: normalizeSscc,
      validate: function (value) {
        var sscc = normalizeSscc(value);
        var pallet = eligiblePallets.find(function (item) { return item.sscc === sscc; });
        if (!pallet) return { ok: false, message: "El SSCC no está disponible para consolidación." };
        if (selected.indexOf(sscc) >= 0) return { ok: false, message: "El pallet ya fue cargado." };
        return { ok: true, message: "Pallet apto para la siguiente posición." };
      },
      onDetected: function (value) { addFromValue(value); }
    });
  }

  function persistLoadResult() {
    var state = readJson(workflowKey, {});
    var pallets = selectedPallets();
    state.zeConsolidatedLoad = {
      finalContainer: "SIALC9081726",
      loadingPlan: "LP-2026-0819",
      pallets: pallets.map(function (item, index) {
        return {
          sscc: item.sscc,
          reference: item.reference,
          farm: item.farm,
          boxes: Number(item.boxes || 0),
          position: index + 1,
          sourceContainer: item.sourceContainer || ""
        };
      }),
      totalBoxes: pallets.reduce(function (total, item) { return total + Number(item.boxes || 0); }, 0),
      seal: $("[name='selloFinal']").value.trim(),
      targetTemperature: Number($("[name='temperatura']").value),
      registeredAt: new Date().toISOString()
    };
    state.container = "SIALC9081726";
    state.loadedPallets = pallets.length;
    state.pallets = pallets.length;
    state.boxes = state.zeConsolidatedLoad.totalBoxes;
    writeJson(workflowKey, state);
  }

  function validateBeforeSubmit(event) {
    var pallets = selectedPallets();
    if (pallets.length !== maxPositions) {
      event.preventDefault();
      event.stopPropagation();
      setInlineError("Completa las 6 posiciones del mapa de estiba.", $("[data-hu347-eligible-list]"));
      return;
    }
    var seal = $("[name='selloFinal']");
    if (!seal.value.trim()) {
      event.preventDefault();
      event.stopPropagation();
      setInlineError("Registra el sello final del contenedor.", seal);
      return;
    }
    var checks = Array.from($("[data-event='zeConsolidatedLoad']").querySelectorAll("input[type='checkbox'][required]"));
    var unchecked = checks.find(function (input) { return !input.checked; });
    if (unchecked) {
      event.preventDefault();
      event.stopPropagation();
      setInlineError("Confirma los tres controles de aseguramiento.", unchecked);
      return;
    }
    var state = readJson(workflowKey, {});
    var missingEvidence = ["hu347-estiba-final", "hu347-sello-final"].filter(function (key) { return !(state.photos || {})[key]; });
    if (missingEvidence.length) {
      event.preventDefault();
      event.stopPropagation();
      setInlineError("Agrega evidencia de la estiba final y del sello instalado.", $("[data-add-photo='hu347-estiba-final']"));
      return;
    }
    persistLoadResult();
  }

  function hydrateGuard() {
    var state = readJson(workflowKey, {});
    var guard = $("[data-hu347-guard]");
    var completed = Boolean(state.flags && state.flags.zePalletUnload && state.flags.zePalletReassembly);
    var step = $("[data-hu347-reassembly-step]");
    if (guard) guard.hidden = completed;
    if (step) {
      step.classList.toggle("is-complete", completed);
      step.querySelector("b").textContent = completed ? "✓" : "2";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadInventory();
    hydrateGuard();
    render();
    $("[data-hu347-select-eligible]").addEventListener("click", selectEligible);
    $("[data-hu347-eligible-list]").addEventListener("click", function (event) {
      var button = event.target.closest("[data-hu347-pallet]");
      if (button) togglePallet(button.dataset.hu347Pallet);
    });
    $("[data-hu347-scan]").addEventListener("click", scanPallet);
    $("[data-hu347-sscc]").addEventListener("keydown", function (event) {
      if (event.key !== "Enter") return;
      event.preventDefault();
      addFromValue(event.currentTarget.value);
    });
    $("[data-event='zeConsolidatedLoad']").addEventListener("submit", validateBeforeSubmit);
  });
})();
