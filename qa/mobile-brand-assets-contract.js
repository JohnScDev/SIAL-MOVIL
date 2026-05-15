const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const brandDir = path.join(root, "assets", "brand");
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function collectHtml(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "qa") return [];
      return collectHtml(fullPath);
    }
    return path.extname(fullPath) === ".html" ? [fullPath] : [];
  });
}

[
  "isotipo-sial.svg",
  "logo-horizontal-sial.svg",
  "aplicacion-fondo-oscuro-sial.svg",
  "isotipo-sial-monocromo.svg",
  "monograma-sial-s.svg"
].forEach((asset) => {
  if (!fs.existsSync(path.join(brandDir, asset))) fail(`Falta activo de marca: assets/brand/${asset}`);
});

const manifestPath = path.join(root, "manifest.webmanifest");
if (!fs.existsSync(manifestPath)) {
  fail("Falta manifest.webmanifest para icono de aplicacion");
} else {
  const manifest = read(manifestPath);
  ["SIAL Movil", "assets/brand/isotipo-sial.svg", "theme_color"].forEach((needle) => {
    if (!manifest.includes(needle)) fail(`Manifest incompleto: falta ${needle}`);
  });
}

const css = read(path.join(root, "shared", "sial-mobile-core.css"));
[
  ".sial-auth-logo",
  ".sial-auth-wordmark",
  "--sial-auth-wordmark-color",
  "--sial-auth-caption-color",
  "--sial-app-isotype-size: 46px",
  "--sial-page-isotype-size: 40px",
  "--sial-isotype-plate-bg",
  "--sial-isotype-plate-border",
  ".sial-app-isotype",
  ".sial-app-isotype::before",
  ".sial-app-isotype img"
].forEach((selector) => {
  if (!css.includes(selector)) fail(`CSS marca incompleto: falta ${selector}`);
});

const htmlFiles = collectHtml(root);
htmlFiles.forEach((file) => {
  const source = read(file);
  const rel = path.relative(root, file);
  if (!source.includes('rel="icon"')) fail(`${rel}: falta icono de pestana SVG`);
  if (!source.includes('rel="manifest"')) fail(`${rel}: falta manifest`);

  [
    { relName: "icon", label: "icono de pestana SVG" },
    { relName: "apple-touch-icon", label: "apple touch icon" },
    { relName: "manifest", label: "manifest" }
  ].forEach(({ relName, label }) => {
    const match = source.match(new RegExp(`<link rel="${relName}"[^>]*href="([^"]+)"`));
    if (!match) return;
    const targetPath = path.resolve(path.dirname(file), match[1]);
    if (!fs.existsSync(targetPath)) fail(`${rel}: ${label} apunta a archivo inexistente (${match[1]})`);
  });
});

[
  "index.html",
  path.join("login", "login-01-institucional.html"),
  path.join("login", "login-04-contexto-operativo.html"),
  path.join("login", "login-05-minimal-operativo.html")
].forEach((relativeFile) => {
  const source = read(path.join(root, relativeFile));
  if (!source.includes("sial-auth-logo")) fail(`${relativeFile}: no consume marca de autenticacion`);
  if (!source.includes("sial-auth-wordmark")) fail(`${relativeFile}: falta texto editable de marca SIAL`);
  if (!source.includes("isotipo-sial.svg")) fail(`${relativeFile}: falta isotipo en autenticacion`);
  if (source.includes("logo-horizontal-sial.svg")) fail(`${relativeFile}: conserva logo horizontal en autenticacion`);
  if (source.includes("aplicacion-fondo-oscuro-sial.svg") || source.includes("sial-logo-dark")) {
    fail(`${relativeFile}: declara dos logos en autenticacion; debe usar isotipo y texto editable`);
  }
});

[
  path.join("app", "seleccion-finca.html"),
  path.join("app", "home.html"),
  path.join("libreria", "index.html")
].forEach((relativeFile) => {
  const source = read(path.join(root, relativeFile));
  if (!source.includes("sial-app-isotype")) fail(`${relativeFile}: no consume isotipo de aplicacion`);
  if (!source.includes("isotipo-sial.svg")) fail(`${relativeFile}: falta isotipo SIAL`);
});

[
  "finca",
  "pallets",
  "puerto-ze",
  "trazabilidad"
].forEach((directoryName) => {
  collectHtml(path.join(root, directoryName)).forEach((file) => {
    const source = read(file);
    const rel = path.relative(root, file);
    if (!source.includes("sial-app-isotype")) fail(`${rel}: falta isotipo en header interno`);
    if (!source.includes("isotipo-sial.svg")) fail(`${rel}: falta activo isotipo SIAL`);
  });
});

const loginJs = read(path.join(root, "login", "sial-mobile-login.js"));
[
  "dataset.recoveryLogo",
  "isotipo-sial.svg",
  "sial-auth-wordmark"
].forEach((relativeFile) => {
  if (!loginJs.includes(relativeFile)) {
    fail(`login/sial-mobile-login.js: recuperacion no declara ${relativeFile}`);
  }
});
if (loginJs.includes("aplicacion-fondo-oscuro-sial.svg") || loginJs.includes("sial-logo-dark")) {
  fail("login/sial-mobile-login.js: recuperacion declara dos logos; debe usar isotipo y texto editable");
}
if (loginJs.includes("logo-horizontal-sial.svg")) {
  fail("login/sial-mobile-login.js: recuperacion conserva logo horizontal");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("OK contrato identidad visual SIAL movil");
