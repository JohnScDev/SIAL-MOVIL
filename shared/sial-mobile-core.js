(function () {
  const storageKey = "sial-mobile-theme";
  const root = document.documentElement;

  function preferredTheme() {
    const saved = localStorage.getItem(storageKey);
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function setTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem(storageKey, theme);
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.setAttribute("aria-label", theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
      button.dataset.themeState = theme;
    });
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

  function closeDialog(id) {
    const selector = id ? `[data-dialog-id="${id}"]` : ".sial-modal-backdrop:last-of-type";
    const dialog = document.querySelector(selector);
    if (dialog) dialog.remove();
    if (!document.querySelector(".sial-modal-backdrop")) {
      document.body.classList.remove("dialog-open");
    }
  }

  function openDialog(options = {}) {
    const id = options.id || `dialog-${Date.now()}`;
    closeDialog(id);

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
    const close = document.createElement("button");
    close.className = "sial-btn sial-btn-icon";
    close.type = "button";
    close.dataset.dialogClose = id;
    close.setAttribute("aria-label", "Cerrar dialogo");
    close.textContent = "x";
    header.appendChild(close);
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
    try {
      return JSON.parse(localStorage.getItem("sial-mobile-context") || "{}");
    } catch (_) {
      return {};
    }
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

  setTheme(preferredTheme());
  hydrateContext();

  window.SialMobileUI = Object.assign(window.SialMobileUI || {}, {
    setTheme,
    showToast,
    setInlineStatus,
    clearInlineStatus,
    showBanner,
    hideBanner,
    openDialog,
    openMobilePicker,
    closeDialog
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
      document.body.classList.add("drawer-open");
      return;
    }
    const close = event.target.closest("[data-drawer-close]");
    if (close) {
      document.body.classList.remove("drawer-open");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document.body.classList.remove("drawer-open");
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

  document.addEventListener("click", (event) => {
    const finca = event.target.closest("[data-finca-option]");
    if (!finca) return;
    document.querySelectorAll("[data-finca-option]").forEach((option) => {
      option.setAttribute("aria-pressed", String(option === finca));
    });
    const next = finca.dataset.next;
    localStorage.setItem("sial-mobile-context", JSON.stringify({
      name: finca.dataset.fincaName || "Contexto operativo",
      subtitle: finca.dataset.fincaSubtitle || "Operacion movil",
      logo: finca.dataset.fincaLogo || "SI"
    }));
    showToast({
      type: "success",
      icon: "ok",
      title: "Finca seleccionada",
      message: finca.dataset.fincaName || "Contexto operativo activo.",
      duration: 1200
    });
    if (next) {
      window.setTimeout(() => {
        window.location.href = next;
      }, 760);
    }
  });

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-login-form]");
    if (!form) return;
    event.preventDefault();

    const submit = form.querySelector("[type='submit']");
    if (submit) {
      submit.disabled = true;
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
        submit.textContent = submit.dataset.originalText || "Ingresar";
      }
      showToast({
        type: "success",
        icon: "ok",
        title: "Acceso validado",
        message: "El siguiente paso sera seleccion de finca."
      });
      if (form.dataset.next) {
        window.setTimeout(() => {
          window.location.href = form.dataset.next;
        }, 780);
      }
    }, 900);
  });
})();
