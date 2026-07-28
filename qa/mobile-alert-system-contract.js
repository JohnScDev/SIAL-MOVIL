"use strict";

const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const core = read("shared/sial-mobile-core.js");
const css = read("shared/sial-mobile-core.css");
const library = read("libreria/sial-mobile-library.js");
const cameraDemo = read("demo-camara.html");

[
  "function feedbackTypeMeta",
  "function createFeedbackIdentity",
  "function hydrateAlertStatuses",
  "function observeAlertStatuses",
  "function openDecisionSheet",
  "openDecisionSheet,",
  "sial-alert-card",
  "sial-decision-alert"
].forEach((needle) => assert.ok(core.includes(needle), "Falta contrato JS de alertas: " + needle));

[
  ".sial-alert-card",
  ".sial-feedback-identity",
  ".sial-feedback-symbol",
  ".sial-decision-alert",
  ".sial-dialog-eyebrow"
].forEach((needle) => assert.ok(css.includes(needle), "Falta estilo del sistema de alertas: " + needle));

["info", "success", "warning", "error"].forEach((type) => {
  assert.ok(library.includes('type: "' + type + '"'), "El catalogo no demuestra la variante " + type);
});

assert.ok(library.includes("SialMobileUI.setInlineStatus"), "El catalogo debe demostrar la alerta contextual.");
assert.ok(library.includes("SialMobileUI.openDecisionSheet"), "El catalogo debe demostrar la hoja de decision.");
const feedbackFactory = core.slice(
  core.indexOf("function feedbackIconMarkup"),
  core.indexOf("function appendFeedbackText")
);
assert.ok(feedbackFactory.includes('createElementNS("http://www.w3.org/2000/svg", "svg")'), "Las alertas deben usar iconografia SVG semantica.");
assert.ok(!feedbackFactory.includes("isotipo-sial.svg"), "Las alertas no deben repetir el isotipo SIAL.");
assert.ok(!feedbackFactory.includes('createElement("img")'), "La identidad de alerta no debe depender de una imagen de marca.");
assert.ok(core.includes('identity.classList.add("is-compact")'), "Toast y banner deben usar iconografia semantica compacta.");
assert.ok(css.includes("min-height: 76px"), "El toast debe tener mayor presencia visual.");
assert.ok(css.includes("width: min(calc(100vw - 24px), 560px)"), "El toast debe aprovechar mejor el ancho movil.");
const feedbackStyles = css.slice(
  css.indexOf(".sial-alert-card {"),
  css.indexOf("@keyframes sial-toast-in")
);
assert.ok(!feedbackStyles.includes("border-left:"), "Las alertas no deben usar un borde lateral grueso.");
assert.ok(!css.includes(".sial-decision-alert::before"), "Las alertas de decision no deben usar una franja semantica superior.");
assert.ok(core.includes('openDecisionSheet({\n      id: "unsaved-navigation"'), "La salida con cambios debe usar hoja de decision.");
assert.ok(core.includes('openDecisionSheet({\n        id: "camera-discard-confirm"'), "El descarte de fotos debe usar hoja de decision.");
assert.ok(cameraDemo.includes('src="shared/sial-mobile-core.js"'), "La demo de camara debe consumir la libreria compartida.");
assert.ok(!cameraDemo.includes("alert("), "No deben quedar alertas nativas en la demo de camara.");

function collectHtml(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === ".git" || entry.name === "qa") return [];
      return collectHtml(fullPath);
    }
    return path.extname(entry.name) === ".html" ? [fullPath] : [];
  });
}

collectHtml(root).forEach((file) => {
  const source = fs.readFileSync(file, "utf8");
  assert.ok(source.includes("sial-mobile-core.js"), path.relative(root, file) + " debe consumir la libreria compartida.");
});

console.log("Contrato del sistema principal de alertas SIAL: OK");
