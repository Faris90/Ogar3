const fs = require("fs"),
      folderContents = fs.readdirSync("./web/skins"),
      pngFileNames = folderContents.filter(f => f.endsWith(".png"));

if(folderContents.length !== pngFileNames.length) {
  const nonPngFileNames = folderContents.filter(f => !f.endsWith(".png"));
  console.warn("Warning: found " + nonPngFileNames.length + " non-PNG skins, these will not be loaded! (" + nonPngFileNames.join(", ") + ")");
}

fs.writeFileSync("./web/skinList.txt", pngFileNames.map(f => f.slice(0, -4)).join());
console.log("Successfully updated skinList.txt!");
