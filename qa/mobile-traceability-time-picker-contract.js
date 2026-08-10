const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const failures = [];
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const core = read("shared/sial-mobile-core.js");
const coreCss = read("shared/sial-mobile-core.css");
const queryCss = read("shared/sial-mobile-query.css");
const palletHtml = read("pallets/armar-pallet.html");
const vehicleHtml = read("finca/consulta-vehiculos.html");
const vehicleJs = read("finca/consulta-vehiculos.js");
const containerHtml = read("finca/consulta-contenedores.html");
const containerJs = read("finca/consulta-contenedores.js");
const library = read("libreria/sial-mobile-library.js");
const design = read("DESIGN.md");

function requireAll(source, needles, label) {
  needles.forEach((needle) => {
    if (!source.includes(needle)) failures.push(label + ": falta " + needle);
  });
}

requireAll(core, [
  "function openTimePicker",
  "function mountTimePickers",
  "function setTimePickerValue",
  "currentTimeValue",
  "Usar esta hora",
  "input[type=\"time\"]"
], "Selector compartido");
requireAll(coreCss, [
  ".sial-time-input",
  ".sial-time-picker-display",
  ".sial-time-picker-columns",
  ".sial-time-select",
  "font-variant-numeric: tabular-nums"
], "Estilo selector");
requireAll(palletHtml, [
  'id="hu591-start-time"',
  'id="hu591-end-time"',
  'type="time"'
], "HU591");
requireAll(library, [
  "installTimePickerDemo",
  "data-library-time-picker",
  "mountTimePickers"
], "Librería");
requireAll(design, [
  "SialMobileUI.openTimePicker",
  'input[type="time"]',
  "### 9.5 Relaci"
], "Contrato de diseño");

[core, coreCss, vehicleHtml, containerHtml, library, design].forEach((source, index) => {
  if (source.includes("data-sial-live-clock") || source.includes("mountLiveClocks")) {
    failures.push("Reloj informativo residual en fuente " + index);
  }
});

requireAll(vehicleHtml, ["Trazabilidad veh", "placa, contenedor"], "Vista vehículos");
requireAll(containerHtml, ["Trazabilidad contenedores", "Contenedor, placa"], "Vista contenedores");
requireAll(vehicleJs, ["containerScheduleId", "linkedContainerHref", "traceRows", "dateTimeTemplate", 'params.get("vehicle")'], "Relación desde vehículos");
requireAll(containerJs, ["vehicleOperationId", "linkedVehicleHref", "dateTimeTemplate", 'params.get("container")'], "Relación desde contenedores");
requireAll(queryCss, [".sial-query-relation", ".sial-query-related-link", ".sial-query-time", ".sial-trace-event"], "Estilos trazabilidad");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("OK selector de hora y trazabilidad relacionada");
