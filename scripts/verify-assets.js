const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".html"));
let missing = [];
files.forEach((f) => {
  const c = fs.readFileSync(path.join(dir, f), "utf8");
  const scriptRegex = /<script[^>]*src=\"([^\"]+)\"/gi;
  let m;
  while ((m = scriptRegex.exec(c)) !== null) {
    const src = m[1];
    if (src.startsWith("http")) continue;
    const p = path.join(dir, src);
    if (!fs.existsSync(p)) missing.push({ file: f, src, path: p });
  }
});
if (!missing.length) console.log("All local script assets present.");
else {
  console.log("Missing assets:");
  missing.forEach((i) => console.log(i.file, i.src));
}
