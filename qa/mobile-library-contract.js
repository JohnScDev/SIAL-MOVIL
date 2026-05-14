const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "shared", "sial-mobile-core.css"), "utf8");
const core = fs.readFileSync(path.join(root, "shared", "sial-mobile-core.js"), "utf8");
const flow = fs.readFileSync(path.join(root, "shared", "sial-mobile-flow.js"), "utf8");
const docPath = [
  path.resolve(root, "..", "Base UI UX Movil SIAL v0.1.md"),
  path.resolve(root, "..", "..", "..", "Informes", "BANASAN IU.UX", "Base UI UX Movil SIAL v0.1.md")
].find((candidate) => fs.existsSync(candidate));
const doc = fs.readFileSync(docPath, "utf8");

const failures = [];

function requireContains(source, needle, label) {
  if (!source.includes(needle)) failures.push(`${label}: falta ${needle}`);
}

[
  ".sial-toast-region",
  ".sial-status",
  ".sial-banner",
  ".sial-empty-state",
  ".sial-loading-skeleton",
  ".sial-modal-backdrop",
  ".sial-modal",
  ".sial-bottom-sheet"
  , ".sial-segmented"
  , ".sial-tabs"
  , ".sial-media-capture"
  , ".sial-signature-pad"
  , ".sial-scan-panel"
  , ".sial-sync-stack"
  , ".sial-picker-trigger"
  , ".sial-picker-list"
].forEach((selector) => requireContains(css, selector, "CSS libreria"));

[
  "window.SialMobileUI",
  "showToast",
  "setInlineStatus",
  "clearInlineStatus",
  "showBanner",
  "hideBanner",
  "openDialog",
  "openMobilePicker",
  "closeDialog"
].forEach((api) => requireContains(core, api, "API SialMobileUI"));

if (/function\s+showToast\s*\(/.test(flow)) {
  failures.push("Flujo: no debe definir showToast duplicado; debe consumir SialMobileUI.showToast");
}

[
  "Toast flotante",
  "Alerta inline",
  "Banner persistente",
  "Modal o bottom sheet",
  "Empty state",
  "Loading skeleton",
  "Selector movil",
  "SialMobileUI"
].forEach((definition) => requireContains(doc, definition, "Documento base"));

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("OK contrato de libreria movil");
