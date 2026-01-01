const fs = require("fs");
const c = fs.readFileSync("About.html", "utf8");
console.log("sample:", c.slice(0, 200));
const openMatches = c.match(/<div\b/gi) || [];
const closeMatches = c.match(/<\/div>/gi) || [];
console.log("<div open matches:", openMatches.length);
console.log("<div close matches:", closeMatches.length);
console.log("first few open matches:", openMatches.slice(0, 5));
console.log("first few close matches:", closeMatches.slice(0, 5));
