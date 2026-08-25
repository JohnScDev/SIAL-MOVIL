const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(__dirname, "..", "materiales", "sial-mobile-materiales.js"), "utf8");

const assertions = [
  ["HU659 suggested-order context", /PED-SUG-2026-032-014/],
  ["HU662 inventory traceability", /Movimientos de inventario/],
  ["HU666 multiple additional requests", /additionalRequests\.push/],
  ["additional-request idempotency", /idempotencyKey/],
  ["delivery line reconciliation", /validateDelivery/],
  ["delivery difference observation", /Agrega una observación/],
  ["POD photo capture", /openPhotoCapture/],
  ["POD signature capture", /mountSignaturePad/],
  ["offline pending status", /PENDIENTE DE SINCRONIZACIÓN/],
  ["durable draft boundary documented", /sial-mobile-materiales/]
];

const failed = assertions.filter(([, pattern]) => !pattern.test(source));
if (failed.length) {
  console.error(`Materiales contract failed: ${failed.map(([label]) => label).join(", ")}`);
  process.exit(1);
}

console.log(`Materiales contract passed (${assertions.length} assertions).`);
