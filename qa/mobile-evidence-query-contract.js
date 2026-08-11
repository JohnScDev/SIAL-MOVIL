const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "trazabilidad", "evidencias.html"), "utf8");
const css = fs.readFileSync(path.join(root, "trazabilidad", "evidencias.css"), "utf8");
const js = fs.readFileSync(path.join(root, "trazabilidad", "evidencias.js"), "utf8");
const core = fs.readFileSync(path.join(root, "shared", "sial-mobile-core.js"), "utf8");

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

expect(html.includes("Expediente operativo"), "Falta el concepto de expediente operativo.");
expect(html.includes("data-operation-search"), "Falta el buscador de operaciones.");
expect(html.includes('data-workbench-tab="trace"'), "Falta la sección de trazabilidad.");
expect(html.includes('data-workbench-tab="evidence"'), "Falta la sección de evidencias.");
expect(html.includes("data-trace-list"), "Falta la línea de trazabilidad.");
expect(html.includes("Puntos de control"), "Faltan los controles del evento.");
expect(html.includes("Comentarios y anotaciones"), "Faltan los comentarios del evento.");
expect(html.includes("data-evidence-detail"), "Falta el detalle móvil de evidencia.");
expect(html.includes("Solo consulta"), "La vista debe declarar su propósito de solo consulta.");
expect(!html.includes("Aprobar evidencias"), "La consulta móvil no debe aprobar evidencias.");
expect(js.includes("function openDetail"), "Falta la apertura del detalle de evidencia.");
expect(js.includes("mountModalLayer"), "El detalle debe usar la capa modal compartida.");
expect(js.includes("function selectOperation"), "Falta la selección de operación.");
expect(js.includes("function renderTimeline"), "Falta la trazabilidad por evento.");
expect(js.includes("function renderEventRecord"), "Falta el expediente detallado del evento.");
expect(css.includes(".operation-timeline"), "Falta la línea temporal móvil.");
expect(css.includes(".event-photo-strip"), "Falta la tira de evidencias asociadas al evento.");
expect(css.includes("scroll-snap-type"), "La tira debe facilitar navegación táctil.");
expect(core.includes('label: "Evidencias operativas"'), "La vista debe estar incluida en el menú global.");

console.log("OK expediente móvil de operación y evidencias");
