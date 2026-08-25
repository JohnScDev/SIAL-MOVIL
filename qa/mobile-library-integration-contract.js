"use strict";

const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const core = read("shared/sial-mobile-core.js");
const coreCss = read("shared/sial-mobile-core.css");
const library = read("libreria/sial-mobile-library.js");
const libraryCss = read("libreria/sial-mobile-library.css");
const readme = read("README.md");
const design = read("DESIGN.md");
const patternMap = read("libreria/patrones-de-diseno-movil.md");
const hu342 = read("puerto-ze/hu342-descarga-pallets.html");
const hu344 = read("pallets/rearmar-pallet.html");
const hu347 = read("puerto-ze/hu347-cargue-consolidado.html");
const hu347Script = read("puerto-ze/hu347-cargue-consolidado.js");

[
  "function mountTabs",
  "function mountSegmentedControls",
  "function mountOtpGroups",
  "function mountSignaturePad",
  "function setEvidenceProgress",
  "function setSyncState"
].forEach((needle) => assert.ok(core.includes(needle), "Falta API integrada: " + needle));

[
  "mountTabs,",
  "mountSegmentedControls,",
  "mountOtpGroups,",
  "mountSignaturePad,",
  "setEvidenceProgress,",
  "setSyncState,"
].forEach((needle) => assert.ok(core.includes(needle), "La API no esta publicada: " + needle));

[
  ".sial-signature-canvas",
  ".sial-signature-actions",
  '.sial-signature-pad[data-signature-state="confirmed"]',
  ".sial-sync-item.syncing::before"
].forEach((needle) => assert.ok(coreCss.includes(needle), "Falta estilo funcional: " + needle));

[
  ".sial-operation-ticket",
  ".sial-flow-stepper",
  ".sial-selectable-row",
  ".sial-capacity-meter",
  ".sial-submit-summary"
].forEach((needle) => assert.ok(coreCss.includes(needle), "Falta composición operativa compartida: " + needle));

assert.ok(hu342.includes("sial-operation-ticket") && hu342.includes("sial-flow-stepper"), "HU342 no consume el contexto y secuencia compartidos");
assert.ok(hu344.includes("sial-flow-stepper") && hu344.includes("sial-capacity-meter"), "HU344 no consume secuencia y capacidad compartidas");
assert.ok(hu347.includes("sial-operation-ticket") && hu347.includes("sial-flow-stepper") && hu347.includes("sial-capacity-meter") && hu347.includes("sial-submit-summary"), "HU347 no consume las composiciones operativas compartidas");
assert.ok(hu347Script.includes("sial-selectable-row"), "HU347 no consume la fila seleccionable compartida");

[
  "function installOperationalPatterns",
  "function installApiReference",
  "function installRecoveryFlowDemo",
  "function installSyncInteraction",
  'data-library-section="patrones-operativos"',
  'data-library-section="api-integrada"',
  "SialMobileUI.mountSignaturePad",
  "SialMobileUI.setEvidenceProgress",
  "SialMobileUI.setSyncState",
  "SialMobileUI.mountOtpGroups",
  "SialMobileUI.mountTabs",
  "SialMobileUI.mountSegmentedControls"
].forEach((needle) => assert.ok(library.includes(needle), "Catalogo no integrado: " + needle));

[
  ".library-operational-heading",
  ".library-integrated-capture",
  ".library-query-result",
  ".library-recovery-demo"
].forEach((needle) => assert.ok(libraryCss.includes(needle), "Falta estilo de catalogo integrado: " + needle));

assert.ok(readme.includes("API integrada"), "README no documenta la superficie publica viva.");
assert.ok(readme.includes("mobile-library-integration-contract.js"), "README no incluye el contrato integrado.");
assert.ok(design.includes("Auditoría de madurez visual") && design.includes("patrones-de-diseno-movil.md"), "DESIGN no enlaza el gobierno de patrones móviles.");
assert.ok(patternMap.includes("Mapa completo de vistas") && patternMap.includes("Regla de evolución y migración") && patternMap.includes("Candidato visual"), "Falta la matriz de adopción y evolución de vistas móviles.");

console.log("OK contrato de libreria movil integrada");
