const fs = require("fs");
const path = require("path");

function listHtmlFiles(dir) {
  return fs.readdirSync(dir).filter((f) => f.endsWith(".html"));
}

function countOccurrences(content, regex) {
  const match = content.match(regex);
  return match ? match.length : 0;
}

const tagsToCheck = [
  "div",
  "section",
  "main",
  "header",
  "footer",
  "nav",
  "ul",
  "li",
  "article",
  "aside",
  "form",
];
const root = process.cwd();
const files = listHtmlFiles(root);
let problems = 0;

console.log("Checking HTML structure for", files.length, "files...");
for (const file of files) {
  const filePath = path.join(root, file);
  const content = fs.readFileSync(filePath, "utf8");
  const issues = [];
  for (const tag of tagsToCheck) {
    const open = countOccurrences(content, new RegExp("<" + tag + "\b", "gi"));
    const close = countOccurrences(content, new RegExp("</" + tag + ">", "gi"));
    if (open !== close) {
      // if opens are zero but closes exist, include a short sample for debugging
      let sample = "";
      if (open === 0 && close > 0) {
        const idx = content.indexOf("</" + tag + ">");
        const start = Math.max(0, idx - 80);
        const end = Math.min(content.length, idx + 80);
        sample =
          "\n    sample around first closing tag: " +
          JSON.stringify(content.slice(start, end).replace(/\s+/g, " ")).slice(
            0,
            200
          ) +
          "...";
      }
      issues.push({ tag, open, close, sample });
    }
  }
  if (issues.length) {
    problems++;
    console.log("\nFile:", file);
    for (const it of issues) {
      console.log(
        `  <${it.tag}> vs </${it.tag}>: ${it.open} vs ${it.close}${
          it.sample || ""
        }`
      );
    }
  }
}

if (!problems) {
  console.log("\nNo tag-count mismatches detected.");
} else {
  console.log(`\nDetected ${problems} files with tag-count mismatches.`);
}
