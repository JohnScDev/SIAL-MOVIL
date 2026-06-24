(function () {
  function uiReady() {
    return window.SialMobileUI;
  }

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
        message: "Estado global visible hasta que cambie la condicion."
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
          photoCapture.innerHTML = [
            '<img src="' + photo.dataUrl + '" alt="Preview de captura fotografica" loading="lazy">',
            '<div class="sial-feedback-copy"><strong>Captura fotografica</strong><span>' + photos.length + ' foto(s) capturada(s) en secuencia.</span></div>',
            '<code>SialMobileUI.openPhotoCapture({ steps, onPhoto, onComplete })</code>'
          ].join("");
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
