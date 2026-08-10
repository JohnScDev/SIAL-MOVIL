const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const failures = [];
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const html = read("finca/consulta-pallets.html");
const js = read("finca/consulta-pallets.js");
const css = read("finca/consulta-pallets.css");
const home = read("app/home.html");
const core = read("shared/sial-mobile-core.js");
const general = read("pallets/consulta-pallets.html");
const design = read("DESIGN.md");

function requireAll(source, needles, label) {
  needles.forEach((needle) => {
    if (!source.includes(needle)) failures.push(label + ": falta " + needle);
  });
}

requireAll(html, [
  "<h1>Pallets por finca</h1>",
  "data-pallet-context-farm",
  "data-farm-pallet-week",
  'data-farm-pallet-status="LISTO_PARA_CARGUE"',
  'data-farm-pallet-status="CARGADO"',
  'data-farm-pallet-status="all"',
  "../pallets/consulta-pallets.js",
  "Solo consulta"
], "Vista por finca");
requireAll(js, [
  'defaultStatus = "LISTO_PARA_CARGUE"',
  "function syncControls",
  "function setStatus",
  "MutationObserver"
], "Comportamiento por finca");
requireAll(css, [
  ".farm-pallet-context",
  ".farm-pallet-status",
  'button[aria-pressed="true"]'
], "Estilos por finca");
requireAll(home, ['href="../finca/consulta-pallets.html"'], "Acceso Inicio");
requireAll(core, [
  'href: "../finca/consulta-pallets.html"',
  'href: "../pallets/consulta-pallets.html"'
], "Menú independiente");
requireAll(general, ["Consulta Pallet", "data-pallet-status"], "Consulta general conservada");
requireAll(design, [
  "La consulta general de pallets y la consulta por finca son rutas independientes",
  "bloquea la finca según el contexto activo"
], "Contrato de diseño");

["<form", "Crear pallet", "Editar pallet", "Cargar pallet"].forEach((forbidden) => {
  if (html.includes(forbidden)) failures.push("La vista de consulta contiene acción no permitida: " + forbidden);
});

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("OK consulta móvil de pallets por finca");
