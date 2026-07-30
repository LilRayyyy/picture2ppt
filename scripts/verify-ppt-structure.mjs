import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [pptxPath, expectationsPath, reportDirectory] = process.argv.slice(2);
if (!pptxPath || !expectationsPath || !reportDirectory) {
  console.error(
    "Usage: node verify-ppt-structure.mjs <deck.pptx> <expectations.json> <report-directory>"
  );
  process.exit(2);
}

let JSZip;
try {
  ({ default: JSZip } = await import("jszip"));
} catch {
  const moduleRoot = process.env.PPT_FIDELITY_NODE_MODULES;
  if (moduleRoot) {
    try {
      const packageJson = JSON.parse(
        await fs.readFile(path.join(moduleRoot, "jszip", "package.json"), "utf8")
      );
      let entry = packageJson.module || packageJson.main || "lib/index.js";
      if (!path.extname(entry)) entry += ".js";
      ({ default: JSZip } = await import(pathToFileURL(path.join(moduleRoot, "jszip", entry)).href));
    } catch {
      // Fall through to the guidance below.
    }
  }
  if (!JSZip) {
    console.error(
      "This verifier requires jszip. Install it or set PPT_FIDELITY_NODE_MODULES to a node_modules directory containing jszip."
    );
    process.exit(2);
  }
}

const expectations = JSON.parse(await fs.readFile(expectationsPath, "utf8"));
const pptxBytes = await fs.readFile(pptxPath);
const zip = await JSZip.loadAsync(pptxBytes);
await fs.mkdir(reportDirectory, { recursive: true });

const fileNames = Object.keys(zip.files);
const slideNames = fileNames
  .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
const notes = fileNames.filter((name) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(name));

let textboxes = 0;
let shapes = 0;
let images = 0;
const names = new Set();

for (const slideName of slideNames) {
  const xml = await zip.file(slideName).async("string");
  const shapeBlocks = xml.match(/<p:sp\b[\s\S]*?<\/p:sp>/g) || [];
  shapes +=
    shapeBlocks.length +
    (xml.match(/<p:cxnSp\b/g) || []).length +
    (xml.match(/<p:graphicFrame\b/g) || []).length +
    (xml.match(/<p:grpSp\b/g) || []).length;
  textboxes += shapeBlocks.filter((block) => block.includes("<p:txBody>")).length;
  images += (xml.match(/<p:pic\b/g) || []).length;
  for (const match of xml.matchAll(/<p:cNvPr\b[^>]*\bname="([^"]*)"/g)) {
    names.add(match[1]);
  }
}

const errors = [];
if (expectations.slides !== undefined && slideNames.length !== expectations.slides) {
  errors.push(`slides: expected exactly ${expectations.slides}, found ${slideNames.length}`);
}
const minimumChecks = [
  ["textboxes", textboxes, expectations.minTextboxes],
  ["shapes", shapes, expectations.minShapes],
  ["images", images, expectations.minImages],
  ["notes", notes.length, expectations.minNotes]
];
for (const [label, actual, minimum] of minimumChecks) {
  if (minimum !== undefined && actual < minimum) {
    errors.push(`${label}: expected at least ${minimum}, found ${actual}`);
  }
}
for (const required of expectations.requiredNames || []) {
  if (!names.has(required)) errors.push(`missing required object name: ${required}`);
}
for (const forbidden of expectations.forbiddenNames || []) {
  if (names.has(forbidden)) errors.push(`forbidden duplicate object name exists: ${forbidden}`);
}

const report = {
  file: pptxPath,
  slides: slideNames.length,
  textboxes,
  shapes,
  images,
  notes: notes.length,
  requiredNamesChecked: (expectations.requiredNames || []).length,
  forbiddenNamesChecked: (expectations.forbiddenNames || []).length,
  visualRenderRequiredSeparately: true,
  errors,
  result: errors.length ? "FAIL" : "PASS"
};

await fs.writeFile(
  path.join(reportDirectory, "structure-qa.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8"
);
console.log(JSON.stringify(report, null, 2));
process.exit(errors.length ? 1 : 0);
