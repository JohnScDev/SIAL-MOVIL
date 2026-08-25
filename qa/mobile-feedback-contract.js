"use strict";

const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8").replace(/\r\n/g, "\n");
const core = read("shared/sial-mobile-core.js");
const css = read("shared/sial-mobile-core.css");
const flow = read("shared/sial-mobile-flow.js");
const hu1431 = read("puerto-ze/hu1431-despacho-contenedor-finca.html");
const hu591 = read("pallets/armar-pallet.html") + read("pallets/armar-pallet.js");
const hu332 = read("pallets/cargar-pallets.html");
const library = read("libreria/sial-mobile-library.js");
const materials = read("materiales/sial-mobile-materiales.js");

[
  "function mountModalLayer",
  "function unmountModalLayer",
  "function handleModalLayerKeydown",
  'panel.setAttribute("aria-labelledby"',
  'panel.setAttribute("aria-describedby"',
  'dismissible: dismissible',
  'options.action.onClick',
  'mountModalLayer(overlay',
  'role", "dialog"'
].forEach((needle) => assert.ok(core.includes(needle), "Falta contrato compartido: " + needle));

assert.ok(css.includes(".sial-banner-action"), "El banner debe exponer una accion tactil.");
assert.ok(core.includes("function revealValidationError"), "Los errores deben revelar y enfocar el punto corregible.");
assert.ok(core.includes('document.addEventListener("invalid"'), "Los formularios nativos deben redirigir al primer campo invalido.");
assert.ok(core.includes("function ensureFormValidationStatus"), "Cada formulario debe poder mostrar un error contextual.");
assert.ok(core.includes('field: options.field || options.focusTarget'), "El estado inline debe aceptar el campo relacionado.");
assert.ok(css.includes(".sial-error-target"), "El destino del error debe respetar margen de desplazamiento.");
assert.ok(flow.includes('type: "error",\n        title: firstInvalid'), "Las validaciones operativas deben presentarse como errores bloqueantes.");
assert.ok(css.includes(".sial-btn-danger"), "Los dialogos deben distinguir acciones destructivas.");
assert.ok(css.includes(".sial-container-option:disabled"), "Los contenedores incompatibles deben verse deshabilitados.");
assert.ok(flow.includes('id: "network-offline"'), "La desconexion debe usar banner persistente.");
assert.ok(flow.includes('id: "sync-event"'), "La sincronizacion debe usar banner persistente.");
assert.ok(flow.includes("showFlowBlocked();"), "Los bloqueos globales deben usar banner.");
assert.ok(!flow.includes('title: "Flujo bloqueado"'), "No debe quedar el toast generico de flujo bloqueado.");
assert.ok(!flow.includes('showToast({ type: "error", title: "No encontrado"'), "La busqueda no debe duplicar inline y toast.");
assert.ok(flow.includes("Impide continuar la operaci"), "La novedad debe explicar el efecto de bloqueo.");
assert.ok(flow.includes("Volver a tomar foto"), "El visor debe usar una accion explicita.");
assert.ok(hu1431.includes("option.disabled = !item.available"), "HU1431 debe deshabilitar opciones incompatibles.");
assert.ok(hu1431.includes("dismissible: false"), "La seleccion inicial HU1431 debe ser obligatoria.");
assert.ok(hu591.includes("SialMobileUI.setInlineStatus"), "HU591 debe dirigir al error contextual.");
assert.ok(hu332.includes("SialMobileUI.setInlineStatus"), "HU332 debe dirigir al error contextual.");
assert.ok(hu1431.includes("SialMobileUI.setInlineStatus"), "HU1431 debe dirigir al error contextual.");
assert.ok(library.includes("action:"), "La libreria debe demostrar banners accionables.");
assert.ok(core.includes("Descartar fotos"), "La camara debe confirmar el descarte de fotografias capturadas.");
assert.ok(materials.includes("data-material-pod-status"), "Materiales debe mostrar la validacion POD dentro de la vista.");
assert.ok(materials.includes("setInlineStatus"), "Materiales no debe usar toast para la evidencia POD pendiente.");
assert.ok(!materials.includes('toast("warning", "POD requerido"'), "La validacion POD no debe duplicarse como toast.");

console.log("Contrato de feedback y capas moviles: OK");
