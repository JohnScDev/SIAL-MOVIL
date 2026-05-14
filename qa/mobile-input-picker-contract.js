const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const coreCss = fs.readFileSync(path.join(root, "shared", "sial-mobile-core.css"), "utf8");
const coreJs = fs.readFileSync(path.join(root, "shared", "sial-mobile-core.js"), "utf8");
const loginJs = fs.readFileSync(path.join(root, "login", "sial-mobile-login.js"), "utf8");
const catalogHtml = fs.readFileSync(path.join(root, "libreria", "index.html"), "utf8");
const loginFiles = [
  path.join(root, "index.html"),
  path.join(root, "login", "login-01-institucional.html"),
  path.join(root, "login", "login-04-contexto-operativo.html"),
  path.join(root, "login", "login-05-minimal-operativo.html")
];

const failures = [];

function fail(message) {
  failures.push(message);
}

[
  "openMobilePicker",
  "content",
  "variant: \"sheet\""
].forEach((needle) => {
  if (!coreJs.includes(needle)) fail(`API movil incompleta: falta ${needle}`);
});

[
  ".sial-picker-trigger",
  ".sial-picker-list",
  ".sial-picker-option",
  ".sial-picker-search"
].forEach((selector) => {
  if (!coreCss.includes(selector)) fail(`CSS selector movil incompleto: falta ${selector}`);
});

[
  "data-library-picker",
  "SialMobileUI.openMobilePicker",
  "Selector movil"
].forEach((needle) => {
  if (!catalogHtml.includes(needle)) fail(`Catalogo sin selector movil: falta ${needle}`);
});

[
  { needle: "data-recover-access", source: "html" },
  { needle: "openAccessRecovery", source: "js" },
  { needle: "closeDialog(\"access-recovery\")", source: "js" },
  { needle: "data-recovery-stepper", source: "js" },
  { needle: "data-recovery-otp", source: "js" },
  { needle: "data-recovery-resend", source: "js" },
  { needle: "Recuperar contrasena", source: "js" },
  { needle: "Verificar codigo de seguridad", source: "js" },
  { needle: "Crear nueva contrasena", source: "js" },
  { needle: "Guardar contrasena", source: "js" },
  { needle: "one-time-code", source: "js" },
  { needle: "inputmode=\"email\"", source: "html" },
  { needle: "autocomplete=\"username\"", source: "html" },
  { needle: "autocapitalize=\"none\"", source: "html" },
  { needle: "spellcheck=\"false\"", source: "html" }
].forEach(({ needle, source: sourceType }) => {
  const source = sourceType === "js" ? loginJs : loginFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
  if (!source.includes(needle)) fail(`Login movil incompleto: falta ${needle}`);
});

if (loginJs.includes("Flujo movil alineado")) {
  fail("Login movil contiene texto de contexto interno: Flujo movil alineado");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("OK contrato inputs, selector movil y recuperar acceso");
