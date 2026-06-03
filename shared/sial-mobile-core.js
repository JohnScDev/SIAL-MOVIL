(function () {
  const storageThemeKey = "sial-mobile-theme";
  const contextStorageKey = "sial-mobile-context";
  const companyStorageKey = "sial-mobile-company";
  const root = document.documentElement;
  const motionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  const dialogExitDelay = 220;

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

  function navigateTo(href, options = {}) {
    if (!href) return;
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

  function preferredTheme() {
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

  setTheme(preferredTheme());
  hydrateContext();
  hydrateCompanyContext();
  refreshSelectionViews();

  window.SialMobileUI = Object.assign(window.SialMobileUI || {}, {
    setTheme,
    showToast,
    setInlineStatus,
    clearInlineStatus,
    showBanner,
    hideBanner,
    openDialog,
    openMobilePicker,
    closeDialog,
    replayMotionState,
    navigateTo,
    selectedContext,
    setSelectedContext,
    selectedCompany,
    setSelectedCompany,
    clearSelectedCompany,
    clearSelectedContext
  });

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

  document.addEventListener("input", (event) => {
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

