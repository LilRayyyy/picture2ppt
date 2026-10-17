import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * @typedef {typeof import("jszip")} JSZipConstructor
 */

/**
 * @typedef {object} StructureExpectations
 * @property {number} [slides]
 * @property {number} [minTextboxes]
 * @property {number} [minShapes]
 * @property {number} [minImages]
 * @property {number} [minNotes]
 * @property {string[]} [requiredNames]
 * @property {string[]} [forbiddenNames]
 */

/**
 * Prefer the jszip installed for this repository. PPT_FIDELITY_NODE_MODULES is
 * an optional override for a Skill directory copied away from that install.
 *
 * @returns {Promise<JSZipConstructor | null>}
 */
async function loadJSZip() {
  try {
    const loaded = /** @type {{ default?: JSZipConstructor }} */ (await import("jszip"));
    if (loaded.default) return loaded.default;
  } catch {
    // The installed skill directory may not sit next to this repo's node_modules.
  }

  const moduleRoot = process.env.PPT_FIDELITY_NODE_MODULES;
  if (moduleRoot) {
    try {
      const requireFrom = createRequire(path.join(moduleRoot, "package.json"));
      return /** @type {JSZipConstructor} */ (requireFrom("jszip"));
    } catch {
      // Fall through to the guidance below.
    }
  }
  return null;
}

/** @param {string} name */
function slideNumber(name) {
  const match = name.match(/\d+/);
  return match ? Number(match[0]) : Number.NaN;
}

const [pptxPath, expectationsPath, reportDirectory] = process.argv.slice(2);
if (!pptxPath || !expectationsPath || !reportDirectory) {
  console.error(
    "Usage: node verify-ppt-structure.mjs <deck.pptx> <expectations.json> <report-directory>"
  );
  process.exit(2);
}

const JSZip = await loadJSZip();
if (!JSZip) {
  console.error(
    "This verifier requires jszip. Run npm install from the repository, or set PPT_FIDELITY_NODE_MODULES to a node_modules directory that contains jszip."
  );
  process.exit(2);
}

const expectations = /** @type {StructureExpectations} */ (
  JSON.parse(await fs.readFile(expectationsPath, "utf8"))
);
const pptxBytes = await fs.readFile(pptxPath);
const zip = await JSZip.loadAsync(pptxBytes);
await fs.mkdir(reportDirectory, { recursive: true });

const fileNames = Object.keys(zip.files);
const slideNames = fileNames
  .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
  .sort((a, b) => slideNumber(a) - slideNumber(b));
const notes = fileNames.filter((name) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(name));

let textboxes = 0;
let shapes = 0;
let images = 0;
const names = new Set();

for (const slideName of slideNames) {
  const slideFile = zip.file(slideName);
  if (!slideFile) throw new Error(`Missing slide part: ${slideName}`);
  const xml = await slideFile.async("string");
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
/** @type {Array<[string, number, number | undefined]>} */
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
