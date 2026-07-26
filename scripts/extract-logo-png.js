const fs = require("fs");
const path = require("path");

const svgPath = path.join(__dirname, "..", "assets", "bi3oo-logo.svg");
const pngPath = path.join(__dirname, "..", "assets", "bi3oo-logo.png");

const svg = fs.readFileSync(svgPath, "utf8");
const match = svg.match(/xlink:href="(data:image\/png;base64,[^"]+)"/);

if (!match) {
  console.error("Could not find embedded PNG in SVG");
  process.exit(1);
}

const base64 = match[1].replace("data:image/png;base64,", "");
fs.writeFileSync(pngPath, Buffer.from(base64, "base64"));
console.log("PNG extracted:", pngPath, fs.statSync(pngPath).size, "bytes");
