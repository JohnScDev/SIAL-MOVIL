const path = require("path");
const fs = require("fs");
const os = require("os");
const { pathToFileURL } = require("url");

function loadPlaywrightTest() {
  let parent = module.parent;
  while (parent) {
    const filename = parent.filename || "";
    const marker = `${path.sep}node_modules${path.sep}playwright${path.sep}`;
    const markerIndex = filename.indexOf(marker);
    if (markerIndex !== -1) {
      const nodeModules = filename.slice(0, markerIndex + `${path.sep}node_modules`.length);
      const candidate = path.join(nodeModules, "@playwright", "test");
      if (fs.existsSync(candidate)) return require(candidate);
    }
    parent = parent.parent;
  }

  try {
    return require("@playwright/test");
  } catch (error) {
    const cacheRoots = [
      process.env.npm_config_cache,
      path.join(os.homedir(), "AppData", "Local", "npm-cache")
    ].filter(Boolean);

    for (const cacheRoot of cacheRoots) {
      const npxRoot = path.join(cacheRoot, "_npx");
      if (!fs.existsSync(npxRoot)) continue;
      const candidates = fs.readdirSync(npxRoot)
        .map((entry) => path.join(npxRoot, entry, "node_modules", "@playwright", "test"))
        .filter((candidate) => fs.existsSync(candidate));
      candidates.sort((left, right) => fs.statSync(right).mtimeMs - fs.statSync(left).mtimeMs);
      if (candidates[0]) return require(candidates[0]);
    }

    throw error;
  }
}

const { test, expect } = loadPlaywrightTest();

const root = path.resolve(__dirname, "..");
const loginUrl = pathToFileURL(path.join(root, "login", "login-01-institucional.html")).href;

test("login movil no expone opcion demo y mantiene ingreso", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const runtimeErrors = [];

  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  await page.goto(loginUrl, { waitUntil: "networkidle" });
  await expect(page.locator("text=Usar demo")).toHaveCount(0);
  await expect(page.locator("[data-fill-demo]")).toHaveCount(0);
  await expect(page.locator("[data-login-form]")).toBeVisible();

  await page.fill("input[name='usuario']", "operador.sial");
  await page.fill("input[name='contrasena']", "Sial1234!");
  await page.click("[data-login-form] button[type='submit']");
  await expect(page.locator("[data-toast-region] .sial-toast", { hasText: "Validando credenciales" })).toBeVisible();
  await page.waitForURL(/seleccion-finca\.html$/, { timeout: 6000 });

  expect(runtimeErrors).toEqual([]);
});

test("login movil recupera acceso con la misma logica de tres pasos del modulo web", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const runtimeErrors = [];

  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  await page.goto(loginUrl, { waitUntil: "networkidle" });
  await expect(page.locator("[data-recover-access]")).toBeVisible();

  const username = page.locator("input[name='usuario']");
  await expect(username).toHaveAttribute("inputmode", "email");
  await expect(username).toHaveAttribute("autocapitalize", "none");
  await expect(username).toHaveAttribute("spellcheck", "false");

  await page.click("[data-recover-access]");
  await expect(page.locator(".sial-modal-backdrop .sial-bottom-sheet")).toBeVisible();
  await expect(page.locator(".sial-dialog-copy")).toHaveCount(0);
  await expect(page.locator(".sial-dialog-header h2")).toHaveCSS("text-align", "center");
  await expect(page.locator("[data-recovery-stepper]")).toBeVisible();
  await expect(page.locator("[data-recovery-title]")).toHaveCSS("text-align", "center");
  await expect(page.locator("[data-recovery-title]")).toContainText("Recuperar contrasena");
  await expect(page.locator("[data-recovery-copy]")).toContainText("Ingresa tu usuario");

  const recoveryInput = page.locator("input[name='recoveryUser']");
  await expect(recoveryInput).toBeVisible();
  await expect(recoveryInput).toHaveAttribute("inputmode", "email");
  await expect(recoveryInput).toHaveAttribute("autocomplete", "username");
  await expect(recoveryInput).toHaveAttribute("autocapitalize", "none");

  await page.click("[data-recovery-step='user'] button[type='submit']");
  await expect(page.locator("[data-recovery-status]")).toContainText("Dato requerido");

  await recoveryInput.fill("operador.sial");
  await page.click("[data-recovery-step='user'] button[type='submit']");
  await expect(page.locator("[data-recovery-title]")).toContainText("Verificar codigo de seguridad");
  await expect(page.locator("[data-recovery-copy]")).toContainText("codigo de 6 digitos");
  await expect(page.locator("[data-recovery-otp]")).toHaveCount(6);
  await expect(page.locator("[data-recovery-otp]").first()).toHaveAttribute("autocomplete", "one-time-code");
  await expect(page.locator("[data-recovery-step='code'] button[type='submit']")).toBeDisabled();
  await expect(page.locator("[data-recovery-resend]")).toContainText("Reenviar codigo en 45s");

  await page.locator("[data-recovery-otp]").first().click();
  await page.keyboard.type("123456");
  await expect(page.locator("[data-recovery-step='code'] button[type='submit']")).toBeEnabled();
  await page.click("[data-recovery-step='code'] button[type='submit']");
  await expect(page.locator("[data-recovery-title]")).toContainText("Crear nueva contrasena");
  await expect(page.locator("[data-recovery-copy]")).toContainText("Define una contrasena segura");

  const newPassword = page.locator("input[name='recoveryNewPassword']");
  const confirmPassword = page.locator("input[name='recoveryConfirmPassword']");
  await expect(newPassword).toHaveAttribute("autocomplete", "new-password");
  await expect(confirmPassword).toHaveAttribute("autocomplete", "new-password");
  await newPassword.fill("Sial1234!");
  await confirmPassword.fill("Sial4321!");
  await page.click("[data-recovery-step='password'] button[type='submit']");
  await expect(page.locator("[data-recovery-status]")).toContainText("Las contrasenas no coinciden");

  await confirmPassword.fill("Sial1234!");
  await page.click("[data-recovery-step='password'] button[type='submit']");
  await expect(page.locator("[data-recovery-status]")).toContainText("Contrasena actualizada");
  await expect(page.locator("[data-toast-region] .sial-toast", { hasText: "Acceso restablecido" })).toBeVisible();
  await expect(page.locator(".sial-modal-backdrop")).toHaveCount(0);
  await expect(page.locator("[data-recover-access]")).toBeVisible();

  expect(runtimeErrors).toEqual([]);
});
