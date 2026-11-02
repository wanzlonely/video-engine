const { bundle } = require("@remotion/bundler");
const { renderMedia, selectComposition } = require("@remotion/renderer");
const path = require("path");

async function main() {
  const args = process.argv.slice(2);
  const naskahFlagIndex = args.indexOf("--naskah");
  const naskahId =
    naskahFlagIndex !== -1 ? args[naskahFlagIndex + 1] : "alexandria";

  process.env.NASKAH_ID = naskahId;

  const entry = path.join(__dirname, "src", "index.ts");

  console.log(`Bundling video-engine untuk naskah: ${naskahId}`);

  const bundleLocation = await bundle({
    entryPoint: entry,
    webpackOverride: (config) => config,
  });

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "VideoEngine",
    inputProps: {},
  });

  const outputPath = path.join(
    __dirname,
    "out",
    `${naskahId}.mp4`
  );

  console.log(`Merender ke: ${outputPath}`);

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    crf: 16,
    jpegQuality: 95,
    inputProps: {},
  });

  console.log("Selesai.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
