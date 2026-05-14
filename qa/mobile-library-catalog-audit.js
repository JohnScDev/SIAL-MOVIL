const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "libreria", "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "libreria", "sial-mobile-library.css"), "utf8");
const coreJs = fs.readFileSync(path.join(root, "shared", "sial-mobile-core.js"), "utf8");

const failures = [];

function fail(message) {
  failures.push(message);
}

function hasNestedParagraphInSpan(source) {
  const stack = [];
  const tokens = source.match(/<\/?(span|p)\b[^>]*>/gi) || [];
  return tokens.some((token) => {
    const isClose = token.startsWith("</");
    const name = token.replace(/^<\/?/, "").split(/\s|>/)[0].toLowerCase();
    if (isClose) {
      const lastIndex = stack.lastIndexOf(name);
      if (lastIndex !== -1) stack.splice(lastIndex, 1);
      return false;
    }
    if (name === "p" && stack.includes("span")) return true;
    stack.push(name);
    return false;
  });
}

function getFunctionSource(source, name) {
  const start = source.indexOf(`function ${name}`);
  if (start === -1) return "";
  const braceStart = source.indexOf("{", start);
  let depth = 0;
  for (let index = braceStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  return source.slice(start);
}

const sectionIds = Array.from(html.matchAll(/<section id="([^"]+)"[^>]*data-library-section="/g)).map((match) => match[1]);
const jumpLinks = Array.from(html.matchAll(/class="library-jump"[\s\S]*?<\/nav>/g))[0]?.[0]
  ?.match(/href="#([^"]+)"/g)
  ?.map((item) => item.replace('href="#', "").replace('"', "")) || [];

sectionIds.forEach((id) => {
  if (!jumpLinks.includes(id)) fail(`Navegacion incompleta: falta enlace a #${id}`);
});

if (hasNestedParagraphInSpan(html)) {
  fail("HTML catalogo invalido: hay <p> dentro de <span>");
}

const feedbackFactory = getFunctionSource(coreJs, "appendFeedbackText");
if (/createElement\("span"\)/.test(feedbackFactory) && /createElement\("p"\)/.test(feedbackFactory)) {
  fail("API feedback invalida: construye <p> dentro de <span>");
}

[
  "body .library-demo-card",
  "display: grid;",
  ".library-rule-grid",
  ".library-rule-card",
  ".library-component-meta",
  ".library-component-row"
].forEach((needle) => {
  if (!css.includes(needle)) fail(`CSS catalogo incompleto: falta ${needle}`);
});

[
  "Reglas de uso",
  "Usar",
  "No usar",
  "API / clase",
  "data-library-audit=\"complete\"",
  "library-rule-grid",
  "library-component-meta"
].forEach((needle) => {
  if (!html.includes(needle)) fail(`Catalogo incompleto: falta ${needle}`);
});

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("OK auditoria estatica catalogo libreria");
