const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const loginAssets = path.join(root, "assets", "login");
const css = fs.readFileSync(path.join(root, "login", "sial-mobile-login.css"), "utf8");
const js = fs.readFileSync(path.join(root, "login", "sial-mobile-login.js"), "utf8");

const requiredImages = [
  "Imagen 4.jpg",
  "Imagen 1.jpg"
];
const removedImages = [
  "login-institucional.JPG",
  "login-contexto.jpg"
];

const failures = [];

requiredImages.forEach((image) => {
  if (!fs.existsSync(path.join(loginAssets, image))) {
    failures.push(`Falta imagen de login: ${image}`);
  }
  if (!js.includes(image)) {
    failures.push(`La rotacion no incluye: ${image}`);
  }
});

removedImages.forEach((image) => {
  if (fs.existsSync(path.join(loginAssets, image))) {
    failures.push(`La carpeta assets/login conserva imagen anterior: ${image}`);
  }
  if (js.includes(image) || css.includes(image)) {
    failures.push(`La propuesta sigue referenciando imagen anterior: ${image}`);
  }
});

[
  "--login-active-image",
  "--login-image-position",
  "82% 78%",
  "login-bg-transition"
].forEach((needle) => {
  if (!css.includes(needle)) failures.push(`CSS login no define ${needle}`);
});

[
  "5000",
  "setInterval",
  "setLoginBackground",
  "prefers-reduced-motion"
].forEach((needle) => {
  if (!js.includes(needle)) failures.push(`JS login no define ${needle}`);
});

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("OK contrato rotacion imagenes login");
