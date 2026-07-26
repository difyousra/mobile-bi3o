const path = require("path");
const sharp = require("sharp");

const logoPath = path.join(__dirname, "..", "assets", "bi3oo-logo.png");

async function makeLogoTransparent() {
  const { data, info } = await sharp(logoPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (r < 40 && g < 40 && b < 40) {
      data[i + 3] = 0;
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toFile(logoPath);

  console.log("Logo updated with transparent background:", logoPath);
}

makeLogoTransparent().catch((error) => {
  console.error(error);
  process.exit(1);
});
