const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const failures = [];

function collectFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (["qa", "libreria"].includes(entry.name)) return [];
      return collectFiles(fullPath);
    }
    return [fullPath];
  });
}

collectFiles(root)
  .filter((file) => [".html", ".js"].includes(path.extname(file)))
  .forEach((file) => {
    const source = fs.readFileSync(file, "utf8");
    if (/\bdemo\b/i.test(source)) {
      failures.push(`Vista principal contiene referencia demo: ${path.relative(root, file)}`);
    }
  });

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("OK vistas principales sin opciones demo");
