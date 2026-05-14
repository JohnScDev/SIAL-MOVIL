const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const catalogPath = path.join(root, "libreria", "index.html");
const catalogScriptPath = path.join(root, "libreria", "sial-mobile-library.js");
const catalogStylePath = path.join(root, "libreria", "sial-mobile-library.css");
const docPath = [
  path.resolve(root, "..", "Base UI UX Movil SIAL v0.1.md"),
  path.resolve(root, "..", "..", "..", "Informes", "BANASAN IU.UX", "Base UI UX Movil SIAL v0.1.md")
].find((candidate) => fs.existsSync(candidate));

const failures = [];

function readIfExists(file, label) {
  if (!fs.existsSync(file)) {
    failures.push(`Falta ${label}: ${file}`);
    return "";
  }
  return fs.readFileSync(file, "utf8");
}

function requireContains(source, needle, label) {
  if (!source.includes(needle)) failures.push(`${label}: falta ${needle}`);
}

const html = readIfExists(catalogPath, "catalogo visual");
const script = readIfExists(catalogScriptPath, "script de catalogo");
const style = readIfExists(catalogStylePath, "estilos de catalogo");
const doc = readIfExists(docPath || "", "documento base");

[
  "../shared/sial-mobile-core.css",
  "../shared/sial-mobile-core.js",
  "sial-mobile-library.css",
  "sial-mobile-library.js",
  "data-library-section=\"fundamentos\"",
  "data-library-section=\"navegacion\"",
  "data-library-section=\"acciones\"",
  "data-library-section=\"formularios\"",
  "data-library-section=\"autenticacion\"",
  "data-library-section=\"feedback\"",
  "data-library-section=\"capas\"",
  "data-library-section=\"estados\"",
  "data-library-section=\"offline-sync\"",
  "data-library-toast",
  "data-library-banner",
  "data-library-picker",
  "data-library-modal",
  "data-library-sheet",
  "data-library-inline",
  "SialMobileUI.showToast",
  "SialMobileUI.showBanner",
  "SialMobileUI.openMobilePicker",
  "SialMobileUI.openDialog",
  "Toast flotante",
  "Banner persistente",
  "Selector movil",
  "Autenticacion",
  "Recuperacion de acceso",
  "Usuario -> Codigo -> Contrasena",
  "Modal centrado",
  "Bottom sheet",
  "Empty state",
  "Loading skeleton"
].forEach((needle) => requireContains(html, needle, "catalogo"));

[
  "window.SialMobileUI.showToast",
  "window.SialMobileUI.showBanner",
  "window.SialMobileUI.openMobilePicker",
  "window.SialMobileUI.openDialog",
  "window.SialMobileUI.setInlineStatus",
  "data-library-reset"
].forEach((needle) => requireContains(script, needle, "script catalogo"));

[
  ".library-shell",
  ".library-hero",
  ".library-section",
  ".library-spec",
  ".library-preview-grid"
].forEach((needle) => requireContains(style, " " + needle, "estilos catalogo"));

[
  "Catalogo visual de libreria movil",
  "Reglas de uso por componente",
  "Modelo offline y sincronizacion como patron de interfaz"
].forEach((needle) => requireContains(doc, needle, "documento base"));

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("OK contrato de catalogo de libreria movil");
