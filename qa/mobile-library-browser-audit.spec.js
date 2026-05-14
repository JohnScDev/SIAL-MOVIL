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
const catalogUrl = pathToFileURL(path.join(root, "libreria", "index.html")).href;

const viewports = [
  { width: 360, height: 740, name: "phone-small" },
  { width: 390, height: 844, name: "phone-standard" },
  { width: 768, height: 1024, name: "tablet-portrait" },
  { width: 1200, height: 820, name: "wide" }
];

for (const viewport of viewports) {
  test(`catalogo libreria movil ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const runtimeErrors = [];

    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });

    await page.goto(catalogUrl, { waitUntil: "networkidle" });

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      sections: document.querySelectorAll("[data-library-section]").length,
      jumpLinks: document.querySelectorAll(".library-jump a").length,
      apiReady: Boolean(window.SialMobileUI),
      auditFlag: document.querySelector(".library-shell")?.getAttribute("data-library-audit"),
      syncControls: Array.from(document.querySelectorAll(".sial-sync-item .sial-pill, .sial-sync-item .sial-chip-action")).map((node) => {
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        return {
          text: node.textContent.trim(),
          width: rect.width,
          height: rect.height,
          whiteSpace: style.whiteSpace
        };
      }),
      syncOverlaps: Array.from(document.querySelectorAll(".sial-sync-item")).filter((item) => {
        const children = Array.from(item.children).map((node) => ({
          text: node.textContent.trim(),
          rect: node.getBoundingClientRect()
        }));
        return children.some((left, leftIndex) => children.some((right, rightIndex) => {
          if (leftIndex >= rightIndex) return false;
          const horizontalOverlap = left.rect.left < right.rect.right && left.rect.right > right.rect.left;
          const verticalOverlap = left.rect.top < right.rect.bottom && left.rect.bottom > right.rect.top;
          return horizontalOverlap && verticalOverlap;
        }));
      }).length
    }));

    expect(metrics.apiReady).toBe(true);
    expect(metrics.auditFlag).toBe("complete");
    expect(metrics.sections).toBeGreaterThanOrEqual(8);
    expect(metrics.jumpLinks).toBe(metrics.sections);
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
    metrics.syncControls.forEach((control) => {
      expect(control.whiteSpace).toBe("nowrap");
      expect(control.height).toBeLessThanOrEqual(40);
      if (control.text.length > 2) expect(control.width).toBeGreaterThanOrEqual(64);
    });
    expect(metrics.syncOverlaps).toBe(0);

    await page.click("[data-library-toast]");
    await expect(page.locator("[data-toast-region] .sial-toast")).toBeVisible();

    await page.click("[data-library-banner]");
    await expect(page.locator("[data-banner-region] .sial-banner")).toBeVisible();

    await page.click("[data-library-inline-trigger]");
    await expect(page.locator("[data-library-inline]")).toBeVisible();

    await page.click("[data-library-picker]");
    await expect(page.locator(".sial-modal-backdrop .sial-bottom-sheet")).toBeVisible();
    await page.click(".sial-picker-option[data-picker-value='Opcion operativa']");
    await expect(page.locator("[data-library-picker]")).toHaveText("Opcion operativa");

    await page.click("[data-library-modal]");
    await expect(page.locator(".sial-modal-backdrop .sial-modal")).toBeVisible();
    await page.click("[data-dialog-close='library-modal']");

    await page.click("[data-library-sheet]");
    await expect(page.locator(".sial-modal-backdrop .sial-bottom-sheet")).toBeVisible();
    await page.click("[data-dialog-close='library-sheet']");

    expect(runtimeErrors).toEqual([]);
  });
}
