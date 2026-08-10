const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const core = fs.readFileSync(path.join(root, "shared", "sial-mobile-core.js"), "utf8");
const css = fs.readFileSync(path.join(root, "shared", "sial-mobile-core.css"), "utf8");
const design = fs.readFileSync(path.join(root, "DESIGN.md"), "utf8");

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

expect(core.includes('label: "Pallets por finca"'), "Pallets por finca debe estar incluido en el menu global.");
expect(core.includes("function normalizeDrawerSearch"), "Falta la normalizacion de busqueda del drawer.");
expect(core.includes("function updateDrawerSearch"), "Falta el filtrado de vistas del drawer.");
expect(core.includes("function mountDrawerSearch"), "Falta montar el buscador compartido del drawer.");
expect(core.includes('data-drawer-search>'), "Falta el campo de busqueda del menu.");
expect(core.includes("data-drawer-search-empty"), "Falta el estado vacio de la busqueda.");
expect(core.includes("group.hidden = visibleInGroup === 0"), "Los grupos vacios deben ocultarse.");
expect(core.includes("mountDrawerSearch(existingDrawer)"), "El buscador debe montarse en drawers existentes.");
expect(core.includes("mountDrawerSearch(drawer)"), "El buscador debe montarse en drawers generados.");

[
  ".sial-drawer-search",
  ".sial-drawer-search-box",
  ".sial-drawer-search-status",
  ".sial-drawer-search-empty"
].forEach((selector) => {
  expect(css.includes(selector), "Faltan estilos para " + selector + ".");
});

expect(
  design.includes("drawer global mantiene un buscador visible"),
  "DESIGN.md debe documentar el buscador global."
);

console.log("OK mobile drawer search contract");

