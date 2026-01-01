const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".html"));

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
let problems = 0;
console.log("Scanning", files.length, "HTML files in", dir);
files.forEach((file) => {
  const filePath = path.join(dir, file);
  const content = fs.readFileSync(filePath, "utf8");
  const issues = [];
  tagsToCheck.forEach((tag) => {
    const open = (content.match(new RegExp("<" + tag + "\\b", "gi")) || [])
      .length;
    const close = (content.match(new RegExp("</" + tag + ">", "gi")) || [])
      .length;
    if (open !== close) {
      let sample = "";
      if (open === 0 && close > 0) {
        const idx = content.indexOf("</" + tag + ">");
        const start = Math.max(0, idx - 80);
        const end = Math.min(content.length, idx + 80);
        sample =
          "\n    sample: " +
          JSON.stringify(content.slice(start, end).replace(/\s+/g, " ")).slice(
            0,
            200
          ) +
          "...";
      }
      issues.push({ tag, open, close, sample });
    }
  });
  if (issues.length) {
    console.log("\nFile:", file);
    issues.forEach((it) => {
      console.log(
        `  <${it.tag}>: ${it.open} vs </${it.tag}>: ${it.close}${
          it.sample || ""
        }`
      );
    });
    problems++;
  }
});

if (!problems) console.log("\nNo mismatches detected");
else console.log(`\n${problems} files with mismatches`);
