(function () {
  const loginBackgroundImages = [
    { file: "Imagen 4.jpg", position: "center" },
    { file: "Imagen 1.jpg", position: "82% 78%" }
  ];
  const rotationMs = 5000;
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function loginAssetUrl(fileName) {
    const normalizedPath = window.location.pathname.replace(/\\/g, "/");
    const isNestedLogin = /\/login\/[^/]*$/i.test(normalizedPath);
    const basePath = isNestedLogin ? "../assets/login/" : "assets/login/";
    return new URL(basePath + fileName, window.location.href).href;
  }

  function preloadLoginImages() {
    loginBackgroundImages.forEach(({ file }) => {
      const image = new Image();
      image.src = loginAssetUrl(file);
    });
  }

  function preferredInitialImage(screen) {
    if (screen.classList.contains("variant-context")) return "Imagen 1.jpg";
    return "Imagen 4.jpg";
  }

  function setLoginBackground(screen, index, animate) {
    const { file: fileName, position } = loginBackgroundImages[index];
    const imageValue = `url("${loginAssetUrl(fileName)}")`;
    const apply = () => {
      screen.style.setProperty("--login-active-image", imageValue);
      screen.style.setProperty("--login-active-position", position);
      screen.dataset.loginBackgroundIndex = String(index);
      screen.dataset.loginBackgroundName = fileName;
      screen.dataset.loginBackgroundPosition = position;
      screen.classList.remove("login-bg-transition");
    };

    if (!animate || reduceMotion) {
      apply();
      return;
    }

    screen.classList.add("login-bg-transition");
    window.setTimeout(apply, 180);
  }

  function startLoginBackgroundRotation() {
    const screens = Array.from(document.querySelectorAll(".login-screen:not(.variant-minimal)"));
    if (!screens.length || loginBackgroundImages.length < 2) return;
    preloadLoginImages();

    screens.forEach((screen) => {
      let index = loginBackgroundImages.findIndex((item) => item.file === preferredInitialImage(screen));
      if (index < 0) index = 0;
      setLoginBackground(screen, index, false);
      window.setInterval(() => {
        index = (index + 1) % loginBackgroundImages.length;
        setLoginBackground(screen, index, true);
      }, rotationMs);
    });
  }

  const recoverySteps = [
    { id: "user", label: "Usuario" },
    { id: "code", label: "Codigo" },
    { id: "password", label: "Contrasena" }
  ];

  function createTextElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function createStatus() {
    const status = document.createElement("div");
    status.className = "sial-status info";
    status.dataset.recoveryStatus = "";
    status.hidden = true;
    return status;
  }

  function createPasswordToggle(targetSelector) {
    const button = document.createElement("button");
    button.className = "sial-password-button";
    button.type = "button";
    button.dataset.passwordToggle = targetSelector;
    button.setAttribute("aria-label", "Mostrar contrasena");
    button.innerHTML = '<svg class="sial-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
    return button;
  }

  function createAccessRecoveryContent(sourceForm) {
    const state = {
      currentStep: "user",
      user: sourceForm?.querySelector("input[name='usuario']")?.value || "",
      otp: "",
      resendTimer: null
    };

    const shell = document.createElement("div");
    shell.className = "sial-recovery-flow";
    shell.dataset.accessRecoveryForm = "";

    const stepper = document.createElement("ol");
    stepper.className = "sial-recovery-steps";
    stepper.setAttribute("data-recovery-stepper", "");

    const heading = document.createElement("div");
    heading.className = "sial-recovery-heading";
    const title = createTextElement("h3", "", "");
    title.dataset.recoveryTitle = "";
    const copy = createTextElement("p", "", "");
    copy.dataset.recoveryCopy = "";
    heading.append(title, copy);

    const body = document.createElement("div");
    body.className = "sial-recovery-body";

    shell.append(stepper, heading, body);

    function clearResendTimer() {
      if (!state.resendTimer) return;
      window.clearInterval(state.resendTimer);
      state.resendTimer = null;
    }

    function setHeading(step) {
      const content = {
        user: {
          title: "Recuperar contrasena",
          copy: "Ingresa tu usuario. Enviaremos un codigo de verificacion al correo registrado para restablecer tu acceso."
        },
        code: {
          title: "Verificar codigo de seguridad",
          copy: "Ingresa el codigo de 6 digitos enviado al correo registrado. Por seguridad no compartas este codigo."
        },
        password: {
          title: "Crear nueva contrasena",
          copy: "Define una contrasena segura para recuperar el acceso. Debe cumplir la politica definida por el sistema."
        }
      };

      title.textContent = content[step].title;
      copy.textContent = content[step].copy;
    }

    function renderStepper() {
      const currentIndex = recoverySteps.findIndex((step) => step.id === state.currentStep);
      stepper.replaceChildren();

      recoverySteps.forEach((step, index) => {
        const item = document.createElement("li");
        item.className = "sial-recovery-step";
        if (index < currentIndex) item.classList.add("is-done");
        if (index === currentIndex) item.classList.add("is-current");
        item.setAttribute("aria-current", index === currentIndex ? "step" : "false");

        const marker = createTextElement("span", "", String(index + 1));
        const label = createTextElement("strong", "", step.label);
        item.append(marker, label);
        stepper.append(item);
      });
    }

    function changeStep(nextStep) {
      state.currentStep = nextStep;
      render();
    }

    function createUserStep() {
      clearResendTimer();

      const form = document.createElement("form");
      form.className = "sial-form";
      form.dataset.recoveryStep = "user";

      const field = document.createElement("label");
      field.className = "sial-field";
      const label = createTextElement("span", "sial-label", "Usuario");
      const input = document.createElement("input");
      input.className = "sial-input-wrap sial-input";
      input.name = "recoveryUser";
      input.type = "text";
      input.inputMode = "email";
      input.autocomplete = "username";
      input.autocapitalize = "none";
      input.autocorrect = "off";
      input.spellcheck = false;
      input.enterKeyHint = "send";
      input.placeholder = "Nombre de usuario";
      input.value = state.user;
      const note = createTextElement("p", "sial-field-note", "Debe corresponder al usuario asignado en SIAL.");
      field.append(label, input, note);

      const status = createStatus();

      const actions = createTextElement("div", "sial-login-actions", "");
      const submit = createTextElement("button", "sial-btn sial-btn-primary sial-btn-full", "Enviar codigo");
      submit.type = "submit";
      const cancel = createTextElement("button", "sial-btn sial-btn-secondary sial-btn-full", "Cancelar");
      cancel.type = "button";
      cancel.addEventListener("click", () => window.SialMobileUI?.closeDialog("access-recovery"));
      actions.append(submit, cancel);

      form.append(field, status, actions);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const value = input.value.trim();

        if (!value) {
          window.SialMobileUI?.setInlineStatus(status, {
            type: "error",
            title: "Dato requerido",
            message: "Ingresa tu usuario para continuar con la recuperacion."
          });
          input.focus();
          return;
        }

        state.user = value;
        window.SialMobileUI?.showToast({
          type: "info",
          title: "Codigo enviado",
          message: "Revisa el correo registrado para el usuario."
        });
        changeStep("code");
      });

      window.setTimeout(() => input.focus(), 80);
      return form;
    }

    function createOtpInput(index, inputs, submit) {
      const input = document.createElement("input");
      input.className = "sial-otp-input";
      input.setAttribute("data-recovery-otp", "");
      input.type = "text";
      input.inputMode = "numeric";
      input.pattern = "[0-9]*";
      input.maxLength = 1;
      input.autocapitalize = "none";
      input.autocorrect = "off";
      input.spellcheck = false;
      input.enterKeyHint = index === 5 ? "done" : "next";
      input.setAttribute("aria-label", `Digito ${index + 1} del codigo`);
      if (index === 0) input.autocomplete = "one-time-code";

      function updateSubmit() {
        state.otp = inputs.map((otpInput) => otpInput.value).join("");
        submit.disabled = state.otp.length !== 6;
      }

      function distributeDigits(value) {
        const digits = value.replace(/\D/g, "").slice(0, 6).split("");
        inputs.forEach((otpInput, digitIndex) => {
          otpInput.value = digits[digitIndex] || "";
        });
        const focusIndex = Math.min(digits.length, inputs.length) - 1;
        if (focusIndex >= 0) inputs[focusIndex].focus();
        updateSubmit();
      }

      input.addEventListener("input", () => {
        const value = input.value.replace(/\D/g, "");
        if (value.length > 1) {
          distributeDigits(value);
          return;
        }

        input.value = value;
        if (value && inputs[index + 1]) inputs[index + 1].focus();
        updateSubmit();
      });

      input.addEventListener("keydown", (event) => {
        if (event.key === "Backspace" && !input.value && inputs[index - 1]) {
          inputs[index - 1].focus();
        }
      });

      input.addEventListener("paste", (event) => {
        event.preventDefault();
        distributeDigits(event.clipboardData?.getData("text") || "");
      });

      return input;
    }

    function startResendCountdown(button) {
      clearResendTimer();
      let seconds = 45;
      button.disabled = true;
      button.textContent = `Reenviar codigo en ${seconds}s`;
      state.resendTimer = window.setInterval(() => {
        seconds -= 1;
        if (seconds <= 0) {
          clearResendTimer();
          button.disabled = false;
          button.textContent = "Reenviar codigo";
          return;
        }
        button.textContent = `Reenviar codigo en ${seconds}s`;
      }, 1000);
    }

    function createCodeStep() {
      const form = document.createElement("form");
      form.className = "sial-form";
      form.dataset.recoveryStep = "code";

      const group = document.createElement("div");
      group.className = "sial-otp-group";
      group.setAttribute("aria-label", "Codigo de seguridad");

      const status = createStatus();
      const submit = createTextElement("button", "sial-btn sial-btn-primary sial-btn-full", "Verificar codigo");
      submit.type = "submit";
      submit.disabled = true;
      const inputs = [];
      for (let index = 0; index < 6; index += 1) {
        const input = createOtpInput(index, inputs, submit);
        inputs.push(input);
        group.append(input);
      }

      const secondary = createTextElement("div", "sial-auth-secondary-actions", "");
      const resend = createTextElement("button", "login-link", "Reenviar codigo en 45s");
      resend.type = "button";
      resend.setAttribute("data-recovery-resend", "");
      const changeUser = createTextElement("button", "login-link", "Cambiar usuario");
      changeUser.type = "button";
      changeUser.addEventListener("click", () => changeStep("user"));
      resend.addEventListener("click", () => {
        window.SialMobileUI?.showToast({
          type: "info",
          title: "Codigo reenviado",
          message: "Revisa nuevamente el correo registrado."
        });
        startResendCountdown(resend);
      });
      secondary.append(resend, changeUser);

      form.append(group, createTextElement("p", "sial-field-note", `Codigo enviado al correo registrado para ${state.user}.`), status, secondary, submit);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        state.otp = inputs.map((input) => input.value).join("");

        if (state.otp.length !== 6) {
          window.SialMobileUI?.setInlineStatus(status, {
            type: "error",
            title: "Codigo incompleto",
            message: "Ingresa los 6 digitos del codigo de seguridad."
          });
          inputs.find((input) => !input.value)?.focus();
          return;
        }

        changeStep("password");
      });

      startResendCountdown(resend);
      window.setTimeout(() => inputs[0]?.focus(), 80);
      return form;
    }

    function createPasswordStep() {
      clearResendTimer();

      const form = document.createElement("form");
      form.className = "sial-form";
      form.dataset.recoveryStep = "password";

      const newField = document.createElement("label");
      newField.className = "sial-field";
      newField.append(createTextElement("span", "sial-label", "Nueva contrasena"));
      const newWrap = createTextElement("div", "sial-input-wrap", "");
      const newPassword = document.createElement("input");
      newPassword.className = "sial-input";
      newPassword.id = "recoveryNewPassword";
      newPassword.name = "recoveryNewPassword";
      newPassword.type = "password";
      newPassword.autocomplete = "new-password";
      newPassword.placeholder = "Nueva contrasena";
      newPassword.enterKeyHint = "next";
      newWrap.append(newPassword, createPasswordToggle("#recoveryNewPassword"));
      newField.append(newWrap);

      const confirmField = document.createElement("label");
      confirmField.className = "sial-field";
      confirmField.append(createTextElement("span", "sial-label", "Confirmar contrasena"));
      const confirmWrap = createTextElement("div", "sial-input-wrap", "");
      const confirmPassword = document.createElement("input");
      confirmPassword.className = "sial-input";
      confirmPassword.id = "recoveryConfirmPassword";
      confirmPassword.name = "recoveryConfirmPassword";
      confirmPassword.type = "password";
      confirmPassword.autocomplete = "new-password";
      confirmPassword.placeholder = "Confirma la contrasena";
      confirmPassword.enterKeyHint = "done";
      confirmWrap.append(confirmPassword, createPasswordToggle("#recoveryConfirmPassword"));
      confirmField.append(confirmWrap);

      const note = createTextElement("p", "sial-field-note", "Usa minimo 8 caracteres, combinando letras, numeros y simbolos.");
      const status = createStatus();
      const submit = createTextElement("button", "sial-btn sial-btn-primary sial-btn-full", "Guardar contrasena");
      submit.type = "submit";

      form.append(newField, confirmField, note, status, submit);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const newValue = newPassword.value;
        const confirmValue = confirmPassword.value;

        if (!newValue || !confirmValue) {
          window.SialMobileUI?.setInlineStatus(status, {
            type: "error",
            title: "Datos requeridos",
            message: "Completa y confirma la nueva contrasena."
          });
          (!newValue ? newPassword : confirmPassword).focus();
          return;
        }

        if (newValue.length < 8) {
          window.SialMobileUI?.setInlineStatus(status, {
            type: "error",
            title: "Contrasena insegura",
            message: "La contrasena debe tener minimo 8 caracteres."
          });
          newPassword.focus();
          return;
        }

        if (newValue !== confirmValue) {
          window.SialMobileUI?.setInlineStatus(status, {
            type: "error",
            title: "Las contrasenas no coinciden",
            message: "Verifica que ambos campos tengan el mismo valor."
          });
          confirmPassword.focus();
          return;
        }

        window.SialMobileUI?.setInlineStatus(status, {
          type: "success",
          title: "Contrasena actualizada",
          message: "Al guardar correctamente volveras al inicio de sesion."
        });
        window.SialMobileUI?.showToast({
          type: "success",
          title: "Acceso restablecido",
          message: "Ya puedes ingresar con tu nueva contrasena."
        });
        window.setTimeout(() => {
          window.SialMobileUI?.closeDialog("access-recovery");
          sourceForm?.querySelector("input[name='usuario']")?.focus({ preventScroll: true });
        }, 900);
      });

      window.setTimeout(() => newPassword.focus(), 80);
      return form;
    }

    function render() {
      shell.dataset.recoveryCurrentStep = state.currentStep;
      setHeading(state.currentStep);
      renderStepper();

      if (state.currentStep === "user") body.replaceChildren(createUserStep());
      if (state.currentStep === "code") body.replaceChildren(createCodeStep());
      if (state.currentStep === "password") body.replaceChildren(createPasswordStep());
    }

    render();
    return shell;
  }

  function openAccessRecovery(trigger) {
    const form = trigger.closest("form");
    if (!window.SialMobileUI?.openDialog) return;
    const dialog = window.SialMobileUI.openDialog({
      id: "access-recovery",
      variant: "sheet",
      title: "Recuperar acceso",
      content: createAccessRecoveryContent(form),
      actions: []
    });
    window.setTimeout(() => {
      dialog.querySelector("input[name='recoveryUser']")?.focus();
    }, 120);
  }

  document.querySelectorAll("[data-recover-access]").forEach((button) => {
    button.addEventListener("click", () => openAccessRecovery(button));
  });

  startLoginBackgroundRotation();
})();
