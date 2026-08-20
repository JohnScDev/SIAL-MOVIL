"use strict";

const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const hu342Html = read("puerto-ze/hu342-descarga-pallets.html");
const hu342Js = read("puerto-ze/hu342-descarga-pallets.js");
const hu344Html = read("pallets/rearmar-pallet.html");
const hu344Js = read("pallets/hu344.js");
const hu347Html = read("puerto-ze/hu347-cargue-consolidado.html");
const hu347Js = read("puerto-ze/hu347-cargue-consolidado.js");
const css = read("puerto-ze/hu342-hu347.css");
const flow = read("shared/sial-mobile-flow.js");
const core = read("shared/sial-mobile-core.js");
const reception = read("puerto-ze/recepcion-ze-retorno.html");
const dispatch = read("puerto-ze/despacho-puerto.html");
const sync = read("trazabilidad/sincronizacion.js");

[
  "HU342 · Recepción física en ZE",
  "data-hu342-container-map",
  "data-hu342-classification",
  'data-classification="COMPLETE"',
  'data-classification="INCOMPLETE"',
  'data-classification="NOVELTY"',
  'data-classification="REJECTED"',
  'data-add-photo="hu342-puertas"',
  'data-add-photo="hu342-zona-descarga"',
  'data-event="zePalletUnload"'
].forEach((needle) => assert.ok(hu342Html.includes(needle), `HU342 debe incluir ${needle}.`));

assert.ok(hu342Js.includes("SialMobileUI.openBarcodeScanner"), "HU342 debe reutilizar el escáner compartido.");
assert.ok(hu342Js.includes("expectedPallets.length"), "HU342 debe conciliar la totalidad esperada.");
assert.ok(hu342Js.includes("actualBoxes >= pallet.boxes"), "HU342 debe validar la cantidad de pallets incompletos.");
assert.ok(hu342Js.includes("zePalletInventory"), "HU342 debe publicar inventario consumible por consolidación.");
assert.ok(hu342Js.includes("REQUIRES_REASSEMBLY"), "HU342 debe separar pallets que requieren rearmado.");
assert.ok(hu342Js.includes("AVAILABLE_FOR_CONSOLIDATION"), "HU342 debe identificar pallets aptos.");
assert.ok(hu342Html.includes("../pallets/rearmar-pallet.html"), "HU342 debe continuar hacia HU344.");

assert.ok(hu344Html.includes("Descargar") && hu344Html.includes("Rearmar") && hu344Html.includes("Consolidar"), "HU344 debe ocupar el segundo paso del proceso.");
assert.ok(hu344Html.includes("../puerto-ze/hu342-descarga-pallets.html"), "HU344 debe volver a HU342.");
assert.ok(hu344Html.includes("../puerto-ze/hu347-cargue-consolidado.html"), "HU344 debe continuar hacia HU347.");
assert.ok(hu344Js.includes("loadWorkflowInventory") && hu344Js.includes('item.status === "REQUIRES_REASSEMBLY"'), "HU344 debe consumir el inventario que requiere rearmado desde HU342.");
assert.ok(hu344Js.includes("updateWorkflowInventory") && hu344Js.includes('status: "AVAILABLE_FOR_CONSOLIDATION"'), "HU344 debe publicar su resultado para HU347.");
assert.ok(hu344Js.includes("zePalletReassembly: true") && hu344Js.includes('event: "zePalletReassembly"'), "HU344 debe completar el evento intermedio del flujo.");

[
  "HU347 · Contenedor final ZE",
  "data-hu347-eligible-list",
  "data-hu347-stowage-map",
  "Loading plan y referencias conciliados",
  "Capacidad y distribución verificadas",
  "Inspecciones y liberación vigentes",
  'data-add-photo="hu347-estiba-final"',
  'data-add-photo="hu347-sello-final"',
  'data-event="zeConsolidatedLoad"'
].forEach((needle) => assert.ok(hu347Html.includes(needle), `HU347 debe incluir ${needle}.`));

assert.ok(hu347Js.includes("SialMobileUI.openBarcodeScanner"), "HU347 debe reutilizar el escáner compartido.");
assert.ok(hu347Js.includes("item.status === \"AVAILABLE_FOR_CONSOLIDATION\""), "HU347 solo debe consumir pallets aptos.");
assert.ok(hu347Js.includes("pallets.length !== maxPositions"), "HU347 debe bloquear una estiba incompleta.");
assert.ok(hu347Js.includes("zeConsolidatedLoad"), "HU347 debe conservar composición, sello y temperatura.");
assert.ok(hu347Js.includes("position: index + 1"), "HU347 debe registrar la posición final de cada SSCC.");
assert.ok(hu347Html.includes("../pallets/rearmar-pallet.html"), "HU347 debe volver a HU344.");
assert.ok(hu347Html.includes('data-requires="zePalletReassembly"'), "HU347 debe exigir el rearmado previo.");

assert.ok(css.includes(".ze-container-map"), "El estilo debe representar el mapa de descarga.");
assert.ok(css.includes(".ze-stowage-map"), "El estilo debe representar el mapa de estiba.");
assert.ok(css.includes("prefers-reduced-motion"), "Las vistas deben respetar reducción de movimiento.");
assert.ok(css.includes('html[data-theme="dark"]'), "Las vistas deben conservar modo oscuro.");
assert.ok(!css.includes(".ze-submit-panel"), "HU342 no debe usar una barra de acción fija ajena al patrón móvil.");
assert.ok(css.includes(".ze-form-result"), "HU342 debe mostrar el avance dentro del formulario.");
assert.ok(hu342Html.includes('sial-btn-primary sial-btn-full" type="submit" data-hu342-submit'), "La acción final de HU342 debe estar dentro de la tarjeta y ocupar todo el ancho.");

assert.ok(flow.includes('zePalletUnload: ["zeReturnReception"]'), "HU342 debe depender de la recepción retorno ZE.");
assert.ok(flow.includes('zePalletReassembly: ["zePalletUnload"]'), "HU344 debe depender de HU342.");
assert.ok(flow.includes('zeConsolidatedLoad: ["zePalletReassembly"]'), "HU347 debe depender de HU344.");
assert.ok(flow.includes('portDispatch: ["zeConsolidatedLoad"]'), "El despacho a Puerto debe depender de HU347.");
assert.ok(reception.includes('data-next="hu342-descarga-pallets.html"'), "La recepción retorno debe continuar hacia HU342.");
assert.ok(dispatch.includes('data-requires="zeConsolidatedLoad"'), "El despacho debe exigir el cargue consolidado.");
assert.ok((core.match(/HU342 - Descargar pallets/g) || []).length >= 1, "El menú debe exponer HU342.");
assert.ok((core.match(/HU344 - Rearmar pallets en ZE/g) || []).length >= 3, "El menú debe exponer HU344 dentro del ciclo y del catálogo de pallets.");
assert.ok((core.match(/HU347 - Cargue consolidado/g) || []).length >= 1, "El menú debe exponer HU347.");
assert.ok(sync.includes('match: ["HU332", "HU342", "HU347"]'), "Sincronización debe clasificar ambos eventos nuevos.");

console.log("OK contrato móvil HU342/HU344/HU347 - transferencia, rearmado y consolidación ZE");
