const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".html"));
const issues = { images: [], forms: [], buttons: [] };
for (const file of files) {
  const p = path.join(dir, file);
  const c = fs.readFileSync(p, "utf8");
  // imgs without alt
  const imgRegex = /<img\b[^>]*>/gi;
  let m;
  while ((m = imgRegex.exec(c)) !== null) {
    const tag = m[0];
    if (!/\balt\s*=\s*"[^"]+"|\balt\s*=\s*'[^']+'/.test(tag)) {
      issues.images.push({ file, sample: tag.slice(0, 200) });
    }
  }
  // inputs inside forms lacking label
  const formRegex = /<form\b[\s\S]*?<\/form>/gi;
  while ((m = formRegex.exec(c)) !== null) {
    const form = m[0];
    const inputRegex = /<(input|textarea|select)\b[^>]*>/gi;
    let n;
    let idx = 0;
    while ((n = inputRegex.exec(form)) !== null) {
      const input = n[0];
      const idMatch = input.match(/\bid\s*=\s*"([^"]+)"/i);
      const hasLabel =
        idMatch &&
        new RegExp(`<label[^>]*for=\\"${idMatch[1]}\\"`, "i").test(form);
      const aria = /aria-label=\s*"[^"]+"|aria-label=\s*'[^']+'/.test(input);
      const placeholder = /placeholder=\s*"[^"]+"|placeholder=\s*'[^']+'/.test(
        input
      );
      if (
        !hasLabel &&
        !aria &&
        !placeholder &&
        !/type=\s*"hidden"/.test(input)
      ) {
        issues.forms.push({ file, sample: input.slice(0, 200) });
      }
    }
  }
  // buttons without type
  const buttonRegex = /<button\b[^>]*>/gi;
  while ((m = buttonRegex.exec(c)) !== null) {
    const btn = m[0];
    if (!/\btype\s*=/.test(btn)) {
      issues.buttons.push({ file, sample: btn.slice(0, 200) });
    }
  }
}
console.log("Images without alt:", issues.images.length);
issues.images.slice(0, 20).forEach((i) => console.log(i.file, i.sample));
console.log(
  "\nForm controls missing label/aria/placeholder:",
  issues.forms.length
);
issues.forms.slice(0, 20).forEach((i) => console.log(i.file, i.sample));
console.log("\nButtons without type:", issues.buttons.length);
issues.buttons.slice(0, 20).forEach((i) => console.log(i.file, i.sample));
