const fs = require("fs");
const path = require("path");

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(function(f) {
    var dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

var outDir = path.join(__dirname, "..", "out");

if (!fs.existsSync(outDir)) {
  console.error("out dir not found");
  process.exit(1);
}

console.log("Fixing paths in out directory...");

var fixedCount = 0;

walkDir(outDir, function(filePath) {
  if (!filePath.endsWith(".html")) return;

  var content = fs.readFileSync(filePath, "utf8");
  var updated = content;

  // All occurrences of "/_next (both escaped \" and unescaped ")
  // become "./_next to work with file:// protocol in Electron
  updated = updated.split("\"/_next").join("\"./_next");

  // Same for /favicon
  updated = updated.split("\"/favicon").join("\"./favicon");

  if (content !== updated) {
    fs.writeFileSync(filePath, updated, "utf8");
    console.log("fixed: " + path.relative(outDir, filePath));
    fixedCount++;
  }
});

console.log("Done! Fixed " + fixedCount + " HTML files.");
