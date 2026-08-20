const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const html = read("pallets/rearmar-pallet.html");
const css = read("pallets/hu344.css");
const script = read("pallets/hu344.js");
const core = read("shared/sial-mobile-core.js");
const sync = read("trazabilidad/sincronizacion.js");

const checks = [
  [html.includes("HU344 · Por referencia en ZE"), "La vista identifica la HU344 y su contexto ZE."],
  [!html.includes("data-hu344-operation-select") && !script.includes("selectOperation"), "La vista no exige seleccionar previamente una operación."],
  [html.includes("data-hu344-select-base") && script.includes("openPalletPicker") && script.includes("selectedPallets"), "Los pallets de origen se seleccionan directamente como conjunto."],
  [script.includes("palletType") && script.includes('palletType: "INCOMPLETE"') && script.includes('palletType: "MIXED"'), "El inventario diferencia pallets incompletos y mixtos recibidos desde finca."],
  [!html.includes("data-hu344-mode") && !html.includes("Tipo de rearmado"), "Incompleto y mixto no se presentan como tipos de resultado."],
  [script.includes("draft.push(sscc)") && script.includes("draft.splice(index, 1)"), "El selector permite agregar y retirar múltiples pallets antes de confirmar."],
  [!script.includes("item.operationId !== scope") && script.includes("Cada pallet conserva los datos de su operación"), "La selección múltiple no queda bloqueada por una operación elegida previamente."],
  [script.includes("data-hu344-picker-search") && script.includes("searchableText"), "El selector permite buscar por SSCC, referencia o finca."],
  [script.includes('data-hu344-picker-filter="INCOMPLETE"') && script.includes('data-hu344-picker-filter="MIXED"'), "El selector filtra el inventario por pallets incompletos o mixtos."],
  [script.includes("data-hu344-picker-scan") && script.includes("scanBasePallet") && script.includes("openBarcodeScanner"), "El selector permite agregar pallets mediante escaneo."],
  [script.includes("no corresponde a un pallet disponible en ZE"), "El escáner rechaza códigos que no pertenecen al inventario disponible."],
  [html.includes("data-hu344-base-list") && script.includes("data-hu344-remove-base"), "La vista conserva y permite gestionar múltiples orígenes."],
  [html.includes("data-hu344-result-list") && html.includes("data-hu344-add-result"), "La vista permite construir múltiples pallets resultado."],
  [script.includes("data-hu344-result-boxes") && script.includes("resetResults"), "Las cajas se distribuyen y pueden ajustarse por resultado."],
  [script.includes("item.reference === result.reference") && script.includes("Cada pallet resultado debe conservar una única referencia"), "Los resultados nunca mezclan referencias diferentes."],
  [html.includes("data-hu344-lineage") && script.includes("allocationPlan"), "La vista construye el linaje origen-resultado por asignación."],
  [html.includes("data-flow-error") && html.includes("Confirmar rearmado"), "La acción final dispone de validación visible."],
  [script.includes("totalOriginBoxes() !== totalResultBoxes()") && script.includes("validateResultSscc"), "Se validan conciliación exacta y unicidad de cada resultado."],
  [script.includes("originCount") && script.includes("resultCount"), "El registro soporta relaciones uno-a-muchos, muchos-a-uno y muchos-a-muchos."],
  [script.includes("operations: operationIds") && script.includes("operationId: item.operationId"), "Cada origen conserva su operación cuando el rearmado combina varios pallets."],
  [script.includes("CONSUMIDO_TOTAL"), "Se conserva el consumo de cada pallet origen."],
  [script.includes("LOCAL_PENDING_SYNC") && script.includes("sial-mobile-sync-queue"), "El registro se integra a la revisión de sincronización."],
  [script.includes("sourceLineage") && script.includes("crossDockingReassemblies"), "El estado local conserva linaje del rearmado."],
  [script.includes("hydrateInventoryAdjustments") && script.includes("inventoryAdjustments"), "Los consumos de origen sobreviven a una recarga de la vista."],
  [css.includes(".hu344-lineage-map") && css.includes("prefers-reduced-motion"), "El linaje es responsive y respeta reducción de movimiento."],
  [css.includes(".hu344-base-picker") && css.includes(".hu344-picker-filters"), "Los filtros del selector conservan el lenguaje visual móvil."],
  [(core.match(/HU344 - Rearmar pallets en ZE/g) || []).length >= 2, "La ruta está disponible desde ZE y desde Pallets."],
  [sync.includes('match: ["HU591", "HU344"]'), "Sincronización clasifica HU344 dentro de Pallets."],
  [!html.includes("Generar SSCC"), "HU344 no incorpora generación de SSCC no aprobada."],
  [!html.includes("Re-etiquetar"), "HU344 permanece separado del re-etiquetado."],
  [!html.includes("Compatibilidad objetivo"), "La compatibilidad no se presenta como información fija inventada."],
  [!html.includes("Cliente") && !html.includes("Certificación"), "La vista no muestra cliente ni certificación."]
];

const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  failed.forEach(([, message]) => console.error("FAIL", message));
  process.exit(1);
}

console.log("OK contrato móvil HU344 - rearmado de pallets en ZE");
