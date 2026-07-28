(function () {
  "use strict";

  var workflowKey = "sial-mobile-workflow";
  var contextKey = "sial-mobile-context";
  var pageKey = "sial-mobile-hu591";
  var references = {
    "BAN-REF-001": { name: "Premium 22XU", recipe: 48 },
    "BAN-REF-004": { name: "Cluster 208", recipe: 54 },
    "BAN-REF-011": { name: "Export 40LB", recipe: 48 },
    "BAN-REF-014": { name: "IFCO Mixto", recipe: 66 },
    "BAN-REF-018": { name: "Baby Banana", recipe: 54 },
    "BAN-REF-019": { name: "EPS Puerto", recipe: 48 },
    "BAN-REF-022": { name: "Orgánico 18KG", recipe: 66 },
    "BAN-REF-027": { name: "Convencional 13KG", recipe: 54 },
    "BAN-REF-030": { name: "Canastilla retorno", recipe: 48 },
    "BAN-REF-035": { name: "Especial consolidado", recipe: 66 },
    "BAN-REF-038": { name: "Cierre corte", recipe: 48 },
    "BAN-REF-044": { name: "Mercado Norte", recipe: 54 }
  };
  var lotsByReference = {
    "BAN-REF-001": ["L-0435-26-148", "L-0435-26-149", "L-0435-26-152"],
    "BAN-REF-004": ["L-0435-26-153", "L-0435-26-154"],
    "BAN-REF-011": ["L-0435-26-155", "L-0435-26-158"],
    "BAN-REF-014": ["L-0435-26-160", "L-0435-26-161"],
    "BAN-REF-018": ["L-0435-26-164", "L-0435-26-165"],
    "BAN-REF-019": ["L-0435-26-166", "L-0435-26-168"],
    "BAN-REF-022": ["L-0435-26-170", "L-0435-26-171"],
    "BAN-REF-027": ["L-0435-26-173", "L-0435-26-174"],
    "BAN-REF-030": ["L-0435-26-175", "L-0435-26-176"],
    "BAN-REF-035": ["L-0435-26-178", "L-0435-26-180"],
    "BAN-REF-038": ["L-0435-26-181", "L-0435-26-182"],
    "BAN-REF-044": ["L-0435-26-184", "L-0435-26-185"]
  };
  var contextFarmCodes = {
    "finca-santa-isabel": "0527",
    "finca-la-esperanza": "0412",
    "unidad-operativa-puerto": "0435"
  };
  var draftReferences = [];
  var readings = [];
  var ssccSource = "TYPED";
  var draftStartedAt = new Date().toISOString();

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
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

  function readPageState() {
    var state = readJson(pageKey, {});
    state.readyPallets = Array.isArray(state.readyPallets) ? state.readyPallets : [];
    state.usedSscc = Array.isArray(state.usedSscc) ? state.usedSscc : [];
    state.sequence = Number(state.sequence || 0);
    return state;
  }

  function readWorkflowState() {
    return readJson(workflowKey, {});
  }

  function activeFarm() {
    var context = readJson(contextKey, {});
    var workflow = readWorkflowState();
    var name = context.name || workflow.farmName || "Finca Santa Isabel";
    var code = contextFarmCodes[context.id] || workflow.farmCode || "0527";
    return { id: context.id || "finca-santa-isabel", code: code, name: name };
  }

  function isoWeek(date) {
    var current = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    var day = current.getUTCDay() || 7;
    current.setUTCDate(current.getUTCDate() + 4 - day);
    var yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
    var week = Math.ceil((((current - yearStart) / 86400000) + 1) / 7);
    return current.getUTCFullYear() + "-W" + String(week).padStart(2, "0");
  }

  function checkDigit(body) {
    var sum = 0;
    for (var i = body.length - 1, weight = 3; i >= 0; i -= 1, weight = weight === 3 ? 1 : 3) {
      sum += Number(body.charAt(i)) * weight;
    }
    return String((10 - (sum % 10)) % 10);
  }

  function buildSscc(sequence) {
    var body = "1770123456789" + String(sequence).padStart(4, "0");
    return body + checkDigit(body);
  }

  function allUsedSscc(pageState) {
    var workflow = readWorkflowState();
    var workflowUsed = Array.isArray(workflow.usedSscc) ? workflow.usedSscc : [];
    var palletCodes = Array.isArray(workflow.readyPallets)
      ? workflow.readyPallets.map(function (item) { return item.sscc; })
      : [];
    return new Set([].concat(pageState.usedSscc || [], workflowUsed, palletCodes).filter(Boolean));
  }

  function nextSscc(reserve) {
    var state = readPageState();
    var used = allUsedSscc(state);
    var next = state.sequence || 0;
    var code = "";
    do {
      next += 1;
      code = buildSscc(next);
    } while (used.has(code));
    if (reserve) {
      state.sequence = next;
      writeJson(pageKey, state);
    }
    return code;
  }

  function normalizeSscc(value) {
    if (window.SialMobileUI && typeof window.SialMobileUI.normalizeSscc === "function") {
      return window.SialMobileUI.normalizeSscc(value);
    }
    var digits = String(value || "").replace(/\D/g, "");
    return digits.length === 20 && digits.slice(0, 2) === "00" ? digits.slice(2) : digits;
  }

  function validateSscc(value) {
    var code = normalizeSscc(value);
    if (code.length !== 18) return { ok: false, message: "El SSCC debe tener 18 dígitos." };
    if (checkDigit(code.slice(0, 17)) !== code.slice(17)) return { ok: false, message: "El dígito de control del SSCC no es válido." };
    if (allUsedSscc(readPageState()).has(code)) return { ok: false, message: "Este SSCC ya fue utilizado. Genera uno nuevo." };
    return { ok: true, message: "SSCC válido y disponible." };
  }

  function setFieldStatus(node, message, type) {
    if (!node) return;
    node.textContent = message;
    node.className = "sial-field-note" + (type ? " " + type : "");
  }

  function setSsccStatus(result) {
    setFieldStatus($("[data-hu591-sscc-status]"), result.message, result.ok ? "success" : "error");
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

  function applySscc(value, source, message) {
    var code = normalizeSscc(value).slice(0, 18);
    var result = validateSscc(code);
    $("[data-hu591-sscc]").value = code;
    ssccSource = source || "TYPED";
    if (result.ok && message) result.message = message;
    setSsccStatus(result);
    if (result.ok) clearValidationFeedback($("[data-hu591-sscc]"));
    updateSummary();
    markDirty("hu591");
    return result;
  }

  function openSsccScanner() {
    if (!window.SialMobileUI || typeof window.SialMobileUI.openBarcodeScanner !== "function") {
      setSsccStatus({ ok: false, message: "El escáner no está disponible. Digita el SSCC manualmente." });
      return;
    }
    window.SialMobileUI.openBarcodeScanner({
      title: "Escanear código SSCC",
      eyebrow: "Identificación de pallet",
      normalize: normalizeSscc,
      validate: validateSscc,
      onDetected: function (value) {
        applySscc(value, "SCANNED", "SSCC escaneado y disponible.");
      }
    });
  }

  function markDirty(reason) {
    if (window.SialMobileUI && typeof window.SialMobileUI.markUnsavedChanges === "function") {
      window.SialMobileUI.markUnsavedChanges(reason || "hu591");
    }
  }

  function totalBoxes() {
    return draftReferences.reduce(function (total, item) {
      return total + Number(item.boxes || 0);
    }, 0);
  }

  function lotBoxes(item) {
    return item.lots.reduce(function (total, lot) {
      return total + Number(lot.boxes || 0);
    }, 0);
  }

  function makeReference(code) {
    return {
      code: code,
      boxes: references[code].recipe,
      mismatchReason: "",
      lots: [{ lotId: "", boxes: references[code].recipe }]
    };
  }

  function selectedCodes() {
    return draftReferences.map(function (item) { return item.code; });
  }

  function openReferencePicker() {
    var staged = new Set(selectedCodes());
    var content = document.createElement("div");
    content.className = "hu591-reference-picker";
    content.innerHTML = [
      '<label class="sial-field">',
      '<span class="sial-label">Buscar referencia</span>',
      '<input class="sial-picker-search" type="search" autocomplete="off" placeholder="Código o nombre" data-hu591-picker-search>',
      '</label>',
      '<p class="hu591-picker-count" data-hu591-picker-count></p>',
      '<div class="hu591-picker-list" role="listbox" aria-multiselectable="true" data-hu591-picker-list></div>'
    ].join("");

    function renderPicker(filter) {
      var query = String(filter || "").trim().toLowerCase();
      var list = $("[data-hu591-picker-list]", content);
      var matches = Object.keys(references).filter(function (code) {
        return (code + " " + references[code].name).toLowerCase().indexOf(query) >= 0;
      });
      list.innerHTML = matches.map(function (code) {
        var selected = staged.has(code);
        return [
          '<button class="hu591-picker-option' + (selected ? " is-selected" : "") + '" type="button" role="option" aria-selected="' + selected + '" data-hu591-picker-option="' + code + '">',
          '<span class="hu591-picker-check" aria-hidden="true">' + (selected ? "✓" : "") + '</span>',
          '<span><strong>' + escapeHtml(code) + '</strong><small>' + escapeHtml(references[code].name) + ' · Receta ' + references[code].recipe + ' cajas</small></span>',
          '</button>'
        ].join("");
      }).join("");
      $("[data-hu591-picker-count]", content).textContent = staged.size + " referencia" + (staged.size === 1 ? "" : "s") + " seleccionada" + (staged.size === 1 ? "" : "s");
    }

    content.addEventListener("click", function (event) {
      var option = event.target.closest("[data-hu591-picker-option]");
      if (!option) return;
      var code = option.dataset.hu591PickerOption;
      if (staged.has(code)) staged.delete(code);
      else staged.add(code);
      renderPicker($("[data-hu591-picker-search]", content).value);
    });
    $("[data-hu591-picker-search]", content).addEventListener("input", function (event) {
      renderPicker(event.target.value);
    });
    renderPicker("");

    window.SialMobileUI.openDialog({
      id: "hu591-reference-picker",
      variant: "sheet",
      title: "Seleccionar referencias",
      message: "Puedes elegir varias referencias para un mismo pallet.",
      content: content,
      returnFocus: $("[data-hu591-open-reference-picker]"),
      actions: [
        { label: "Cancelar", variant: "secondary" },
        {
          label: "Aplicar selección",
          onClick: function () {
            var currentByCode = {};
            draftReferences.forEach(function (item) { currentByCode[item.code] = item; });
            draftReferences = Array.from(staged).map(function (code) {
              return currentByCode[code] || makeReference(code);
            });
            clearValidationFeedback($("[data-hu591-open-reference-picker]"));
            readings = readings.filter(function (reading) { return staged.has(reading.referenceCode); });
            renderReferenceCards();
            renderReadings();
            markDirty("reference");
          }
        }
      ]
    });
  }

  function lotOptions(referenceCode, selectedLot) {
    return ['<option value="">Selecciona un lote</option>'].concat(
      (lotsByReference[referenceCode] || []).map(function (lotId) {
        return '<option value="' + escapeHtml(lotId) + '"' + (lotId === selectedLot ? " selected" : "") + ">" + escapeHtml(lotId) + "</option>";
      })
    ).join("");
  }

  function referenceStatus(item) {
    var assigned = lotBoxes(item);
    var boxes = Number(item.boxes || 0);
    if (!boxes) return { type: "error", message: "Registra la cantidad de cajas de esta referencia." };
    if (!item.lots.length || item.lots.some(function (lot) { return !lot.lotId; })) {
      return { type: "warning", message: "Selecciona todos los lotes asociados." };
    }
    if (assigned !== boxes) {
      return { type: "error", message: "Asignación incompleta: " + assigned + " de " + boxes + " cajas." };
    }
    if (boxes !== references[item.code].recipe && !String(item.mismatchReason || "").trim()) {
      return { type: "warning", message: "La cantidad difiere de la receta. Explica el motivo." };
    }
    return { type: "success", message: "Distribución completa: " + assigned + " de " + boxes + " cajas." };
  }

  function renderReferenceCards() {
    var list = $("[data-hu591-reference-list]");
    var count = $("[data-hu591-reference-count]");
    count.textContent = draftReferences.length + " seleccionada" + (draftReferences.length === 1 ? "" : "s");
    if (!draftReferences.length) {
      list.innerHTML = [
        '<div class="hu591-reference-empty">',
        '<svg class="sial-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v10H4z"/><path d="M8 11h8"/></svg>',
        '<strong>Sin referencias</strong>',
        '<span>Usa “Agregar referencias” para comenzar el pallet.</span>',
        '</div>'
      ].join("");
      setFieldStatus($("[data-hu591-references-status]"), "Selecciona al menos una referencia para continuar.", "");
    } else {
      list.innerHTML = draftReferences.map(function (item, index) {
        var data = references[item.code];
        var status = referenceStatus(item);
        var mismatch = Number(item.boxes || 0) > 0 && Number(item.boxes) !== data.recipe;
        var lots = item.lots.map(function (lot, lotIndex) {
          return [
            '<div class="hu591-lot-row" data-hu591-lot-row>',
            '<label class="sial-field"><span class="sial-label">Lote</span><select class="sial-select" data-hu591-lot-select="' + lotIndex + '">' + lotOptions(item.code, lot.lotId) + '</select></label>',
            '<label class="sial-field"><span class="sial-label">Cajas</span><input class="sial-input-wrap sial-input" type="number" inputmode="numeric" min="1" max="96" value="' + escapeHtml(lot.boxes) + '" data-hu591-lot-boxes="' + lotIndex + '"></label>',
            '<button class="sial-btn sial-btn-icon hu591-remove-lot" type="button" data-hu591-remove-lot="' + lotIndex + '" aria-label="Quitar lote">×</button>',
            '</div>'
          ].join("");
        }).join("");
        return [
          '<article class="hu591-reference-card" data-hu591-reference-card="' + index + '">',
          '<header><div><span>Referencia ' + String(index + 1).padStart(2, "0") + '</span><strong>' + escapeHtml(item.code) + '</strong><small>' + escapeHtml(data.name) + '</small></div>',
          '<button class="sial-chip-action" type="button" data-hu591-remove-reference="' + index + '">Quitar</button></header>',
          '<div class="hu591-reference-boxes"><label class="sial-field"><span class="sial-label">Número de cajas</span><input class="sial-input-wrap sial-input" type="number" inputmode="numeric" min="1" max="96" value="' + escapeHtml(item.boxes) + '" data-hu591-reference-boxes></label>',
          '<span class="sial-pill">Receta ' + data.recipe + '</span></div>',
          '<div class="sial-field hu591-mismatch-reason"' + (mismatch ? "" : " hidden") + '><label class="sial-label">Motivo de diferencia</label><textarea class="sial-textarea" placeholder="Explica por qué la cantidad difiere de la receta" data-hu591-mismatch-reason>' + escapeHtml(item.mismatchReason) + '</textarea></div>',
          '<div class="hu591-lots-head"><div><strong>Distribución por lotes</strong><span>La suma debe coincidir con las cajas de la referencia.</span></div><button class="sial-chip-action" type="button" data-hu591-add-lot>+ Agregar lote</button></div>',
          '<div class="hu591-lot-list">' + lots + '</div>',
          '<p class="hu591-allocation-status ' + status.type + '" data-hu591-allocation-status>' + escapeHtml(status.message) + '</p>',
          '</article>'
        ].join("");
      }).join("");
      setFieldStatus($("[data-hu591-references-status]"), "Completa las cajas y lotes de cada referencia.", "");
    }
    updateReadingReferenceOptions();
    updateSummary();
  }

  function updateReferenceCard(index) {
    var card = $('[data-hu591-reference-card="' + index + '"]');
    var item = draftReferences[index];
    if (!card || !item) return;
    var boxes = Number($("[data-hu591-reference-boxes]", card).value || 0);
    item.boxes = boxes;
    var mismatch = boxes > 0 && boxes !== references[item.code].recipe;
    var mismatchWrap = $(".hu591-mismatch-reason", card);
    mismatchWrap.hidden = !mismatch;
    item.mismatchReason = mismatch ? $("[data-hu591-mismatch-reason]", card).value : "";
    item.lots.forEach(function (lot, lotIndex) {
      lot.lotId = $('[data-hu591-lot-select="' + lotIndex + '"]', card).value;
      lot.boxes = Number($('[data-hu591-lot-boxes="' + lotIndex + '"]', card).value || 0);
    });
    var status = referenceStatus(item);
    var statusNode = $("[data-hu591-allocation-status]", card);
    statusNode.className = "hu591-allocation-status " + status.type;
    statusNode.textContent = status.message;
    if (status.type === "success") {
      $all("[aria-invalid='true']", card).forEach(function (field) {
        field.removeAttribute("aria-invalid");
        field.classList.remove("sial-error-target");
      });
      clearValidationFeedback();
    }
    updateSummary();
  }

  function handleReferenceAction(event) {
    var card = event.target.closest("[data-hu591-reference-card]");
    if (!card) return;
    var index = Number(card.dataset.hu591ReferenceCard);
    var removeReference = event.target.closest("[data-hu591-remove-reference]");
    var addLot = event.target.closest("[data-hu591-add-lot]");
    var removeLot = event.target.closest("[data-hu591-remove-lot]");
    if (removeReference) {
      draftReferences.splice(index, 1);
      readings = readings.filter(function (reading) {
        return reading.referenceCode !== removeReference.closest("[data-hu591-reference-card]").querySelector("header strong").textContent;
      });
      renderReferenceCards();
      renderReadings();
      markDirty("reference");
      return;
    }
    if (addLot) {
      draftReferences[index].lots.push({ lotId: "", boxes: 0 });
      renderReferenceCards();
      markDirty("lot");
      return;
    }
    if (removeLot) {
      draftReferences[index].lots.splice(Number(removeLot.dataset.hu591RemoveLot), 1);
      renderReferenceCards();
      markDirty("lot");
    }
  }

  function updateReadingReferenceOptions() {
    var select = $("[data-hu591-reading-reference]");
    var previous = select.value;
    select.innerHTML = '<option value="">Selecciona una referencia</option>' + draftReferences.map(function (item) {
      return '<option value="' + item.code + '">' + item.code + ' · ' + escapeHtml(references[item.code].name) + '</option>';
    }).join("");
    if (selectedCodes().indexOf(previous) >= 0) select.value = previous;
  }

  function normalizeReading(value) {
    return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
  }

  function registerReading(rawValue, source) {
    var input = $("[data-hu591-reading-input]");
    var referenceCode = $("[data-hu591-reading-reference]").value;
    var value = normalizeReading(rawValue);
    if (!referenceCode) {
      setFieldStatus($("[data-hu591-reading-status]"), "Selecciona la referencia relacionada con la lectura.", "error");
      $("[data-hu591-reading-reference]").focus();
      return false;
    }
    if (!value) {
      setFieldStatus($("[data-hu591-reading-status]"), "Escanea o digita un código para agregarlo.", "error");
      input.focus();
      return false;
    }
    if (readings.some(function (item) { return item.code === value; })) {
      setFieldStatus($("[data-hu591-reading-status]"), "El código " + value + " ya está asociado al pallet.", "warning");
      return false;
    }
    readings.push({ code: value, referenceCode: referenceCode, source: source });
    input.value = "";
    renderReadings();
    setFieldStatus($("[data-hu591-reading-status]"), "Lectura agregada a " + referenceCode + ".", "success");
    markDirty("scan");
    return true;
  }

  function renderReadings() {
    var list = $("[data-hu591-reading-list]");
    $("[data-hu591-reading-count]").textContent = readings.length + " lectura" + (readings.length === 1 ? "" : "s");
    if (!readings.length) {
      list.innerHTML = '<div class="sial-list-row"><strong>Sin lecturas</strong><span>Esta sección es opcional.</span></div>';
      return;
    }
    list.innerHTML = readings.map(function (item, index) {
      return '<div class="sial-list-row"><div><strong>' + escapeHtml(item.code) + '</strong><span>' + escapeHtml(item.referenceCode) + '</span></div><button class="sial-chip-action" type="button" data-hu591-remove-reading="' + index + '">Quitar</button></div>';
    }).join("");
  }

  function openReadingScanner() {
    var referenceCode = $("[data-hu591-reading-reference]").value;
    if (!referenceCode) {
      setFieldStatus($("[data-hu591-reading-status]"), "Selecciona una referencia antes de abrir la cámara.", "error");
      $("[data-hu591-reading-reference]").focus();
      return;
    }
    if (!window.SialMobileUI || typeof window.SialMobileUI.openBarcodeScanner !== "function") {
      setFieldStatus($("[data-hu591-reading-status]"), "El escáner no está disponible. Digita el código manualmente.", "error");
      return;
    }
    window.SialMobileUI.openBarcodeScanner({
      title: "Escanear etiqueta",
      eyebrow: referenceCode,
      normalize: normalizeReading,
      validate: function (value) {
        return value ? { ok: true, value: value } : { ok: false, message: "No se detectó un código." };
      },
      onDetected: function (value) { registerReading(value, "SCANNED"); }
    });
  }

  function lastSsccForFarm(farmCode) {
    var ready = readPageState().readyPallets.filter(function (item) {
      return item.farmCode === farmCode && item.status === "LISTO_PARA_CARGUE";
    });
    return ready[0] ? ready[0].sscc : "--";
  }

  function updateSummary() {
    var farm = activeFarm();
    var week = isoWeek(new Date());
    var sscc = $("[data-hu591-sscc]").value || "SSCC pendiente";
    $("[data-hu591-context-farm]").textContent = farm.code + " · " + farm.name;
    $("[data-hu591-context-week]").textContent = week;
    $("[data-hu591-preview-sscc]").textContent = sscc;
    $("[data-hu591-preview-farm]").textContent = farm.code + " · " + farm.name;
    $("[data-hu591-preview-week]").textContent = week;
    $("[data-hu591-preview-boxes]").textContent = totalBoxes() + " cajas";
    $("[data-hu591-preview-last-sscc]").textContent = lastSsccForFarm(farm.code);
    var preview = $("[data-hu591-preview-references]");
    if (!draftReferences.length) {
      preview.innerHTML = "<p>Agrega referencias para construir el resumen.</p>";
      return;
    }
    preview.innerHTML = draftReferences.map(function (item) {
      var lotSummary = item.lots.filter(function (lot) { return lot.lotId; }).map(function (lot) {
        return lot.lotId + " · " + Number(lot.boxes || 0);
      }).join(" / ");
      return [
        '<div class="hu591-label-reference-row">',
        '<div><strong>' + escapeHtml(item.code) + '</strong><span>' + escapeHtml(references[item.code].name) + '</span></div>',
        '<strong>' + Number(item.boxes || 0) + ' cajas</strong>',
        '<small>' + escapeHtml(lotSummary || "Lotes pendientes") + '</small>',
        '</div>'
      ].join("");
    }).join("");
  }

  function showInline(message, field) {
    var error = $("[data-flow-error]");
    if (!error) return;
    if (window.SialMobileUI && typeof window.SialMobileUI.setInlineStatus === "function") {
      window.SialMobileUI.setInlineStatus(error, {
        type: "error",
        title: "Revisa el armado del pallet",
        message: message,
        form: error.closest("form"),
        field: field
      });
      return;
    }
    error.hidden = false;
    error.textContent = message;
    (field || error).scrollIntoView({ behavior: "smooth", block: "center" });
    (field || error).focus({ preventScroll: true });
  }

  function validateDraft() {
    var sscc = normalizeSscc($("[data-hu591-sscc]").value);
    var ssccResult = validateSscc(sscc);
    setSsccStatus(ssccResult);
    if (!ssccResult.ok) return { message: ssccResult.message, field: $("[data-hu591-sscc]") };
    if (!draftReferences.length) return { message: "Agrega al menos una referencia al pallet.", field: $("[data-hu591-open-reference-picker]") };
    for (var i = 0; i < draftReferences.length; i += 1) {
      var item = draftReferences[i];
      var card = $('[data-hu591-reference-card="' + i + '"]');
      if (!Number(item.boxes || 0)) return { message: "Registra las cajas de " + item.code + ".", field: $("[data-hu591-reference-boxes]", card) };
      if (!item.lots.length || item.lots.some(function (lot) { return !lot.lotId; })) {
        return { message: "Selecciona todos los lotes de " + item.code + ".", field: $(".sial-select", card) };
      }
      var uniqueLots = new Set(item.lots.map(function (lot) { return lot.lotId; }));
      if (uniqueLots.size !== item.lots.length) return { message: "Un lote no puede repetirse dentro de " + item.code + ".", field: $(".sial-select", card) };
      if (item.lots.some(function (lot) { return Number(lot.boxes || 0) < 1; })) {
        return { message: "Cada lote de " + item.code + " debe tener al menos una caja.", field: $('[data-hu591-lot-boxes]', card) };
      }
      if (lotBoxes(item) !== Number(item.boxes)) {
        return { message: "Las cajas por lote de " + item.code + " deben sumar " + item.boxes + ".", field: $('[data-hu591-lot-boxes]', card) };
      }
      if (Number(item.boxes) !== references[item.code].recipe && !String(item.mismatchReason || "").trim()) {
        return { message: "Explica la diferencia contra receta de " + item.code + ".", field: $("[data-hu591-mismatch-reason]", card) };
      }
    }
    return null;
  }

  function collectRecord() {
    var farm = activeFarm();
    var workflow = readWorkflowState();
    var sscc = normalizeSscc($("[data-hu591-sscc]").value);
    return {
      sscc: sscc,
      ssccSource: ssccSource,
      operation: workflow.operation || $("[data-hu591-operation]").value || "EXP-2026-0418",
      user: workflow.user || "María Operadora",
      farmCode: farm.code,
      farmName: farm.name,
      week: isoWeek(new Date()),
      references: draftReferences.map(function (item) {
        return {
          reference: item.code,
          referenceName: references[item.code].name,
          recipeBoxes: references[item.code].recipe,
          boxes: Number(item.boxes),
          lots: item.lots.map(function (lot) { return { lotId: lot.lotId, boxes: Number(lot.boxes) }; }),
          mismatchReason: item.mismatchReason || ""
        };
      }),
      boxes: totalBoxes(),
      observations: $("[data-hu591-observations]").value.trim(),
      readings: readings.slice(),
      startedAt: draftStartedAt,
      createdAt: new Date().toISOString(),
      status: "LISTO_PARA_CARGUE"
    };
  }

  function saveRecord(record) {
    var page = readPageState();
    page.readyPallets = [record].concat(page.readyPallets.filter(function (item) { return item.sscc !== record.sscc; }));
    page.usedSscc = Array.from(new Set([record.sscc].concat(page.usedSscc || [])));
    writeJson(pageKey, page);
    var workflow = readWorkflowState();
    workflow.readyPallets = page.readyPallets;
    workflow.usedSscc = Array.from(new Set([].concat(workflow.usedSscc || [], page.usedSscc)));
    workflow.boxes = page.readyPallets.filter(function (item) { return item.status === "LISTO_PARA_CARGUE"; }).reduce(function (total, item) {
      return total + Number(item.boxes || 0);
    }, 0);
    workflow.pallets = page.readyPallets.filter(function (item) { return item.status === "LISTO_PARA_CARGUE"; }).length;
    workflow.lastPallet = record;
    writeJson(workflowKey, workflow);
  }

  function wireForm() {
    var form = $("[data-flow-form]");
    renderReferenceCards();
    renderReadings();
    updateSummary();

    $("[data-hu591-generate-sscc]").addEventListener("click", function () {
      applySscc(nextSscc(true), "GENERATED", "SSCC generado y disponible.");
    });
    $("[data-hu591-scan-sscc]").addEventListener("click", openSsccScanner);
    $("[data-hu591-open-reference-picker]").addEventListener("click", openReferencePicker);
    $("[data-hu591-reference-list]").addEventListener("click", handleReferenceAction);
    $("[data-hu591-reference-list]").addEventListener("input", function (event) {
      var card = event.target.closest("[data-hu591-reference-card]");
      if (!card) return;
      updateReferenceCard(Number(card.dataset.hu591ReferenceCard));
      markDirty(event.target.matches("[data-hu591-lot-boxes]") ? "lot" : "reference");
    });
    $("[data-hu591-reference-list]").addEventListener("change", function (event) {
      var card = event.target.closest("[data-hu591-reference-card]");
      if (!card) return;
      updateReferenceCard(Number(card.dataset.hu591ReferenceCard));
      markDirty("lot");
    });
    $("[data-hu591-sscc]").addEventListener("input", function (event) {
      event.target.value = event.target.value.replace(/\D/g, "").slice(0, 18);
      ssccSource = "TYPED";
      if (event.target.value.length === 18) setSsccStatus(validateSscc(event.target.value));
      if (event.target.value.length === 18 && validateSscc(event.target.value).ok) clearValidationFeedback(event.target);
      updateSummary();
      markDirty("hu591");
    });
    $("[data-hu591-scan-reading]").addEventListener("click", openReadingScanner);
    $("[data-hu591-add-reading]").addEventListener("click", function () {
      registerReading($("[data-hu591-reading-input]").value, "TYPED");
    });
    $("[data-hu591-reading-input]").addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        registerReading(event.target.value, "TYPED");
      }
    });
    $("[data-hu591-reading-list]").addEventListener("click", function (event) {
      var button = event.target.closest("[data-hu591-remove-reading]");
      if (!button) return;
      readings.splice(Number(button.dataset.hu591RemoveReading), 1);
      renderReadings();
      markDirty("scan");
    });
    $("[data-hu591-observations]").addEventListener("input", function () { markDirty("field"); });

    form.addEventListener("submit", function (event) {
      var validation = validateDraft();
      if (validation) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showInline(validation.message, validation.field);
        return;
      }
      var record = collectRecord();
      form.dataset.detail = "HU591 pallet " + record.sscc + " | " + record.references.length + " referencias | " + record.boxes + " cajas";
      saveRecord(record);
      if (window.SialMobileUI && typeof window.SialMobileUI.showToast === "function") {
        window.SialMobileUI.showToast({
          type: "success",
          title: "Pallet listo",
          message: "El SSCC " + record.sscc + " queda disponible para cargue."
        });
      }
    }, true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wireForm);
  else wireForm();
})();
