"use strict";

const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const coreJs = read("shared/sial-mobile-core.js");
const coreCss = read("shared/sial-mobile-core.css");
const hu332 = read("pallets/cargar-pallets.html");
const hu591 = read("pallets/armar-pallet.html");
const libraryJs = read("libreria/sial-mobile-library.js");

assert.match(coreJs, /function openBarcodeScanner\(config\)/, "La API compartida debe implementar openBarcodeScanner.");
assert.match(coreJs, /openBarcodeScanner:\s*function/, "SialMobileUI debe publicar openBarcodeScanner.");
assert.match(coreJs, /normalizeSscc/, "La normalizacion GS1\/SSCC debe ser compartida.");
assert.match(coreCss, /\.sial-barcode-scanner-overlay/, "El overlay del escaner debe vivir en el CSS compartido.");

assert.match(hu332, /SialMobileUI\.openBarcodeScanner/, "HU332 debe consumir el escaner compartido.");
assert.doesNotMatch(hu332, /hu332-scanner-overlay|activeScanner|new BarcodeDetector/, "HU332 no debe reintroducir infraestructura local de escaneo.");

assert.match(hu591, /data-hu591-scan-sscc/, "HU591 debe exponer la accion Escanear.");
assert.match(hu591, /SialMobileUI\.openBarcodeScanner/, "HU591 debe consumir el escaner compartido.");
assert.match(hu591, /ssccSource:\s*ssccSource/, "HU591 debe conservar el origen del SSCC.");

assert.match(libraryJs, /data-library-barcode-scanner/, "La libreria debe demostrar el escaner compartido.");
assert.match(libraryJs, /SialMobileUI\.openBarcodeScanner/, "La demo debe usar la API publica.");

console.log("Contrato de escaner compartido: OK");

