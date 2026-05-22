import { pathToFileURL } from "node:url";
import fs from "node:fs/promises";

const artifactUrl = pathToFileURL(
  "C:/Users/tatya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs",
).href;

const { Presentation, column, text, fill, hug } = await import(artifactUrl);

const fonts = [undefined, "Inter", "Arial", "Calibri", "Segoe UI"];
for (const family of fonts) {
  const deck = Presentation.create({ slideSize: { width: 800, height: 300 } });
  const slide = deck.slides.add();
  slide.compose(
    column({ width: fill, height: fill, padding: 20 }, [
      text(`${family || "default"}: Привет Finvy`, {
        width: fill,
        height: hug,
        style: {
          fontSize: 42,
          bold: true,
          color: "#111827",
          ...(family ? { fontFamily: family } : {}),
        },
      }),
    ]),
    { frame: { left: 0, top: 0, width: 800, height: 300 }, baseUnit: 8 },
  );
  const png = await slide.export({ format: "png" });
  await fs.writeFile(
    `C:/Users/tatya/AndroidStudioProjects/finmap-clone/finvy_deck_work/scratch/font_file_${family || "default"}.png`.replaceAll(
      " ",
      "_",
    ),
    Buffer.from(await png.arrayBuffer()),
  );
}
