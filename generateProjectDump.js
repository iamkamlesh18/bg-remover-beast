const fs = require("fs");
const path = require("path");

const OUTPUT_FILE = "project_dump.txt";

const EXCLUDE = [
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  "coverage",
  ".env",
  ".DS_Store",
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock"
];

let output = "";

/* -------- TREE -------- */

function generateTree(dir, prefix = "") {
  const files = fs.readdirSync(dir);

  files.forEach((file, index) => {
    if (EXCLUDE.includes(file)) return;

    const fullPath = path.join(dir, file);
    const isLast = index === files.length - 1;
    const connector = isLast ? "└── " : "├── ";

    output += `${prefix}${connector}${file}\n`;

    if (fs.statSync(fullPath).isDirectory()) {
      generateTree(fullPath, prefix + (isLast ? "    " : "│   "));
    }
  });
}

/* -------- FILE CONTENT -------- */

function collectFiles(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    if (EXCLUDE.includes(file)) return;

    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      collectFiles(fullPath);
    } else {
      const ext = path.extname(file);

      if (
        [".js", ".jsx", ".ts", ".tsx", ".css", ".md"].includes(ext)
      ) {
        const content = fs.readFileSync(fullPath, "utf8");

        output += `\n================================\n`;
        output += `FILE: ${fullPath}\n`;
        output += `================================\n\n`;
        output += content + "\n";
      }
    }
  });
}

/* -------- RUN -------- */

output += "PROJECT STRUCTURE\n\n";

generateTree(".");
collectFiles(".");

fs.writeFileSync(OUTPUT_FILE, output);

console.log("✅ Project dump generated → project_dump.txt");