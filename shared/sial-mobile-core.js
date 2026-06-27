(function () {
  const storageThemeKey = "sial-mobile-theme";
  const contextStorageKey = "sial-mobile-context";
  const companyStorageKey = "sial-mobile-company";
  const root = document.documentElement;
  const motionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  const dialogExitDelay = 220;
  let activeLogoIntroPromise = null;
  let logoIntroQueued = false;
  let hasPendingUnsavedChanges = false;
  let pendingNavigationTarget = "";
  let edgeGesture = null;
  let suppressNextEdgeClick = false;
  const drawerEdgeStartWidth = 40;
  const drawerGestureOpenThreshold = 64;
  const drawerGestureVerticalCancel = 42;

  function prefersReducedMotion() {
    return Boolean(motionQuery && motionQuery.matches);
  }

  function replayMotionState(element, stateClass, duration = 520) {
    const node = resolveElement(element);
    if (!node || !stateClass || prefersReducedMotion()) return;
    node.classList.remove(stateClass);
    window.requestAnimationFrame(() => {
      node.classList.add(stateClass);
    });
    window.setTimeout(() => {
      node.classList.remove(stateClass);
    }, duration);
  }

  function shouldTrackUnsavedChanges() {
    return Boolean(document.querySelector("[data-flow-form]"));
  }

  function markUnsavedChanges(reason = "") {
    if (!shouldTrackUnsavedChanges()) return;
    hasPendingUnsavedChanges = true;
    root.dataset.unsavedChanges = "true";
    if (reason && document.body) document.body.dataset.unsavedReason = reason;
  }

  function clearUnsavedChanges() {
    hasPendingUnsavedChanges = false;
    pendingNavigationTarget = "";
    delete root.dataset.unsavedChanges;
    if (document.body) delete document.body.dataset.unsavedReason;
  }

  function hasUnsavedChanges() {
    return Boolean(hasPendingUnsavedChanges && shouldTrackUnsavedChanges());
  }

  function showUnsavedNavigationDialog(href, options = {}) {
    if (!href) return;
    pendingNavigationTarget = href;
    document.body.classList.remove("drawer-open");
    openDialog({
      id: "unsaved-navigation",
      variant: "modal",
      title: "Cambios sin guardar",
      message: "Hay cambios en esta vista que aun no se han guardado.",
      dismissible: false,
      actions: [
        {
          label: "Permanecer",
          variant: "primary",
          onClick: function() {
            pendingNavigationTarget = "";
          }
        },
        {
          label: "Salir sin guardar",
          variant: "secondary",
          onClick: function() {
            var target = pendingNavigationTarget;
            clearUnsavedChanges();
            navigateTo(target, { ...options, force: true });
          }
        }
      ]
    });
  }

  function navigateTo(href, options = {}) {
    if (!href) return;
    if (!options.force && hasUnsavedChanges()) {
      showUnsavedNavigationDialog(href, options);
      return;
    }
    if (prefersReducedMotion()) {
      window.location.href = href;
      return;
    }
    if (document.body.classList.contains("sial-screen-exiting")) return;
    document.body.classList.remove("drawer-open");
    document.body.classList.add("sial-screen-exiting");
    window.setTimeout(() => {
      window.location.href = href;
    }, options.delay || 150);
  }

  function playLogoIntro(config = {}) {
    if (!document.body) return Promise.resolve();
    if (activeLogoIntroPromise) return activeLogoIntroPromise;

    const reduceMotion = prefersReducedMotion();
    const duration = reduceMotion ? config.reducedDuration || 980 : config.duration || 2200;
    const exitDelay = reduceMotion ? 80 : 220;
    const logoSrc = config.logoSrc || "assets/brand/isotipo-sial.svg";
    const title = config.title || "SIAL";
    const caption = config.caption || "Sistema de Informacion Agrologistico";
    const overlay = document.createElement("div");
    const lockup = document.createElement("div");
    const emblem = document.createElement("span");
    const image = document.createElement("img");
    const wordmark = document.createElement("span");
    const name = document.createElement("strong");
    const captionNode = document.createElement("span");
    const trace = document.createElement("span");

    overlay.className = "sial-logo-intro";
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-live", "polite");
    overlay.setAttribute("aria-label", config.ariaLabel || "Iniciando SIAL Movil");
    if (reduceMotion) overlay.dataset.motion = "reduced";

    lockup.className = "sial-logo-intro-lockup";
    emblem.className = "sial-logo-intro-emblem";
    image.src = logoSrc;
    image.alt = "";
    image.decoding = "async";
    image.loading = "eager";
    image.fetchPriority = "high";
    image.setAttribute("aria-hidden", "true");

    wordmark.className = "sial-logo-intro-wordmark";
    name.textContent = title;
    captionNode.textContent = caption;
    trace.className = "sial-logo-intro-trace";
    trace.setAttribute("aria-hidden", "true");

    emblem.append(image);
    wordmark.append(name, captionNode);
    lockup.append(emblem, wordmark, trace);
    overlay.append(lockup);
    document.body.append(overlay);
    document.body.classList.add("sial-logo-intro-active");

    window.requestAnimationFrame(() => {
      overlay.classList.add("is-running");
    });

    activeLogoIntroPromise = new Promise((resolve) => {
      window.setTimeout(() => {
        overlay.classList.add("is-resolving");
        window.setTimeout(() => {
          overlay.remove();
          document.body.classList.remove("sial-logo-intro-active");
          activeLogoIntroPromise = null;
          resolve();
        }, exitDelay);
      }, Math.max(0, duration));
    });

    return activeLogoIntroPromise;
  }

  function resolveBrandAssetUrl(fileName) {
    const normalizedPath = window.location.pathname.replace(/\\/g, "/");
    const isNestedLogin = /\/login\/[^/]*$/i.test(normalizedPath);
    const basePath = isNestedLogin ? "../assets/brand/" : "assets/brand/";
    return new URL(basePath + fileName, window.location.href).href;
  }

  function revealLoginAfterIntro() {
    if (root.dataset.sialIntro === "pending") {
      root.dataset.sialIntro = "revealed";
    }
    document.body?.classList.add("sial-login-intro-revealed");
  }

  function startLogoIntroIfNeeded() {
    if (!document.querySelector(".login-screen")) {
      revealLoginAfterIntro();
      return;
    }
    if (document.body.hasAttribute("data-no-logo-intro")) {
      revealLoginAfterIntro();
      return;
    }
    if (logoIntroQueued) return;
    logoIntroQueued = true;
    const config = {
      logoSrc: resolveBrandAssetUrl("isotipo-sial.svg"),
      title: "SIAL",
      caption: "Sistema de Informacion Agrologistico",
      duration: 2200,
      reducedDuration: 980
    };
    const fallbackDelay = (prefersReducedMotion() ? config.reducedDuration : config.duration) + 900;
    const fallback = window.setTimeout(revealLoginAfterIntro, fallbackDelay);
    playLogoIntro(config).finally(() => {
      window.clearTimeout(fallback);
      revealLoginAfterIntro();
    });
  }

  function shouldAnimateAnchor(anchor, event) {
    if (!anchor || event.defaultPrevented || event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (anchor.target && anchor.target !== "_self") return false;
    if (anchor.hasAttribute("download") || anchor.hasAttribute("data-no-transition")) return false;
    const rawHref = anchor.getAttribute("href") || "";
    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("javascript:")) return false;
    const nextUrl = new URL(anchor.href, window.location.href);
    const currentUrl = new URL(window.location.href);
    if (nextUrl.href === currentUrl.href) return false;
    if (nextUrl.origin !== currentUrl.origin && currentUrl.protocol !== "file:") return false;
    return true;
  }

  
﻿
  /* ============================================
     SIAL Camera Overlay (getUserMedia)
     ============================================ */
  var cameraStream = null;
  var cameraFacingMode = "environment";
  var capturedPhotos = [];

  function escapeCameraText(value) {
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

  function normalizeCaptureSteps(config, fallbackTitle) {
    var rawSteps = Array.isArray(config.steps) ? config.steps : (Array.isArray(config.sequence) ? config.sequence : []);
    return rawSteps.map(function(step, index) {
      var source = step && typeof step === "object" ? step : { title: step };
      var title = String(source.title || source.label || fallbackTitle || "Captura fotografica").replace(/\s+/g, " ").trim();
      var pointKey = String(source.pointKey || source.value || source.key || source.controlPoint || "").trim();
      var eventName = String(source.eventName || config.eventName || "").trim();
      return {
        title: title || fallbackTitle || "Captura fotografica",
        label: String(source.label || title || fallbackTitle || "Captura fotografica").replace(/\s+/g, " ").trim(),
        pointKey: pointKey || String(config.pointKey || "").trim(),
        eventName: eventName,
        index: index
      };
    }).filter(function(step) {
      return Boolean(step.title || step.pointKey);
    });
  }

  function renderCameraPreviewRow() {
    var row = document.querySelector(".sial-camera-preview-row");
    if (!row) return;
    row.hidden = capturedPhotos.length === 0;
    row.innerHTML = capturedPhotos.map(function(photo, index) {
      var label = photo.title || photo.label || "Foto " + (index + 1);
      return [
        '<div class="sial-camera-preview-thumb">',
        '<img src="' + photo.dataUrl + '" alt="' + escapeCameraText(label) + '" loading="lazy">',
        '<span>' + escapeCameraText(label) + '</span>',
        '</div>'
      ].join("");
    }).join("");
    row.scrollLeft = row.scrollWidth;
  }

  function updateCameraProgress(countEl, doneBtn, allowMultiple, isSequence, maxPhotos) {
    if (countEl) {
      if (isSequence) {
        countEl.textContent = capturedPhotos.length + " de " + maxPhotos + " foto(s)";
      } else {
        countEl.textContent = capturedPhotos.length ? capturedPhotos.length + " foto(s)" : "Sin fotos";
      }
    }
    if (doneBtn) {
      doneBtn.style.visibility = allowMultiple && !isSequence && capturedPhotos.length ? "visible" : "hidden";
      doneBtn.disabled = !(allowMultiple && !isSequence && capturedPhotos.length);
    }
  }

  function createCameraShutter() {
    var shutter = document.createElement("div");
    shutter.className = "sial-camera-shutter";
    document.body.appendChild(shutter);
    window.setTimeout(function() { shutter.remove(); }, 260);
  }

  function createPhotoPayload(dataUrl, config, source, step) {
    var title = step ? (step.title || step.label) : (config.title || config.label);
    return {
      dataUrl: dataUrl,
      timestamp: Date.now(),
      title: title || "Captura fotografica",
      label: step ? (step.label || step.title || title) : (config.label || title || "Captura fotografica"),
      eventName: step ? (step.eventName || config.eventName || "") : (config.eventName || ""),
      pointKey: step ? (step.pointKey || config.pointKey || "") : (config.pointKey || ""),
      source: source || "camera",
      sequenceIndex: step ? step.index : null
    };
  }

  function createGeneratedPhoto(config) {
    var canvas = getCameraCanvas();
    canvas.width = 960;
    canvas.height = 720;
    var ctx = canvas.getContext("2d");
    var gradient = ctx.createLinearGradient(0, 0, 960, 720);
    gradient.addColorStop(0, "#003b72");
    gradient.addColorStop(1, "#0b7f86");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 960, 720);
    ctx.fillStyle = "rgba(255,255,255,.12)";
    ctx.fillRect(60, 60, 840, 600);
    ctx.strokeStyle = "rgba(255,255,255,.5)";
    ctx.lineWidth = 8;
    ctx.strokeRect(92, 92, 776, 536);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "700 46px sans-serif";
    ctx.fillText(config.title || "Captura fotografica", 480, 312);
    ctx.font = "500 24px sans-serif";
    ctx.fillText("Evidencia de prueba", 480, 366);
    ctx.font = "400 20px sans-serif";
    ctx.fillText(new Date().toLocaleString("es-CO"), 480, 420);
    return canvas.toDataURL("image/jpeg", 0.85);
  }

  function captureCameraFrame(video, canvas) {
    createCameraShutter();
    var captureBtn = document.querySelector(".sial-camera-capture-btn");
    if (captureBtn) { captureBtn.classList.add("is-capturing"); window.setTimeout(function() { captureBtn.classList.remove("is-capturing"); }, 260); }
    if (!video || !video.videoWidth || !video.videoHeight) return "";
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.85);
  }

  function stopCameraStream() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(function(track) { track.stop(); });
      cameraStream = null;
    }
  }

  function closeCameraOverlay() {
    stopCameraStream();
    capturedPhotos = [];
    var overlay = document.querySelector(".sial-camera-overlay");
    if (overlay) overlay.remove();
    document.body.style.overflow = "";
  }

  function getCameraCanvas() {
    return document.createElement("canvas");
  }

  function buildPhotoCaptureOverlay(config) {
    config = config || {};
    var title = String(config.title || config.label || "Captura fotografica").trim() || "Captura fotografica";
    var steps = normalizeCaptureSteps(config, title);
    var isSequence = steps.length > 0;
    var allowMultiple = isSequence ? true : config.allowMultiple !== false;
    var maxPhotos = Math.max(1, Number(config.maxPhotos || (isSequence ? steps.length : (allowMultiple ? 99 : 1))));
    if (isSequence) maxPhotos = Math.min(maxPhotos, steps.length);
    var currentStepIndex = 0;
    var onPhoto = config.onPhoto || function() {};
    var onComplete = config.onComplete || function() {};
    var onCancel = config.onCancel || function() {};
    var escapeHandler = null;
    var isSettled = false;

    capturedPhotos = [];
    stopCameraStream();

    var overlay = document.createElement("div");
    overlay.className = "sial-camera-overlay";
    overlay.innerHTML = [
      '<div class="sial-camera-topline">',
      '<button class="sial-camera-icon-btn" type="button" data-camera-cancel aria-label="Cerrar camara"><svg class="sial-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>',
      '<div class="sial-camera-title-stack">',
      '<h2 class="sial-camera-title" data-camera-title>' + escapeCameraText(title) + '</h2>',
      '<span class="sial-camera-step" data-camera-step hidden></span>',
      '</div>',
      '<div class="sial-camera-btn-group">',
      '<button class="sial-camera-icon-btn" type="button" data-camera-flash aria-label="Encender linterna"><svg class="sial-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z"/></svg></button>',
      '<button class="sial-camera-icon-btn" type="button" data-camera-flip aria-label="Cambiar camara"><svg class="sial-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 3h5v5"/><path d="M21 3 14 10"/><path d="M8 21H3v-5"/><path d="m3 21 7-7"/></svg></button>',
      '</div>',
      '</div>',
      '<div class="sial-camera-viewfinder">',
      '<video autoplay playsinline muted></video>',
      '<div class="sial-camera-grid" aria-hidden="true"></div>',
      '<div class="sial-camera-corner-tl"></div><div class="sial-camera-corner-tr"></div>',
      '<div class="sial-camera-corner-bl"></div><div class="sial-camera-corner-br"></div>',
      '<div class="sial-camera-permission-denied" hidden>',
      '<strong>Permiso de camara requerido</strong>',
      '<p>Permite la camara para tomar la evidencia en vivo. En esta propuesta puedes generar una evidencia de prueba si el navegador bloquea el permiso.</p>',
      '<div class="sial-camera-fallback-actions">',
      '<button class="sial-btn sial-btn-primary" type="button" data-camera-fallback>Generar evidencia de prueba</button>',
      '</div>',
      '</div>',
      '</div>',
      '<div class="sial-camera-footer">',
      '<div class="sial-camera-preview-row" data-camera-preview-row hidden></div>',
      '<div class="sial-camera-capture-area">',
      '<span class="sial-camera-control-spacer" aria-hidden="true"></span>',
      '<button class="sial-camera-capture-btn" type="button" aria-label="Capturar foto"></button>',
      '<button class="sial-camera-secondary-action" type="button" data-camera-done>Usar</button>',
      '</div>',
      '<div class="sial-camera-empty-state" data-camera-count>Sin fotos</div>',
      '</div>'
    ].join("");

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    var video = overlay.querySelector("video");
    var canvas = getCameraCanvas();
    var permissionDenied = overlay.querySelector(".sial-camera-permission-denied");
    var countEl = overlay.querySelector("[data-camera-count]");
    var doneBtn = overlay.querySelector("[data-camera-done]");

    function currentCaptureStep() {
      return isSequence ? steps[Math.min(currentStepIndex, maxPhotos - 1)] : null;
    }

    function currentCaptureTitle() {
      var step = currentCaptureStep();
      return step ? (step.title || step.label || title) : title;
    }

    function updateCameraTitle() {
      var titleEl = overlay.querySelector("[data-camera-title]");
      var stepEl = overlay.querySelector("[data-camera-step]");
      if (titleEl) titleEl.textContent = currentCaptureTitle();
      if (!stepEl) return;
      stepEl.hidden = !isSequence;
      if (isSequence) stepEl.textContent = Math.min(currentStepIndex + 1, maxPhotos) + " de " + maxPhotos;
    }

    function hasRoom() {
      if (capturedPhotos.length < maxPhotos) return true;
      if (window.SialMobileUI && window.SialMobileUI.showToast) {
        window.SialMobileUI.showToast({ type: "warning", title: "Maximo alcanzado", message: "Se alcanzo el maximo de " + maxPhotos + " fotos." });
      }
      return false;
    }

    function finishWithPhotos() {
      if (isSettled) return;
      isSettled = true;
      var result = capturedPhotos.slice();
      if (escapeHandler) document.removeEventListener("keydown", escapeHandler);
      closeCameraOverlay();
      onComplete(result);
    }

    function addCapturedPhoto(dataUrl, source) {
      if (!dataUrl || !hasRoom()) return;
      var step = currentCaptureStep();
      var payload = createPhotoPayload(dataUrl, config, source, step);
      capturedPhotos.push(payload);
      renderCameraPreviewRow();
      updateCameraProgress(countEl, doneBtn, allowMultiple, isSequence, maxPhotos);
      if (navigator.vibrate) navigator.vibrate(10);
      if (isSequence) {
        onPhoto(payload, step, currentStepIndex, capturedPhotos.slice());
        if (capturedPhotos.length >= maxPhotos || currentStepIndex >= maxPhotos - 1) {
          window.setTimeout(finishWithPhotos, 180);
          return;
        }
        currentStepIndex += 1;
        updateCameraTitle();
        updateCameraProgress(countEl, doneBtn, allowMultiple, isSequence, maxPhotos);
        return;
      }
      if (!allowMultiple) finishWithPhotos();
    }

    function startCamera() {
      stopCameraStream();
      permissionDenied.hidden = true;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        permissionDenied.hidden = false;
        return;
      }
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      }).then(function(stream) {
        cameraStream = stream;
        video.srcObject = stream;
        video.play();
      }).catch(function() {
        permissionDenied.hidden = false;
      });
    }

    startCamera();
    updateCameraTitle();
    updateCameraProgress(countEl, doneBtn, allowMultiple, isSequence, maxPhotos);

    escapeHandler = function(event) {
      if (event.key !== "Escape") return;
      if (isSettled) return;
      isSettled = true;
      var result = capturedPhotos.slice();
      closeCameraOverlay();
      if (result.length && allowMultiple && !isSequence) onComplete(result);
      else onCancel(result);
      document.removeEventListener("keydown", escapeHandler);
    };
    document.addEventListener("keydown", escapeHandler);

    overlay.querySelector("[data-camera-flip]").addEventListener("click", function() {
      cameraFacingMode = cameraFacingMode === "environment" ? "user" : "environment";
      startCamera();
    });

    overlay.querySelector("[data-camera-flash]").addEventListener("click", function() {
      try {
        var track = cameraStream ? cameraStream.getVideoTracks()[0] : null;
        if (track && track.getCapabilities && track.getCapabilities().torch) {
          var torch = !(track.getConstraints().torch || false);
          track.applyConstraints({ advanced: [{ torch: torch }] });
        }
      } catch(e) {}
    });

    overlay.querySelector("[data-camera-cancel]").addEventListener("click", function() {
      if (isSettled) return;
      isSettled = true;
      var result = capturedPhotos.slice();
      closeCameraOverlay();
      document.removeEventListener("keydown", escapeHandler);
      if (result.length > 0 && allowMultiple && !isSequence) {
        onComplete(result);
      } else {
        onCancel(result);
      }
    });

    overlay.querySelector(".sial-camera-capture-btn").addEventListener("click", function() {
      if (!hasRoom()) return;
      if (!cameraStream) {
        permissionDenied.hidden = false;
        return;
      }
      var dataUrl = captureCameraFrame(video, canvas);
      addCapturedPhoto(dataUrl, "camera");
    });

    overlay.querySelector("[data-camera-fallback]").addEventListener("click", function() {
      addCapturedPhoto(createGeneratedPhoto({ title: currentCaptureTitle() }), "generated");
    });

    if (doneBtn) {
      doneBtn.addEventListener("click", function() {
        if (!capturedPhotos.length) return;
        document.removeEventListener("keydown", escapeHandler);
        finishWithPhotos();
      });
      doneBtn.style.visibility = "hidden";
      doneBtn.disabled = true;
    }
  }

  function buildCameraOverlay(config) {
    buildPhotoCaptureOverlay(config);
  }

﻿function preferredTheme() {
    const saved = localStorage.getItem(storageThemeKey);
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function setTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem(storageThemeKey, theme);
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.setAttribute("aria-label", theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
      button.dataset.themeState = theme;
    });
  }

  function readStoredPayload(storageKey, fallback = {}) {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || JSON.stringify(fallback));
    } catch (_) {
      return fallback;
    }
  }

  function resolveRelativeUrl(relativeUrl) {
    try {
      return new URL(relativeUrl, window.location.href).href;
    } catch (_) {
      return relativeUrl;
    }
  }

  function selectedCompany() {
    return readStoredPayload(companyStorageKey, {});
  }

  function setSelectedCompany(company) {
    if (!company || typeof company !== "object") {
      localStorage.removeItem(companyStorageKey);
      return;
    }

    const normalized = {
      id: String(company.id || "").trim() || String(company.value || "").trim(),
      name: String(company.name || company.title || "Empresa").trim(),
      subtitle: String(company.subtitle || "").trim(),
      logo: String(company.logo || company.tag || "").trim()
    };

    if (!normalized.id) {
      localStorage.removeItem(companyStorageKey);
      return;
    }

    localStorage.setItem(companyStorageKey, JSON.stringify(normalized));
  }

  function clearSelectedCompany() {
    localStorage.removeItem(companyStorageKey);
  }

  function setSelectedContext(context) {
    if (!context || typeof context !== "object") {
      localStorage.removeItem(contextStorageKey);
      return;
    }

    localStorage.setItem(contextStorageKey, JSON.stringify(context));
  }

  function clearSelectedContext() {
    localStorage.removeItem(contextStorageKey);
  }

  function ensureToastRegion() {
    let region = document.querySelector("[data-toast-region]");
    if (region) return region;
    region = document.createElement("div");
    region.className = "sial-toast-region";
    region.setAttribute("data-toast-region", "");
    region.setAttribute("aria-live", "polite");
    region.setAttribute("aria-atomic", "false");
    document.body.appendChild(region);
    return region;
  }

  function normalizeType(type) {
    return ["info", "success", "warning", "error"].includes(type) ? type : "info";
  }

  function appendFeedbackText(parent, title, message) {
    const copy = document.createElement("div");
    copy.className = "sial-feedback-copy";
    const strong = document.createElement("strong");
    strong.textContent = title || "Notificacion";
    copy.appendChild(strong);
    if (message) {
      const paragraph = document.createElement("p");
      paragraph.textContent = message;
      copy.appendChild(paragraph);
    }
    parent.appendChild(copy);
  }

  function resolveElement(target) {
    if (!target) return null;
    if (typeof target === "string") return document.querySelector(target);
    return target instanceof Element ? target : null;
  }

  function showToast(options = {}) {
    const region = ensureToastRegion();
    const type = normalizeType(options.type);
    const toast = document.createElement("div");
    toast.className = `sial-toast ${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    const icon = document.createElement("span");
    icon.className = "sial-toast-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = options.icon || "i";
    toast.appendChild(icon);
    appendFeedbackText(toast, options.title, options.message);
    region.appendChild(toast);
    window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      window.setTimeout(() => toast.remove(), 180);
    }, options.duration || 2800);
    return toast;
  }

  function setInlineStatus(target, options = {}) {
    const node = resolveElement(target);
    if (!node) return null;
    const type = normalizeType(options.type);
    node.className = `sial-status ${type}`;
    node.setAttribute("role", type === "error" ? "alert" : "status");
    node.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
    node.hidden = false;
    node.replaceChildren();
    appendFeedbackText(node, options.title, options.message || "");
    return node;
  }

  function clearInlineStatus(target) {
    const node = resolveElement(target);
    if (!node) return;
    node.hidden = true;
    node.replaceChildren();
  }

  function setFieldInvalid(field, invalid) {
    if (!field) return;
    field.setAttribute("aria-invalid", String(Boolean(invalid)));
    const frame = field.closest(".sial-input-wrap");
    if (frame) frame.classList.toggle("is-invalid", Boolean(invalid));
  }

  function validateLoginForm(form) {
    const status = form.querySelector("[data-login-status]");
    const rules = [
      {
        field: form.querySelector("input[name='usuario']"),
        title: "Usuario requerido",
        message: "Ingresa tu usuario para continuar."
      },
      {
        field: form.querySelector("input[name='contrasena']"),
        title: "Contrasena requerida",
        message: "Ingresa tu contrasena para continuar."
      }
    ];
    rules.forEach(({ field }) => setFieldInvalid(field, false));
    const invalid = rules.find(({ field }) => field && !field.value.trim());
    if (!invalid) {
      clearInlineStatus(status);
      return true;
    }
    setFieldInvalid(invalid.field, true);
    replayMotionState(invalid.field.closest(".sial-input-wrap") || invalid.field, "is-blocked-attempt", 420);
    setInlineStatus(status, {
      type: "error",
      title: invalid.title,
      message: invalid.message
    });
    invalid.field.focus();
    return false;
  }

  function ensureBannerRegion() {
    let region = document.querySelector("[data-banner-region]");
    if (region) return region;
    region = document.createElement("div");
    region.className = "sial-banner-region";
    region.setAttribute("data-banner-region", "");
    region.setAttribute("aria-live", "polite");
    document.body.appendChild(region);
    return region;
  }

  function showBanner(options = {}) {
    const region = ensureBannerRegion();
    const type = normalizeType(options.type);
    const id = options.id || "global";
    const current = region.querySelector(`[data-banner-id="${id}"]`);
    if (current) current.remove();

    const banner = document.createElement("div");
    banner.className = `sial-banner ${type}`;
    banner.dataset.bannerId = id;
    banner.setAttribute("role", type === "error" ? "alert" : "status");

    const icon = document.createElement("span");
    icon.className = "sial-banner-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = options.icon || "i";
    banner.appendChild(icon);
    appendFeedbackText(banner, options.title, options.message);

    if (options.dismissible !== false) {
      const close = document.createElement("button");
      close.className = "sial-banner-close";
      close.type = "button";
      close.dataset.bannerDismiss = id;
      close.setAttribute("aria-label", "Cerrar alerta");
      close.textContent = "x";
      banner.appendChild(close);
    }

    region.appendChild(banner);
    return banner;
  }

  function hideBanner(id = "global") {
    document.querySelectorAll(`[data-banner-id="${id}"]`).forEach((banner) => banner.remove());
  }

  function syncDialogOpenState() {
    if (!document.querySelector(".sial-modal-backdrop")) {
      document.body.classList.remove("dialog-open");
    }
  }

  function closeDialog(id, options = {}) {
    const selector = id ? `[data-dialog-id="${id}"]` : ".sial-modal-backdrop:last-of-type";
    const dialog = document.querySelector(selector);
    if (!dialog) {
      syncDialogOpenState();
      return;
    }

    const shouldAnimate = !options.immediate
      && dialog.dataset.dialogId === "access-recovery"
      && !prefersReducedMotion();

    if (!shouldAnimate) {
      dialog.remove();
      syncDialogOpenState();
      return;
    }

    if (dialog.classList.contains("is-closing")) return;
    if (dialog.contains(document.activeElement) && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    dialog.classList.add("is-closing");
    dialog.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      dialog.remove();
      syncDialogOpenState();
    }, options.delay || dialogExitDelay);
  }

  function openDialog(options = {}) {
    const id = options.id || `dialog-${Date.now()}`;
    closeDialog(id, { immediate: true });

    const backdrop = document.createElement("div");
    backdrop.className = "sial-modal-backdrop";
    backdrop.dataset.dialogId = id;

    const panel = document.createElement("section");
    panel.className = options.variant === "sheet" ? "sial-bottom-sheet" : "sial-modal";
    panel.setAttribute("role", options.role || "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.tabIndex = -1;

    const header = document.createElement("header");
    header.className = "sial-dialog-header";
    const title = document.createElement("h2");
    title.textContent = options.title || "Confirmar accion";
    header.appendChild(title);
    if (options.dismissible !== false) {
      const close = document.createElement("button");
      close.className = "sial-btn sial-btn-icon";
      close.type = "button";
      close.dataset.dialogClose = id;
      close.setAttribute("aria-label", "Cerrar dialogo");
      close.textContent = "x";
      header.appendChild(close);
    }
    panel.appendChild(header);

    if (options.message) {
      const message = document.createElement("p");
      message.className = "sial-dialog-copy";
      message.textContent = options.message;
      panel.appendChild(message);
    }

    if (options.content) {
      const contentNode = typeof options.content === "function" ? options.content({ id, closeDialog }) : options.content;
      if (contentNode instanceof Node) {
        const body = document.createElement("div");
        body.className = "sial-dialog-body";
        body.appendChild(contentNode);
        panel.appendChild(body);
      }
    }

    const actions = Array.isArray(options.actions)
      ? options.actions
      : [{ label: "Entendido", variant: "primary" }];
    if (actions.length) {
      const footer = document.createElement("footer");
      footer.className = "sial-dialog-actions";
      actions.forEach((action) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `sial-btn ${action.variant === "secondary" ? "sial-btn-secondary" : "sial-btn-primary"}`;
        button.textContent = action.label;
        button.addEventListener("click", () => {
          if (typeof action.onClick === "function") action.onClick();
          if (action.close !== false) closeDialog(id);
        });
        footer.appendChild(button);
      });
      panel.appendChild(footer);
    }
    backdrop.appendChild(panel);
    document.body.appendChild(backdrop);
    document.body.classList.add("dialog-open");
    panel.focus({ preventScroll: true });
    return backdrop;
  }

  function normalizePickerItem(item) {
    if (typeof item === "string") return { label: item, value: item };
    return {
      label: item.label || item.value || "Opcion",
      value: item.value || item.label || "",
      helper: item.helper || ""
    };
  }

  function openMobilePicker(options = {}) {
    const id = options.id || `picker-${Date.now()}`;
    const target = resolveElement(options.target);
    const items = (options.items || []).map(normalizePickerItem);
    const selectedValue = options.selectedValue || target?.value || "";
    const content = document.createElement("div");
    content.className = "sial-picker";

    let searchField = null;
    if (options.search !== false && items.length > 6) {
      const searchWrap = document.createElement("label");
      searchWrap.className = "sial-field";
      const searchLabel = document.createElement("span");
      searchLabel.className = "sial-label";
      searchLabel.textContent = options.searchLabel || "Buscar opcion";
      searchField = document.createElement("input");
      searchField.className = "sial-picker-search";
      searchField.type = "search";
      searchField.inputMode = "search";
      searchField.enterKeyHint = "search";
      searchField.autocomplete = "off";
      searchField.autocapitalize = "none";
      searchField.spellcheck = false;
      searchField.placeholder = options.searchPlaceholder || "Escribe para filtrar";
      searchWrap.append(searchLabel, searchField);
      content.appendChild(searchWrap);
    }

    const list = document.createElement("div");
    list.className = "sial-picker-list";
    list.setAttribute("role", "listbox");

    const renderItems = (filter = "") => {
      list.replaceChildren();
      const normalizedFilter = filter.trim().toLowerCase();
      const visibleItems = items.filter((item) => {
        const haystack = `${item.label} ${item.helper}`.toLowerCase();
        return !normalizedFilter || haystack.includes(normalizedFilter);
      });

      if (!visibleItems.length) {
        const empty = document.createElement("div");
        empty.className = "sial-picker-empty";
        empty.textContent = options.emptyText || "No hay opciones disponibles";
        list.appendChild(empty);
        return;
      }

      visibleItems.forEach((item) => {
        const button = document.createElement("button");
        button.className = "sial-picker-option";
        button.type = "button";
        button.setAttribute("role", "option");
        button.setAttribute("aria-selected", String(item.value === selectedValue));
        button.dataset.pickerValue = item.value;
        const label = document.createElement("strong");
        label.textContent = item.label;
        button.appendChild(label);
        if (item.helper) {
          const helper = document.createElement("span");
          helper.textContent = item.helper;
          button.appendChild(helper);
        }
        button.addEventListener("click", () => {
          if (target) {
            target.value = item.value;
            target.dispatchEvent(new Event("change", { bubbles: true }));
          }
          if (typeof options.onSelect === "function") options.onSelect(item);
          closeDialog(id);
        });
        list.appendChild(button);
      });
    };

    if (searchField) {
      searchField.addEventListener("input", () => renderItems(searchField.value));
    }

    renderItems();
    content.appendChild(list);

    return openDialog({
      id,
      variant: "sheet",
      title: options.title || "Seleccionar opcion",
      message: options.message || "",
      content,
      actions: []
    });
  }

  function selectedContext() {
    return readStoredPayload(contextStorageKey, {});
  }

  function hydrateCompanyContext() {
    const company = selectedCompany();
    if (!company.name) return;

    document.querySelectorAll("[data-company-name]:not([data-company-option])").forEach((node) => {
      node.textContent = company.name;
    });
    document.querySelectorAll("[data-company-subtitle]:not([data-company-option])").forEach((node) => {
      node.textContent = company.subtitle || "Empresa";
    });
    document.querySelectorAll("[data-company-logo]:not([data-company-option])").forEach((node) => {
      node.textContent = company.logo || "--";
    });
  }

  function hydrateContext() {
    const context = selectedContext();
    if (!context.name) return;
    document.querySelectorAll("[data-context-name]").forEach((node) => {
      node.textContent = context.name;
    });
    document.querySelectorAll("[data-context-subtitle]").forEach((node) => {
      node.textContent = context.subtitle || "Contexto operativo";
    });
    document.querySelectorAll("[data-context-logo]").forEach((node) => {
      node.textContent = context.logo || "SI";
    });
  }

  function hydrateSelectionCards() {
    const renderCompanyCard = (card) => {
      const infoNode = card.querySelector(".sial-finca-info") || (() => {
        const created = document.createElement("span");
        created.className = "sial-finca-info";
        card.appendChild(created);
        return created;
      })();
      const titleNode = infoNode.querySelector("strong") || (() => {
        const created = document.createElement("strong");
        const reference = infoNode.querySelector("span.sial-finca-meta");
        if (reference) {
          infoNode.insertBefore(created, reference);
        } else {
          infoNode.appendChild(created);
        }
        return created;
      })();
      const existingSubtitleNode = infoNode.querySelector(".sial-finca-meta") ? infoNode.querySelector(".sial-finca-meta").previousElementSibling : null;
      const subtitleNode = existingSubtitleNode && existingSubtitleNode.tagName === "SPAN" && !existingSubtitleNode.classList.contains("sial-finca-meta")
        ? existingSubtitleNode
        : (() => {
            const created = document.createElement("span");
            if (infoNode.querySelector(".sial-finca-meta")) {
              infoNode.insertBefore(created, infoNode.querySelector(".sial-finca-meta"));
            } else {
              infoNode.appendChild(created);
            }
            return created;
          })();
      const logoNode = card.querySelector(".sial-logo-box") || (() => {
        const created = document.createElement("span");
        created.className = "sial-logo-box";
        card.insertBefore(created, infoNode);
        return created;
      })();
      const rawName = card.dataset.companyName || card.dataset.companyItemName;
      const rawSubtitle = card.dataset.companySubtitle || card.dataset.companyItemSubtitle;
      const rawLogo = card.dataset.companyLogo || card.dataset.companyItemLogo;

      if (titleNode) {
        titleNode.textContent = rawName || titleNode.textContent || "Empresa";
      }
      if (subtitleNode) {
        subtitleNode.textContent = rawSubtitle || subtitleNode.textContent || "";
      }
      if (logoNode) {
        logoNode.textContent = rawLogo || logoNode.textContent || "--";
      }
    };

    const renderFincaCard = (card) => {
      const infoNode = card.querySelector(".sial-finca-info") || (() => {
        const created = document.createElement("span");
        created.className = "sial-finca-info";
        card.appendChild(created);
        return created;
      })();
      const titleNode = infoNode.querySelector("strong") || (() => {
        const created = document.createElement("strong");
        const reference = infoNode.querySelector("span.sial-finca-meta");
        if (reference) {
          infoNode.insertBefore(created, reference);
        } else {
          infoNode.appendChild(created);
        }
        return created;
      })();
      const existingSubtitleNode = infoNode.querySelector(".sial-finca-meta") ? infoNode.querySelector(".sial-finca-meta").previousElementSibling : null;
      const subtitleNode = existingSubtitleNode && existingSubtitleNode.tagName === "SPAN" && !existingSubtitleNode.classList.contains("sial-finca-meta")
        ? existingSubtitleNode
        : (() => {
            const created = document.createElement("span");
            if (infoNode.querySelector(".sial-finca-meta")) {
              infoNode.insertBefore(created, infoNode.querySelector(".sial-finca-meta"));
            } else {
              infoNode.appendChild(created);
            }
            return created;
          })();
      const logoNode = card.querySelector(".sial-logo-box") || (() => {
        const created = document.createElement("span");
        created.className = "sial-logo-box";
        card.insertBefore(created, infoNode);
        return created;
      })();

      if (titleNode) {
        titleNode.textContent = card.dataset.fincaName || titleNode.textContent || "Contexto operativo";
      }
      if (subtitleNode) {
        subtitleNode.textContent = card.dataset.fincaSubtitle || subtitleNode.textContent || "";
      }
      if (logoNode) {
        logoNode.textContent = card.dataset.fincaLogo || logoNode.textContent || "--";
      }
    };

    document.querySelectorAll("[data-company-option]").forEach(renderCompanyCard);
    document.querySelectorAll("[data-finca-option]").forEach(renderFincaCard);
  }

  function resetSelectionSearchInputs() {
    document.querySelectorAll("[data-company-search],[data-finca-search]").forEach((input) => {
      if (!input) return;
      input.value = "";
    });
  }

  function refreshSelectionViews() {
    resetSelectionSearchInputs();
    hydrateSelectionCards();
    syncCompanySelectionFromContext();
    updateFincaSelectionScope();
    updateCompanySelectionScope();
  }

  function updateFincaSelectionScope() {
    const fincaCards = Array.from(document.querySelectorAll("[data-finca-option]"));
    if (!fincaCards.length) return;

    const company = selectedCompany();
    const currentCompanyId = company.id || "";
    const searchTerm = (document.querySelector("[data-finca-search]")?.value || "").trim().toLowerCase();
    let visibleCount = 0;

    fincaCards.forEach((finca) => {
      const companyId = finca.dataset.companyId || "";
      const fincaName = (finca.dataset.fincaName || "").toLowerCase();
      const fincaSubtitle = (finca.dataset.fincaSubtitle || "").toLowerCase();
      const matchesCompany = !currentCompanyId || !companyId || companyId === currentCompanyId;
      const matchesSearch = !searchTerm || fincaName.includes(searchTerm) || fincaSubtitle.includes(searchTerm);
      const isVisible = matchesCompany && matchesSearch;
      finca.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    const noCompanySelected = !currentCompanyId;
    const selectedCompanyName = company.name || "Sin empresa";

    document.querySelectorAll("[data-company-name-display]").forEach((node) => {
      node.textContent = noCompanySelected ? "Sin empresa" : selectedCompanyName;
    });
    document.querySelectorAll("[data-company-summary]").forEach((node) => {
      node.textContent = noCompanySelected
        ? "Primero selecciona una empresa para continuar."
        : `Fincas disponibles para ${selectedCompanyName}.`;
    });

    const emptyNode = document.querySelector("[data-finca-empty-state]");
    if (!emptyNode) return;

    if (visibleCount > 0 || noCompanySelected) {
      emptyNode.hidden = true;
      return;
    }

    const message = emptyNode.querySelector("[data-finca-empty-message]");
    if (message) {
      message.textContent = "No se encontraron fincas para esta empresa.";
    }
    emptyNode.hidden = false;
  }

  function updateCompanySelectionScope() {
    const companyCards = Array.from(document.querySelectorAll("[data-company-option]"));
    if (!companyCards.length) return;

    const searchTerm = (document.querySelector("[data-company-search]")?.value || "").trim().toLowerCase();
    let visibleCount = 0;

    companyCards.forEach((company) => {
      const companyName = (company.dataset.companyName || company.dataset.companyItemName || "").toLowerCase();
      const companySubtitle = (company.dataset.companySubtitle || company.dataset.companyItemSubtitle || "").toLowerCase();
      const visible = !searchTerm || companyName.includes(searchTerm) || companySubtitle.includes(searchTerm);
      company.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    const emptyNode = document.querySelector("[data-company-empty-state]");
    if (!emptyNode) return;
    emptyNode.hidden = visibleCount > 0;
  }

  function syncCompanySelectionFromContext() {
    const company = selectedCompany();
    const selectedId = company.id || "";
    if (!selectedId) return;
    document.querySelectorAll("[data-company-option]").forEach((option) => {
      option.setAttribute("aria-pressed", String(option.dataset.companyId === selectedId));
    });
  }

  function requireCompanyBeforeFinca() {
    const isFincaSelection = /[\\/]app[\\/]seleccion-finca\\.html$/i.test(window.location.pathname);
    if (!isFincaSelection) return false;

    const company = selectedCompany();
    if (!company.id) {
      showToast({
        type: "warning",
        title: "Empresa requerida",
        message: "Selecciona primero una empresa para filtrar las fincas."
      });
      window.setTimeout(() => {
        navigateTo(resolveRelativeUrl("seleccion-empresa.html"));
      }, 320);
      return true;
    }

    return false;
  }

  function drawerIcon(path) {
    return '<svg class="sial-icon" viewBox="0 0 24 24" aria-hidden="true">' + path + '</svg>';
  }

  const drawerMenuGroups = [
    {
      label: "ZE Puerto / Control de contenedores",
      aria: "Navegacion ZE Puerto",
      items: [
        { href: "../puerto-ze/index.html", label: "Dashboard ZE Puerto", icon: drawerIcon('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>') },
        { href: "../puerto-ze/recepcion-ze.html", label: "HU758 - Recepcion vehiculo ZE", icon: drawerIcon('<path d="M3 17h18"/><path d="M6 17V7h12v10"/><path d="M8 11h8"/>') },
        { href: "../puerto-ze/inspeccion-externa.html", label: "HU557 - Inspeccion externa ZE", icon: drawerIcon('<path d="M3 7h18"/><path d="M5 7v10h14V7"/><path d="M8 11h8"/><path d="M8 14h5"/>') },
        { href: "../puerto-ze/inspeccion-interna.html", label: "HU558 - Inspeccion interna ZE", icon: drawerIcon('<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 9h8"/><path d="M8 13h8"/>') },
        { href: "../puerto-ze/despacho-finca.html", label: "HU303 - Despacho a finca", icon: drawerIcon('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>') }
      ]
    },
    {
      label: "Retorno ZE / Puerto",
      aria: "Navegacion ciclo retorno",
      items: [
        { href: "../puerto-ze/recepcion-ze-retorno.html", label: "Recepcion ZE retorno", icon: drawerIcon('<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>') },
        { href: "../puerto-ze/despacho-puerto.html", label: "Despacho puerto", icon: drawerIcon('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/><path d="M4 18h16"/>') },
        { href: "../puerto-ze/recepcion-puerto.html", label: "Recepcion puerto", icon: drawerIcon('<path d="M4 8h16"/><path d="M6 8v9h12V8"/><path d="M8 17h8"/>') },
        { href: "../puerto-ze/entrega-puerto.html", label: "Entrega en puerto", icon: drawerIcon('<path d="M4 7h16v10H4z"/><path d="M7 20h10"/><path d="M9 17v3"/><path d="M15 17v3"/>') }
      ]
    },
    {
      label: "Finca",
      aria: "Navegacion finca",
      items: [
        { href: "../finca/recepcion-finca.html", label: "Recepcion en finca", icon: drawerIcon('<path d="M4 17 10 7l4 6 2-3 4 7Z"/><path d="M3 20h18"/>') },
        { href: "../finca/inspeccion-externa.html", label: "Inspeccion externa", icon: drawerIcon('<path d="M3 7h18"/><path d="M5 7v10h14V7"/><path d="M8 11h8"/>') },
        { href: "../finca/inspeccion-interna.html", label: "Inspeccion interna", icon: drawerIcon('<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 9h8"/><path d="M8 13h8"/>') },
        { href: "../finca/sesion-responsabilidad.html", label: "Sesion responsabilidad", icon: drawerIcon('<path d="M6 20V4h12v16"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/>') },
        { href: "../finca/cierre-contenedor.html", label: "Cierre de contenedor", icon: drawerIcon('<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>') },
        { href: "../finca/despacho-ze.html", label: "Despacho a ZE", icon: drawerIcon('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>') }
      ]
    },
    {
      label: "Pallets",
      aria: "Navegacion pallets",
      items: [
        { href: "../pallets/armar-pallet.html", label: "Armar pallet", icon: drawerIcon('<path d="M4 7h16v10H4z"/><path d="M8 7V5h8v2"/><path d="M8 17v2"/><path d="M16 17v2"/>') },
        { href: "../pallets/armar-pallet.html", label: "Registrar cajas", icon: drawerIcon('<path d="M5 7h14"/><path d="M5 12h14"/><path d="M5 17h14"/>') },
        { href: "../pallets/cargar-pallets.html", label: "Cargar pallets", icon: drawerIcon('<path d="M12 5v14"/><path d="M5 12h14"/>') }
      ]
    },
    {
      label: "Trazabilidad",
      aria: "Navegacion trazabilidad",
      items: [
        { href: "../trazabilidad/consultar-contenedor.html", label: "Consultar contenedor", icon: drawerIcon('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>') },
        { href: "../trazabilidad/consultar-operacion.html", label: "Consultar operacion", icon: drawerIcon('<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h10"/>') }
      ]
    }
  ];

  function shouldMountGlobalDrawer() {
    const path = window.location.pathname.replace(/\\/g, "/").toLowerCase();
    if (!document.querySelector(".sial-page")) return false;
    if (document.querySelector(".login-screen, .library-shell")) return false;
    if (path.includes("/login/") || path.includes("/libreria/")) return false;
    if (path.endsWith("/index.html") && !path.includes("/app/") && !path.includes("/puerto-ze/")) return false;
    if (path.includes("/app/seleccion-empresa.html") || path.includes("/app/seleccion-finca.html")) return false;
    if (path.includes("/demo-camara.html")) return false;
    return true;
  }

  function linkMatchesCurrentPage(href) {
    try {
      const target = new URL(href, window.location.href);
      const current = new URL(window.location.href);
      return target.pathname.replace(/\/+$/, "") === current.pathname.replace(/\/+$/, "");
    } catch (_) {
      return false;
    }
  }

  function renderDrawerMenuGroups() {
    return drawerMenuGroups.map((group) => [
      '<nav class="sial-menu-group" aria-label="' + group.aria + '">',
      '<p class="sial-menu-label">' + group.label + '</p>',
      group.items.map((item) => {
        const href = resolveRelativeUrl(item.href);
        const active = linkMatchesCurrentPage(href) ? " active" : "";
        return '<a class="sial-menu-link' + active + '" href="' + href + '">' + item.icon + item.label + '</a>';
      }).join(""),
      "</nav>"
    ].join("")).join("");
  }

  function ensureGlobalDrawer() {
    if (!shouldMountGlobalDrawer()) return;
    if (document.querySelector(".sial-drawer")) return;
    const brandSrc = resolveRelativeUrl("../assets/brand/isotipo-sial.svg");
    const backdrop = document.createElement("div");
    backdrop.className = "sial-drawer-backdrop";
    backdrop.dataset.drawerClose = "";
    const drawer = document.createElement("aside");
    drawer.className = "sial-drawer";
    drawer.setAttribute("aria-label", "Menu principal");
    drawer.innerHTML = [
      '<header class="sial-drawer-head">',
      '<div class="sial-drawer-user">',
      '<span class="sial-app-isotype" aria-hidden="true"><img src="' + brandSrc + '" alt=""></span>',
      '<div class="sial-context-text"><strong data-context-name>Finca Santa Isabel</strong><span>operador.sial</span></div>',
      '</div>',
      '<button class="sial-btn sial-btn-icon" type="button" data-drawer-close aria-label="Cerrar menu">',
      drawerIcon('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
      '</button>',
      '</header>',
      '<div class="sial-drawer-content">',
      renderDrawerMenuGroups(),
      '</div>',
      '<a class="sial-btn sial-btn-secondary sial-btn-full" href="' + resolveRelativeUrl("../app/seleccion-empresa.html") + '">Cambiar finca</a>'
    ].join("");
    document.body.append(backdrop, drawer);
    hydrateContext();
  }

  function openDrawer() {
    if (!document.querySelector(".sial-drawer")) ensureGlobalDrawer();
    if (!document.querySelector(".sial-drawer")) return;
    document.body.classList.add("drawer-open");
  }

  function closeDrawer() {
    document.body.classList.remove("drawer-open");
    document.body.classList.remove("sial-edge-swipe-active");
  }

  function activeBlockingOverlay() {
    return Boolean(document.querySelector(".sial-modal-backdrop, .sial-camera-overlay, .sial-photo-viewer, .sial-logo-intro"));
  }

  function suppressCommittedGestureClick() {
    suppressNextEdgeClick = true;
    window.setTimeout(() => {
      suppressNextEdgeClick = false;
    }, 420);
  }

  function gestureShouldIgnoreTarget(target, options = {}) {
    if (!target) return false;
    if (document.body.classList.contains("drawer-open")) {
      return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
    }
    if (options.fromEdge) {
      return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
    }
    if (target.closest("input, textarea, select, button, a, [contenteditable='true']")) return true;
    if (document.activeElement && document.activeElement.matches("input, textarea, select, [contenteditable='true']")) return true;
    return false;
  }

  function startDrawerGesture(event) {
    if (!shouldMountGlobalDrawer()) return;
    if (event.pointerType && !["touch", "pen", "mouse"].includes(event.pointerType)) return;
    if (activeBlockingOverlay()) return;
    const drawerOpen = document.body.classList.contains("drawer-open");
    const startsAtEdge = event.clientX <= drawerEdgeStartWidth;
    if (!drawerOpen && !startsAtEdge) return;
    if (gestureShouldIgnoreTarget(event.target, { fromEdge: startsAtEdge })) return;
    edgeGesture = {
      mode: drawerOpen ? "close" : "open",
      startX: event.clientX,
      startY: event.clientY,
      active: true,
      committed: false
    };
  }

  function moveDrawerGesture(event) {
    if (!edgeGesture || !edgeGesture.active) return;
    const dx = event.clientX - edgeGesture.startX;
    const dy = event.clientY - edgeGesture.startY;
    if (Math.abs(dy) > drawerGestureVerticalCancel && Math.abs(dy) > Math.abs(dx)) {
      document.body.classList.remove("sial-edge-swipe-active");
      edgeGesture = null;
      return;
    }
    if (Math.abs(dx) > 16 && Math.abs(dx) > Math.abs(dy)) {
      event.preventDefault();
      document.body.classList.add("sial-edge-swipe-active");
    }
    if (edgeGesture.mode === "open" && dx >= drawerGestureOpenThreshold) {
      edgeGesture.committed = true;
      openDrawer();
      suppressCommittedGestureClick();
      document.body.classList.remove("sial-edge-swipe-active");
      edgeGesture = null;
    }
    if (edgeGesture && edgeGesture.mode === "close" && dx <= -drawerGestureOpenThreshold) {
      edgeGesture.committed = true;
      closeDrawer();
      suppressCommittedGestureClick();
      edgeGesture = null;
    }
  }

  function endDrawerGesture() {
    document.body.classList.remove("sial-edge-swipe-active");
    edgeGesture = null;
  }

  setTheme(preferredTheme());
  hydrateContext();
  hydrateCompanyContext();
  refreshSelectionViews();
  ensureGlobalDrawer();

  window.SialMobileUI = Object.assign(window.SialMobileUI || {}, {
    openPhotoCapture: function(config) { buildPhotoCaptureOverlay(config); },
    openCamera: function(config) { buildCameraOverlay(config); },
    setTheme,
    showToast,
    setInlineStatus,
    clearInlineStatus,
    showBanner,
    hideBanner,
    playLogoIntro,
    openDialog,
    openMobilePicker,
    closeDialog,
    replayMotionState,
    navigateTo,
    markUnsavedChanges,
    clearUnsavedChanges,
    hasUnsavedChanges,
    openDrawer,
    closeDrawer,
    ensureGlobalDrawer,
    selectedContext,
    setSelectedContext,
    selectedCompany,
    setSelectedCompany,
    clearSelectedCompany,
    clearSelectedContext
  });

  startLogoIntroIfNeeded();

  document.addEventListener("click", (event) => {
    if (!suppressNextEdgeClick) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    suppressNextEdgeClick = false;
  }, true);

  document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a[href]");
    if (!shouldAnimateAnchor(anchor, event)) return;
    event.preventDefault();
    navigateTo(anchor.href);
  });

  document.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-theme-toggle]");
    if (!toggle) return;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    setTheme(next);
  });

  document.addEventListener("click", (event) => {
    const passwordButton = event.target.closest("[data-password-toggle]");
    if (!passwordButton) return;
    const field = document.querySelector(passwordButton.dataset.passwordToggle);
    if (!field) return;
    const show = field.type === "password";
    field.type = show ? "text" : "password";
    passwordButton.setAttribute("aria-label", show ? "Ocultar contrasena" : "Mostrar contrasena");
    passwordButton.dataset.visible = String(show);
  });

  document.addEventListener("click", (event) => {
    const open = event.target.closest("[data-drawer-open]");
    if (open) {
      openDrawer();
      return;
    }
    const close = event.target.closest("[data-drawer-close]");
    if (close) {
      closeDrawer();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDrawer();
      closeDialog();
    }
  });

  document.addEventListener("click", (event) => {
    const bannerDismiss = event.target.closest("[data-banner-dismiss]");
    if (bannerDismiss) {
      hideBanner(bannerDismiss.dataset.bannerDismiss);
      return;
    }
    const dialogClose = event.target.closest("[data-dialog-close]");
    if (dialogClose) {
      closeDialog(dialogClose.dataset.dialogClose);
    }
  });

  document.addEventListener("input", (event) => {
    const flowField = event.target.closest("[data-flow-form] input, [data-flow-form] select, [data-flow-form] textarea");
    if (flowField && !flowField.matches("[type='hidden'], [data-unsaved-ignore]")) {
      markUnsavedChanges("field");
    }

    const fincaSearch = event.target.closest("[data-finca-search]");
    if (fincaSearch) {
      updateFincaSelectionScope();
      return;
    }

    const companySearch = event.target.closest("[data-company-search]");
    if (companySearch) {
      updateCompanySelectionScope();
      return;
    }

    const field = event.target.closest("[data-login-form] input");
    if (!field) return;
    setFieldInvalid(field, false);
    const form = field.closest("[data-login-form]");
    const hasPendingRequired = Array.from(form.querySelectorAll("input[required]")).some((input) => !input.value.trim());
    if (!hasPendingRequired) clearInlineStatus(form.querySelector("[data-login-status]"));
  });

  document.addEventListener("change", (event) => {
    const flowField = event.target.closest("[data-flow-form] input, [data-flow-form] select, [data-flow-form] textarea");
    if (flowField && !flowField.matches("[type='hidden'], [data-unsaved-ignore]")) {
      markUnsavedChanges("field");
    }
  });

  document.addEventListener("pointerdown", startDrawerGesture, { passive: true });
  document.addEventListener("pointermove", moveDrawerGesture, { passive: false });
  document.addEventListener("pointerup", endDrawerGesture, { passive: true });
  document.addEventListener("pointercancel", endDrawerGesture, { passive: true });

  window.addEventListener("beforeunload", (event) => {
    if (!hasUnsavedChanges()) return;
    event.preventDefault();
    event.returnValue = "";
  });

  window.addEventListener("pageshow", () => {
    refreshSelectionViews();
  });

  document.addEventListener("click", (event) => {
    const company = event.target.closest("[data-company-option]");
    if (company) {
      if (company.disabled || company.getAttribute("aria-disabled") === "true") {
        replayMotionState(company, "is-blocked-attempt", 420);
        showToast({
          type: "error",
          title: "Empresa no disponible",
          message: "Selecciona una empresa activa para continuar."
        });
        return;
      }

      document.querySelectorAll("[data-company-option]").forEach((option) => {
        option.setAttribute("aria-pressed", String(option === company));
        option.classList.remove("is-continuing");
      });
      company.classList.add("is-continuing");

      setSelectedCompany({
        id: company.dataset.companyId,
        name: company.dataset.companyName || company.dataset.companyItemName || company.dataset.companyTitle || "Empresa",
        subtitle: company.dataset.companySubtitle || company.dataset.companyItemSubtitle || "Operacion movil",
        logo: company.dataset.companyLogo || company.dataset.companyItemLogo || ""
      });
      clearSelectedContext();

      showToast({
        type: "success",
        icon: "ok",
        title: "Empresa seleccionada",
        message: company.dataset.companyName || company.dataset.companyItemName || "Empresa activa.",
        duration: 1100
      });

      const next = company.dataset.next || resolveRelativeUrl("seleccion-finca.html");
      window.setTimeout(() => {
        company.classList.remove("is-continuing");
        if (next) navigateTo(next);
      }, 700);
      return;
    }

    const finca = event.target.closest("[data-finca-option]");
    if (!finca) return;
    if (requireCompanyBeforeFinca()) return;
    if (finca.disabled || finca.getAttribute("aria-disabled") === "true") {
      replayMotionState(finca, "is-blocked-attempt", 420);
      showToast({
        type: "error",
        title: "Finca no disponible",
        message: "Selecciona una finca activa para continuar."
      });
      return;
    }

    const selectedCompanyData = selectedCompany();
    const companyId = String(selectedCompanyData.id || "");
    const nextCompanyId = String(finca.dataset.companyId || "");
    if (companyId && nextCompanyId && companyId !== nextCompanyId) {
      showToast({
        type: "error",
        title: "Finca fuera de contexto",
        message: "La finca pertenece a otra empresa. Selecciona la empresa correcta."
      });
      window.setTimeout(() => {
        navigateTo(resolveRelativeUrl("seleccion-empresa.html"));
      }, 260);
      return;
    }

    document.querySelectorAll("[data-finca-option]").forEach((option) => {
      option.setAttribute("aria-pressed", String(option === finca));
      option.classList.remove("is-continuing");
    });
    finca.classList.add("is-continuing");

    const next = finca.dataset.next;
    setSelectedContext({
      id: finca.dataset.fincaId || finca.dataset.fincaValue || "",
      name: finca.dataset.fincaName || finca.dataset.contextName || "Contexto operativo",
      subtitle: finca.dataset.fincaSubtitle || "Operacion movil",
      logo: finca.dataset.fincaLogo || "SI",
      companyId: selectedCompanyData.id || "",
      companyName: selectedCompanyData.name || ""
    });
    showToast({
      type: "success",
      icon: "ok",
      title: "Finca seleccionada",
      message: finca.dataset.fincaName || "Contexto operativo activo.",
      duration: 1200
    });
    if (next) {
      window.setTimeout(() => {
        navigateTo(next);
      }, 700);
    } else {
      window.setTimeout(() => finca.classList.remove("is-continuing"), 900);
    }
  });

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-login-form]");
    if (!form) return;
    event.preventDefault();

    if (!validateLoginForm(form)) return;

    const submit = form.querySelector("[type='submit']");
    form.classList.add("is-submitting");
    if (submit) {
      submit.disabled = true;
      submit.classList.add("is-loading");
      submit.dataset.originalText = submit.textContent;
      submit.textContent = "Validando acceso...";
    }
    showToast({
      type: "info",
      title: "Validando credenciales",
      message: "Preparando seleccion de finca.",
      duration: 1400
    });

    window.setTimeout(() => {
      if (submit) {
        submit.disabled = false;
        submit.classList.remove("is-loading");
        submit.textContent = submit.dataset.originalText || "Ingresar";
      }
      form.classList.remove("is-submitting");
      showToast({
        type: "success",
        icon: "ok",
        title: "Acceso validado",
        message: "El siguiente paso serÃ¡ selecciÃ³n de empresa."
      });
      if (form.dataset.next) {
        window.setTimeout(() => {
          navigateTo(form.dataset.next);
        }, 780);
      }
    }, 900);
  });
})();
