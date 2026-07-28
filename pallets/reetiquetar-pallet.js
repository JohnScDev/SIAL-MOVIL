(function () {
  "use strict";

  var pageKey = "sial-mobile-hu591";
  var workflowKey = "sial-mobile-workflow";
  var selectedPallet = null;
  var newSsccSource = "TYPED";

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || "") || fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function pageState() {
    var state = readJson(pageKey, {});
    state.readyPallets = Array.isArray(state.readyPallets) ? state.readyPallets : [];
    state.usedSscc = Array.isArray(state.usedSscc) ? state.usedSscc : [];
    state.sequence = Number(state.sequence || 0);
    return state;
  }

  function normalizeSscc(value) {
    if (window.SialMobileUI && typeof window.SialMobileUI.normalizeSscc === "function") {
      return window.SialMobileUI.normalizeSscc(value);
    }
    var digits = String(value || "").replace(/\D/g, "");
    return digits.length === 20 && digits.slice(0, 2) === "00" ? digits.slice(2) : digits;
  }

  function checkDigit(body) {
    var sum = 0;
    for (var i = body.length - 1, weight = 3; i >= 0; i -= 1, weight = weight === 3 ? 1 : 3) {
      sum += Number(body.charAt(i)) * weight;
    }
    return String((10 - (sum % 10)) % 10);
  }

  function validateNewSscc(value) {
    var code = normalizeSscc(value);
    var state = pageState();
    var workflow = readJson(workflowKey, {});
    var used = new Set([].concat(state.usedSscc || [], workflow.usedSscc || []).filter(Boolean));
    if (code.length !== 18) return { ok: false, message: "El nuevo SSCC debe tener 18 dígitos." };
    if (checkDigit(code.slice(0, 17)) !== code.slice(17)) return { ok: false, message: "El dígito de control no es válido." };
    if (selectedPallet && code === selectedPallet.sscc) return { ok: false, message: "El nuevo SSCC no puede ser igual al anterior." };
    if (used.has(code)) return { ok: false, message: "Este SSCC ya fue utilizado." };
    return { ok: true, message: "Nuevo SSCC válido y disponible." };
  }

  function nextSscc(reserve) {
    var state = pageState();
    var used = new Set(state.usedSscc || []);
    var next = state.sequence;
    var code = "";
    do {
      next += 1;
      var body = "1770123456789" + String(next).padStart(4, "0");
      code = body + checkDigit(body);
    } while (used.has(code));
    if (reserve) {
      state.sequence = next;
      writeJson(pageKey, state);
    }
    return code;
  }

  function status(selector, message, type) {
    var node = $(selector);
    node.textContent = message;
    node.className = "sial-field-note" + (type ? " " + type : "");
  }

  function clearValidationFeedback(field) {
    if (field) {
      field.removeAttribute("aria-invalid");
      field.classList.remove("sial-error-target");
    }
    var error = $("[data-flow-error]");
    if (error && window.SialMobileUI && typeof window.SialMobileUI.clearInlineStatus === "function") {
      window.SialMobileUI.clearInlineStatus(error);
    }
  }

  function showInline(message, field) {
    var error = $("[data-flow-error]");
    if (window.SialMobileUI && typeof window.SialMobileUI.setInlineStatus === "function") {
      window.SialMobileUI.setInlineStatus(error, {
        type: "error",
        title: "Revisa el re-etiquetado",
        message: message,
        form: error.closest("form"),
        field: field
      });
      return;
    }
    error.hidden = false;
    error.textContent = message;
    (field || error).scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function referenceRows(pallet) {
    if (Array.isArray(pallet.references)) return pallet.references;
    return [{
      reference: pallet.reference || "Referencia",
      referenceName: pallet.referenceName || "",
      boxes: Number(pallet.boxes || 0),
      lots: typeof pallet.lots === "string"
        ? pallet.lots.split(",").filter(Boolean).map(function (lot) { return { lotId: lot.trim(), boxes: Number(pallet.boxes || 0) }; })
        : []
    }];
  }

  function loadPallet() {
    var code = normalizeSscc($("[data-relabel-old-sscc]").value);
    $("[data-relabel-old-sscc]").value = code;
    selectedPallet = pageState().readyPallets.find(function (item) {
      return item.sscc === code && item.status === "LISTO_PARA_CARGUE";
    }) || null;
    if (!selectedPallet) {
      $("[data-relabel-source]").hidden = true;
      status("[data-relabel-old-status]", "No encontramos un pallet disponible con este SSCC.", "error");
      updatePreview();
      return false;
    }
    var refs = referenceRows(selectedPallet);
    $("[data-relabel-source]").hidden = false;
    $("[data-relabel-source]").innerHTML = [
      '<div class="hu591-relabel-source-head"><div><span>Pallet encontrado</span><strong>' + escapeHtml(selectedPallet.sscc) + '</strong></div><span class="sial-pill success">Listo para cargue</span></div>',
      '<div class="hu591-relabel-source-list">',
      refs.map(function (item) {
        return '<div><span><strong>' + escapeHtml(item.reference) + '</strong><small>' + escapeHtml(item.referenceName || "") + '</small></span><strong>' + Number(item.boxes || 0) + ' cajas</strong></div>';
      }).join(""),
      '</div>'
    ].join("");
    status("[data-relabel-old-status]", "Pallet cargado. Verifica su información antes de continuar.", "success");
    clearValidationFeedback($("[data-relabel-old-sscc]"));
    updatePreview();
    return true;
  }

  function applyNewSscc(value, source) {
    var code = normalizeSscc(value).slice(0, 18);
    $("[data-relabel-new-sscc]").value = code;
    newSsccSource = source || "TYPED";
    var result = validateNewSscc(code);
    status("[data-relabel-new-status]", result.message, result.ok ? "success" : "error");
    if (result.ok) clearValidationFeedback($("[data-relabel-new-sscc]"));
    updatePreview();
  }

  function openScanner(kind) {
    if (!window.SialMobileUI || typeof window.SialMobileUI.openBarcodeScanner !== "function") {
      status(kind === "old" ? "[data-relabel-old-status]" : "[data-relabel-new-status]", "El escáner no está disponible. Digita el SSCC.", "error");
      return;
    }
    window.SialMobileUI.openBarcodeScanner({
      title: kind === "old" ? "Escanear SSCC anterior" : "Escanear nuevo SSCC",
      eyebrow: "Re-etiquetado de pallet",
      normalize: normalizeSscc,
      validate: kind === "old"
        ? function (value) { return value.length === 18 ? { ok: true, value: value } : { ok: false, message: "El SSCC debe tener 18 dígitos." }; }
        : validateNewSscc,
      onDetected: function (value) {
        if (kind === "old") {
          $("[data-relabel-old-sscc]").value = value;
          loadPallet();
        } else {
          applyNewSscc(value, "SCANNED");
        }
      }
    });
  }

  function updatePreview() {
    var refs = selectedPallet ? referenceRows(selectedPallet) : [];
    $("[data-relabel-preview-old]").textContent = selectedPallet ? selectedPallet.sscc : "--";
    $("[data-relabel-preview-new]").textContent = $("[data-relabel-new-sscc]").value || "SSCC pendiente";
    $("[data-relabel-preview-farm]").textContent = selectedPallet ? selectedPallet.farmCode + " · " + selectedPallet.farmName : "--";
    $("[data-relabel-preview-references]").textContent = String(refs.length);
    $("[data-relabel-preview-boxes]").textContent = refs.reduce(function (total, item) { return total + Number(item.boxes || 0); }, 0) + " cajas";
  }

  function saveRelabel() {
    var state = pageState();
    var newSscc = normalizeSscc($("[data-relabel-new-sscc]").value);
    var replacement = Object.assign({}, selectedPallet, {
      sscc: newSscc,
      ssccSource: newSsccSource,
      relabeledFrom: selectedPallet.sscc,
      relabelReason: $("[data-relabel-reason]").value,
      relabelNotes: $("[data-relabel-notes]").value.trim(),
      status: "LISTO_PARA_CARGUE",
      createdAt: new Date().toISOString()
    });
    state.readyPallets = [replacement].concat(state.readyPallets.map(function (item) {
      if (item.sscc !== selectedPallet.sscc) return item;
      return Object.assign({}, item, {
        status: "ANULADO",
        replacedBy: newSscc,
        annulledAt: new Date().toISOString()
      });
    }));
    state.usedSscc = Array.from(new Set([newSscc, selectedPallet.sscc].concat(state.usedSscc || [])));
    writeJson(pageKey, state);
    var workflow = readJson(workflowKey, {});
    workflow.readyPallets = state.readyPallets;
    workflow.usedSscc = Array.from(new Set([].concat(workflow.usedSscc || [], state.usedSscc)));
    workflow.lastPallet = replacement;
    writeJson(workflowKey, workflow);
    return replacement;
  }

  function wire() {
    var form = $("[data-flow-form]");
    updatePreview();
    $("[data-relabel-search]").addEventListener("click", loadPallet);
    $("[data-relabel-scan-old]").addEventListener("click", function () { openScanner("old"); });
    $("[data-relabel-scan-new]").addEventListener("click", function () { openScanner("new"); });
    $("[data-relabel-generate]").addEventListener("click", function () { applyNewSscc(nextSscc(true), "GENERATED"); });
    $("[data-relabel-old-sscc]").addEventListener("input", function (event) {
      event.target.value = event.target.value.replace(/\D/g, "").slice(0, 18);
      selectedPallet = null;
      $("[data-relabel-source]").hidden = true;
      status("[data-relabel-old-status]", "Pulsa Consultar para cargar la información del pallet.", "");
      updatePreview();
    });
    $("[data-relabel-new-sscc]").addEventListener("input", function (event) {
      event.target.value = event.target.value.replace(/\D/g, "").slice(0, 18);
      newSsccSource = "TYPED";
      if (event.target.value.length === 18) applyNewSscc(event.target.value, "TYPED");
      else updatePreview();
    });
    form.addEventListener("submit", function (event) {
      if (!selectedPallet) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showInline("Consulta y selecciona el pallet que será re-etiquetado.", $("[data-relabel-old-sscc]"));
        return;
      }
      if (!$("[data-relabel-reason]").value) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showInline("Selecciona el motivo del re-etiquetado.", $("[data-relabel-reason]"));
        return;
      }
      if (!$("[data-relabel-notes]").value.trim()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showInline("Explica el cambio realizado.", $("[data-relabel-notes]"));
        return;
      }
      var result = validateNewSscc($("[data-relabel-new-sscc]").value);
      if (!result.ok) {
        event.preventDefault();
        event.stopImmediatePropagation();
        status("[data-relabel-new-status]", result.message, "error");
        showInline(result.message, $("[data-relabel-new-sscc]"));
        return;
      }
      var replacement = saveRelabel();
      form.dataset.detail = "Re-etiquetado " + replacement.relabeledFrom + " → " + replacement.sscc;
    }, true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();
