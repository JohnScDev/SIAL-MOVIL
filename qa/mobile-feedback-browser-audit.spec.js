"use strict";

const path = require("path");
const fs = require("fs");
const os = require("os");
const { pathToFileURL } = require("url");

function loadPlaywrightTest() {
  let parent = module.parent;
  while (parent) {
    const filename = parent.filename || "";
    const marker = path.sep + "node_modules" + path.sep + "playwright" + path.sep;
    const markerIndex = filename.indexOf(marker);
    if (markerIndex !== -1) {
      const nodeModules = filename.slice(0, markerIndex + (path.sep + "node_modules").length);
      const candidate = path.join(nodeModules, "@playwright", "test");
      if (fs.existsSync(candidate)) return require(candidate);
    }
    parent = parent.parent;
  }
  try { return require("@playwright/test"); } catch (error) {
    const roots = [process.env.npm_config_cache, path.join(os.homedir(), "AppData", "Local", "npm-cache")].filter(Boolean);
    for (const root of roots) {
      const npxRoot = path.join(root, "_npx");
      if (!fs.existsSync(npxRoot)) continue;
      const candidates = fs.readdirSync(npxRoot)
        .map((entry) => path.join(npxRoot, entry, "node_modules", "@playwright", "test"))
        .filter((candidate) => fs.existsSync(candidate))
        .sort((left, right) => fs.statSync(right).mtimeMs - fs.statSync(left).mtimeMs);
      if (candidates[0]) return require(candidates[0]);
    }
    throw error;
  }
}

const { test, expect } = loadPlaywrightTest();
const root = path.resolve(__dirname, "..");
const libraryUrl = pathToFileURL(path.join(root, "libreria", "index.html")).href;
const armarUrl = pathToFileURL(path.join(root, "pallets", "armar-pallet.html")).href;
const inspectionUrl = pathToFileURL(path.join(root, "puerto-ze", "inspeccion-externa.html")).href + "?selectContainer=1";

test("capas moviles controlan foco, aislamiento y cierre", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(libraryUrl, { waitUntil: "networkidle" });
  const trigger = page.locator("[data-library-modal]");
  await trigger.focus();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Modal centrado" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(dialog).toHaveAttribute("aria-labelledby", /library-modal-title/);
  await expect(page.locator("main.library-shell")).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator(".sial-modal-backdrop button").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await page.evaluate(() => window.SialMobileUI.openDialog({
    id: "required-dialog",
    title: "Seleccion requerida",
    message: "Debes completar esta seleccion para continuar.",
    dismissible: false,
    actions: []
  }));
  await page.keyboard.press("Escape");
  const requiredDialog = page.getByRole("dialog", { name: "Seleccion requerida" });
  await expect(requiredDialog).toBeVisible();
  await page.evaluate(() => window.SialMobileUI.openDialog({
    id: "stacked-dialog",
    title: "Confirmacion superior",
    message: "Solo esta capa debe cerrarse con Escape.",
    initialFocus: "[data-dialog-primary]",
    actions: [{ label: "Cerrar", variant: "primary" }]
  }));
  const stackedDialog = page.getByRole("dialog", { name: "Confirmacion superior" });
  await expect(stackedDialog.getByRole("button", { name: "Cerrar", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(stackedDialog).toHaveCount(0);
  await expect(requiredDialog).toBeVisible();
  await page.evaluate(() => window.SialMobileUI.closeDialog("required-dialog", { immediate: true }));
});

test("banner accionable reemplaza estado por id y ejecuta su accion", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto(libraryUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    window.__bannerAction = 0;
    window.SialMobileUI.showBanner({
      id: "sync-test",
      type: "error",
      title: "No se pudo sincronizar",
      message: "La informacion local permanece disponible.",
      action: { label: "Reintentar", onClick: () => { window.__bannerAction += 1; } }
    });
    window.SialMobileUI.showBanner({
      id: "sync-test",
      type: "error",
      title: "Sincronizacion pendiente",
      message: "Reintenta cuando tengas conexion.",
      action: { label: "Reintentar", onClick: () => { window.__bannerAction += 1; } }
    });
  });
  await expect(page.locator('[data-banner-id="sync-test"]')).toHaveCount(1);
  await page.locator('[data-banner-id="sync-test"] .sial-banner-action').click();
  await expect.poll(() => page.evaluate(() => window.__bannerAction)).toBe(1);
  await expect(page.locator('[data-banner-id="sync-test"]')).toHaveCount(0);
});


test("escaner, camara y selector obligatorio usan capas accesibles", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto(armarUrl, { waitUntil: "networkidle" });
  await page.click("[data-hu591-scan-sscc]");
  const scanner = page.getByRole("dialog", { name: /Escanear codigo SSCC/i });
  await expect(scanner).toBeVisible();
  await expect(scanner).toHaveAttribute("aria-describedby", "sial-barcode-scanner-status");
  await page.keyboard.press("Escape");
  await expect(scanner).toHaveCount(0);

  await page.goto(libraryUrl, { waitUntil: "networkidle" });
  await page.click("[data-library-photo-capture]");
  const camera = page.locator(".sial-camera-overlay[role=dialog]");
  await expect(camera).toBeVisible();
  await expect(page.locator("main.library-shell")).toHaveAttribute("aria-hidden", "true");
  await page.keyboard.press("Escape");
  await expect(camera).toHaveCount(0);

  await page.goto(inspectionUrl, { waitUntil: "networkidle" });
  const selector = page.getByRole("dialog", { name: "Selecciona un contenedor" });
  await expect(selector).toBeVisible();
  await expect(selector.locator(".sial-container-option:disabled")).not.toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(selector).toBeVisible();
});
