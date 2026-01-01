const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "About.html");
const content = fs.readFileSync(file, "utf8");
console.log("file read:", file);
["div", "section", "header"].forEach((tag) => {
  const openRegex = new RegExp("<" + tag + "\\b", "gi");
  const closeRegex = new RegExp("</" + tag + ">", "gi");
  const openMatches = content.match(openRegex) || [];
  const closeMatches = content.match(closeRegex) || [];
  console.log(tag, "open", openMatches.length, "close", closeMatches.length);
  if (openMatches.length < 10)
    console.log("sample opens:", openMatches.slice(0, 5));
});
