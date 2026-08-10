(function () {
  function uiReady() {
    return window.SialMobileUI;
  }

  function activateBarcodeScannerPanels() {
    document.querySelectorAll(".sial-scan-panel").forEach((panel) => {
      panel.setAttribute("role", "button");
      panel.setAttribute("tabindex", "0");
      panel.setAttribute("aria-label", "Probar escaner compartido");
      panel.dataset.libraryBarcodeScanner = "";
      if (!panel.querySelector("code")) {
        panel.insertAdjacentHTML("beforeend", "<code>SialMobileUI.openBarcodeScanner({ onDetected })</code>");
      }
    });
  }

  function installAlertSystemDemo() {
    const grid = document.querySelector('[data-library-section="feedback"] .library-preview-grid');
    if (!grid || grid.querySelector("[data-library-alert-system]")) return;
    const article = document.createElement("article");
    article.className = "sial-card sial-card-pad library-demo-card library-alert-system";
    article.dataset.libraryAlertSystem = "";
    article.innerHTML = [
      '<div class="library-alert-system-head">',
      '<div><span class="sial-pill">Patron principal</span><h3>Alertas SIAL</h3></div>',
      '<p class="library-muted">La tarjeta contextual informa dentro del flujo. La hoja inferior se reserva para decisiones que requieren una accion.</p>',
      '</div>',
      '<div class="library-alert-variant-grid" data-library-alert-variants></div>',
      '<div class="library-alert-actions">',
      '<button class="sial-btn sial-btn-secondary" type="button" data-library-decision-alert data-alert-type="warning">Ver decision de advertencia</button>',
      '<button class="sial-btn sial-btn-primary" type="button" data-library-decision-alert data-alert-type="error">Ver decision de error</button>',
      '</div>',
      '<code>SialMobileUI.setInlineStatus(...) + SialMobileUI.openDecisionSheet(...)</code>'
    ].join("");
    grid.prepend(article);

    const variants = [
      { type: "info", title: "Informaci\u00f3n de la operaci\u00f3n", message: "Dato relevante para continuar, sin bloquear la tarea." },
      { type: "success", title: "Registro completado", message: "La operaci\u00f3n qued\u00f3 guardada correctamente." },
      { type: "warning", title: "Revisi\u00f3n necesaria", message: "Verifica la informaci\u00f3n antes de continuar." },
      { type: "error", title: "No fue posible guardar", message: "Corrige los datos indicados e intenta nuevamente." }
    ];
    const variantGrid = article.querySelector("[data-library-alert-variants]");
    variants.forEach((variant) => {
      const node = document.createElement("div");
      variantGrid.appendChild(node);
      window.SialMobileUI.setInlineStatus(node, variant);
    });
  }

  function installMotionMap() {
    const shell = document.querySelector(".library-shell");
    const catalog = window.SialMobileUI && window.SialMobileUI.motionApplications;
    if (!shell || !catalog || shell.querySelector("[data-library-section=movimiento]")) return;

    const section = document.createElement("section");
    section.id = "movimiento";
    section.className = "library-section";
    section.dataset.librarySection = "movimiento";
    section.innerHTML = [
      '<div class="library-section-head">',
      '<h2>Movimiento y aplicacion</h2>',
      '<p>Mapa compartido de transiciones por estado. Cada patron respeta la preferencia de movimiento reducido.</p>',
      '</div>',
      '<div class="library-component-meta" data-library-motion-map></div>'
    ].join("");

    const labels = {
      screen: "Cambio entre vistas",
      press: "Press tactil",
      selection: "Seleccion",
      stateFeedback: "Feedback de estado",
      drawer: "Menu lateral",
      modal: "Modal centrado",
      sheet: "Bottom sheet",
      toast: "Toast y feedback",
      loading: "Carga y sincronizacion",
      brandIntro: "Intro de marca"
    };
    const map = section.querySelector("[data-library-motion-map]");
    Object.entries(catalog).forEach(([key, item]) => {
      const row = document.createElement("div");
      row.className = "library-component-row";
      const label = document.createElement("strong");
      const purpose = document.createElement("span");
      const timing = document.createElement("code");
      label.textContent = labels[key] || key;
      purpose.textContent = item.purpose;
      timing.textContent = item.enter + " -> " + item.exit;
      row.append(label, purpose, timing);
      map.appendChild(row);
    });
    shell.appendChild(section);

    const jump = document.querySelector(".library-jump");
    if (jump && !jump.querySelector('a[href="#movimiento"]')) {
      const link = document.createElement("a");
      link.href = "#movimiento";
      link.textContent = "Movimiento";
      jump.appendChild(link);
    }
  }

  function installTimePickerDemo() {
    const grid = document.querySelector('[data-library-section="formularios"] .library-preview-grid');
    if (!grid || grid.querySelector("[data-library-time-picker]")) return;
    const article = document.createElement("article");
    article.className = "sial-card sial-card-pad library-demo-card";
    article.dataset.libraryTimePicker = "";
    article.innerHTML = [
      "<h3>Selector de hora</h3>",
      '<p class="library-muted">Captura táctil en formato de 24 horas, con acceso rápido a la hora actual y confirmación explícita.</p>',
      '<div class="sial-field"><label class="sial-label" for="library-time-picker">Hora de inicio</label>',
      '<input class="sial-input-wrap sial-input" id="library-time-picker" name="horaDemo" type="time" value="08:20"></div>',
      "<code>SialMobileUI.openTimePicker({ target, title })</code>"
    ].join("");
    grid.appendChild(article);
    window.SialMobileUI.mountTimePickers(article);
  }

  function initializeLibraryDemos() {
    activateBarcodeScannerPanels();
    if (uiReady()) installAlertSystemDemo();
    if (uiReady()) installMotionMap();
    if (uiReady()) installTimePickerDemo();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeLibraryDemos);
  } else {
    initializeLibraryDemos();
  }

  document.addEventListener("keydown", (event) => {
    const panel = event.target.closest("[data-library-barcode-scanner]");
    if (!panel || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    panel.click();
  });

  document.addEventListener("click", (event) => {
    const segment = event.target.closest(".sial-segment-option");
    if (segment) {
      segment.parentElement.querySelectorAll(".sial-segment-option").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === segment));
      });
    }

    const tab = event.target.closest(".sial-tab");
    if (tab) {
      tab.parentElement.querySelectorAll(".sial-tab").forEach((item) => {
        item.classList.toggle("active", item === tab);
        item.setAttribute("aria-selected", String(item === tab));
      });
    }

    if (event.target.closest("[data-library-toast]") && uiReady()) {
      window.SialMobileUI.showToast({
        type: "success",
        icon: "ok",
        title: "Toast flotante",
        message: "Feedback temporal, no bloqueante y seguro para tareas rapidas."
      });
    }

    if (event.target.closest("[data-library-banner]") && uiReady()) {
      window.SialMobileUI.showBanner({
        id: "library-offline",
        type: "warning",
        title: "Banner persistente",
        message: "Estado global visible hasta que cambie la condicion.",
        action: {
          label: "Reintentar",
          dismiss: false,
          onClick: function() {
            window.SialMobileUI.showToast({ type: "info", title: "Reintento iniciado", message: "La accion permanece visible mientras se procesa." });
          }
        }
      });
    }

    if (event.target.closest("[data-library-inline-trigger]") && uiReady()) {
      const target = document.querySelector("[data-library-inline]");
      window.SialMobileUI.setInlineStatus(target, {
        type: "warning",
        title: "Alerta inline",
        message: "Validacion asociada al bloque donde se origina."
      });
    }

    if (event.target.closest("[data-library-logo-intro]") && uiReady()) {
      window.SialMobileUI.playLogoIntro({
        logoSrc: "../assets/brand/isotipo-sial.svg",
        title: "SIAL",
        caption: "Sistema de Informacion Agrologistico",
        duration: 2200,
        reducedDuration: 980
      });
      return;
    }

    const photoCapture = event.target.closest("[data-library-photo-capture]");
    if (photoCapture && uiReady()) {
      const capture = window.SialMobileUI.openPhotoCapture || window.SialMobileUI.openCamera;
      if (!capture) return;
      const steps = [
        { title: "Documentos del vehiculo", pointKey: "documentos-vehiculo" },
        { title: "Frontal del vehiculo", pointKey: "frontal-vehiculo" },
        { title: "Placa del remolque", pointKey: "placa-remolque" }
      ];
      capture({
        title: steps[0].title,
        eventName: "libraryPhotoCapture",
        allowMultiple: true,
        maxPhotos: steps.length,
        steps,
        onPhoto(photo) {
          photoCapture.dataset.lastPoint = photo.pointKey || "";
        },
        onComplete(photos) {
          if (!photos || !photos.length) return;
          const photo = photos[photos.length - 1];
          photoCapture.classList.add("is-captured");
          const previousPreview = photoCapture.querySelector(":scope > img");
          if (previousPreview) previousPreview.remove();
          const preview = document.createElement("img");
          preview.src = photo.dataUrl;
          preview.alt = "Preview de captura fotografica";
          preview.loading = "lazy";
          photoCapture.insertBefore(preview, photoCapture.firstChild);
          const badge = photoCapture.querySelector(".library-capture-heading .sial-pill");
          const description = photoCapture.querySelector(".library-capture-description");
          if (badge) badge.textContent = photos.length + " foto(s)";
          if (description) description.textContent = "Secuencia capturada. Toca para reemplazarla.";
          window.SialMobileUI.showToast({
            type: "success",
            title: "Patron de fotos",
            message: "La captura usa la secuencia global reutilizable."
          });
        },
        onCancel() {
          window.SialMobileUI.showToast({
            type: "info",
            title: "Captura cancelada",
            message: "No se agrego evidencia."
          });
        }
      });
      return;
    }

    const barcodeScanner = event.target.closest("[data-library-barcode-scanner]");
    if (barcodeScanner && uiReady() && typeof window.SialMobileUI.openBarcodeScanner === "function") {
      window.SialMobileUI.openBarcodeScanner({
        title: "Escaner compartido",
        eyebrow: "Patron reutilizable",
        demoValue: "177012345678900019",
        demoLabel: "Leer codigo demo",
        normalize: window.SialMobileUI.normalizeSscc,
        validate(value) {
          return value.length === 18
            ? { ok: true, value }
            : { ok: false, message: "El ejemplo requiere un SSCC de 18 digitos." };
        },
        onDetected(value) {
          const copy = barcodeScanner.querySelector(".sial-feedback-copy span");
          if (copy) copy.textContent = "Ultima lectura: " + value;
          window.SialMobileUI.showToast({
            type: "success",
            title: "Codigo detectado",
            message: value
          });
        }
      });
      return;
    }

    const picker = event.target.closest("[data-library-picker]");
    if (picker && uiReady()) {
      window.SialMobileUI.openMobilePicker({
        id: "library-picker",
        title: "Selector movil",
        message: "En movil la seleccion se resuelve como accion tactil. El teclado solo aparece si se habilita busqueda.",
        target: "[data-library-picker-value]",
        selectedValue: document.querySelector("[data-library-picker-value]")?.value || "",
        items: [
          { label: "Seleccion activa", value: "Seleccion activa", helper: "Opcion actual" },
          { label: "Opcion operativa", value: "Opcion operativa", helper: "Alternativa disponible" },
          { label: "Opcion restringida", value: "Opcion restringida", helper: "Requiere permisos" }
        ],
        onSelect(item) {
          picker.textContent = item.label;
        }
      });
    }

    if (event.target.closest("[data-library-modal]") && uiReady()) {
      window.SialMobileUI.openDialog({
        id: "library-modal",
        title: "Modal centrado",
        message: "Patron para decisiones criticas que deben bloquear la pantalla.",
        actions: [
          { label: "Cancelar", variant: "secondary" },
          { label: "Confirmar", variant: "primary" }
        ]
      });
    }

    if (event.target.closest("[data-library-sheet]") && uiReady()) {
      window.SialMobileUI.openDialog({
        id: "library-sheet",
        variant: "sheet",
        title: "Bottom sheet",
        message: "Patron contextual para opciones moviles sin cambiar de vista.",
        actions: [
          { label: "Cerrar", variant: "secondary" },
          { label: "Aplicar", variant: "primary" }
        ]
      });
    }

    const decisionTrigger = event.target.closest("[data-library-decision-alert]");
    if (decisionTrigger && uiReady() && typeof window.SialMobileUI.openDecisionSheet === "function") {
      const type = decisionTrigger.dataset.alertType || "warning";
      const isError = type === "error";
      window.SialMobileUI.openDecisionSheet({
        id: "library-decision-alert",
        type,
        title: isError ? "No se pudo completar la operaci\u00f3n" : "\u00bfDeseas continuar?",
        message: isError
          ? "Los datos no se guardaron. Revisa la informaci\u00f3n o intenta nuevamente."
          : "Se detect\u00f3 una diferencia en los datos. Puedes volver a revisarlos o continuar bajo tu responsabilidad.",
        actions: [
          { label: "Revisar datos", variant: "secondary" },
          { label: isError ? "Intentar nuevamente" : "Continuar", variant: "primary", initialFocus: true }
        ]
      });
    }

    if (event.target.closest("[data-library-reset]") && uiReady()) {
      window.SialMobileUI.hideBanner("library-offline");
      window.SialMobileUI.clearInlineStatus("[data-library-inline]");
      window.SialMobileUI.showToast({
        type: "info",
        title: "Estados demo limpiados",
        message: "La libreria mantiene los patrones independientes de las vistas."
      });
    }
  });
})();
