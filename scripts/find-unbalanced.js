const fs = require("fs");
const path = require("path");
const files = fs
  .readdirSync(path.join(__dirname, ".."))
  .filter((f) => f.endsWith(".html"));
const tags = ["div", "section", "ul"];

function findFirstNegative(file, tag) {
  const content = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  const regex = new RegExp(`<(\/?)${tag}\\b[^>]*>`, "gi");
  let match;
  let balance = 0;
  while ((match = regex.exec(content)) !== null) {
    if (match[1] === "/") balance--;
    else balance++;
    if (balance < 0) {
      const idx = match.index;
      const start = Math.max(0, idx - 80);
      const end = Math.min(content.length, idx + 80);
      return {
        idx,
        balance,
        sample: content.slice(start, end).replace(/\s+/g, " "),
      };
    }
  }
  return null;
}

files.forEach((file) => {
  tags.forEach((tag) => {
    const res = findFirstNegative(file, tag);
    if (res) {
      console.log(`File: ${file} tag: ${tag} first negative at ${res.idx}`);
      console.log("  sample:", JSON.stringify(res.sample).slice(0, 200));
    }
  });
});
