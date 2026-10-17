import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { findSkillPackages } from "./skill-package.mjs";
import { validateSkillAssets } from "./validate-skill-assets.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * @param {string} scriptPath
 * @param {string[]} args
 */
function run(scriptPath, args) {
  return spawnSync(process.execPath, [scriptPath, ...args], { encoding: "utf8" });
}

/**
 * @param {import("node:child_process").SpawnSyncReturns<string>} result
 */
function assertPass(result) {
  assert.equal(result.status, 0, `${result.stderr}\n${result.stdout}`);
  assert.match(result.stdout, /PASS:/);
}

/**
 * @param {import("node:child_process").SpawnSyncReturns<string>} result
 * @param {RegExp} pattern
 */
function assertFail(result, pattern) {
  assert.equal(result.status, 1, `${result.stderr}\n${result.stdout}`);
  assert.match(result.stderr, pattern);
}

/**
 * @param {import("node:test").TestContext} t
 */
async function tempDir(t) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "picture2ppt-validator-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  return directory;
}

/** @type {string | undefined} */
let cachedSkillRoot;

async function skillRoot() {
  if (cachedSkillRoot) return cachedSkillRoot;
  const packages = await findSkillPackages(repoRoot);
  assert.equal(packages.length, 1);
  cachedSkillRoot = packages[0]?.root;
  assert.ok(cachedSkillRoot);
  return cachedSkillRoot;
}

/**
 * @param {string} name
 */
async function scriptPath(name) {
  return path.join(await skillRoot(), "scripts", name);
}

/**
 * @param {string} fileName
 */
async function readExample(fileName) {
  return JSON.parse(await fs.readFile(path.join(await skillRoot(), "assets", fileName), "utf8"));
}

/**
 * @template T
 * @param {T} value
 * @returns {T}
 */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * @param {import("node:test").TestContext} t
 * @param {string} fileName
 * @param {unknown} value
 */
async function writeJson(t, fileName, value) {
  const directory = await tempDir(t);
  const filePath = path.join(directory, fileName);
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return { directory, filePath };
}

/**
 * @param {any} ledger
 * @param {string} id
 */
function elementById(ledger, id) {
  const found = ledger.elements.find((/** @type {{ id?: string }} */ item) => item.id === id);
  assert.ok(found, `missing example element ${id}`);
  return found;
}

/**
 * @param {string} directory
 * @param {any} report
 * @param {string[]} [skip]
 */
async function materializeArtifacts(directory, report, skip = []) {
  for (const slide of report.slides ?? []) {
    for (const value of Object.values(slide.comparisonArtifacts ?? {})) {
      if (typeof value !== "string" || !value.trim() || skip.includes(value)) continue;
      const artifactPath = path.resolve(directory, value);
      await fs.mkdir(path.dirname(artifactPath), { recursive: true });
      await fs.writeFile(artifactPath, "png");
    }
  }
}

function slideXml() {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<p:sld>",
    '<p:sp><p:nvSpPr><p:cNvPr id="2" name="Title"/></p:nvSpPr><p:txBody><a:p/></p:txBody></p:sp>',
    '<p:sp><p:nvSpPr><p:cNvPr id="3" name="Card"/></p:nvSpPr></p:sp>',
    '<p:pic><p:nvPicPr><p:cNvPr id="4" name="Shield"/></p:nvPicPr></p:pic>',
    '<p:cxnSp><p:nvCxnSpPr><p:cNvPr id="5" name="Arrow"/></p:nvCxnSpPr></p:cxnSp>',
    "</p:sld>",
  ].join("");
}

/**
 * @param {import("node:test").TestContext} t
 * @param {{ notes?: number }} [options]
 */
async function writeDeck(t, options = {}) {
  const directory = await tempDir(t);
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  zip.file("ppt/slides/slide1.xml", slideXml());
  const noteCount = options.notes ?? 1;
  for (let index = 0; index < noteCount; index += 1) {
    zip.file(`ppt/notesSlides/notesSlide${index + 1}.xml`, "<p:notes/>");
  }
  const pptxPath = path.join(directory, "deck.pptx");
  await fs.writeFile(pptxPath, await zip.generateAsync({ type: "nodebuffer" }));
  return {
    directory,
    pptxPath,
    reportDirectory: path.join(directory, "report"),
  };
}

/**
 * @param {string} directory
 * @param {unknown} expectations
 */
async function writeExpectations(directory, expectations) {
  const expectationsPath = path.join(directory, "expectations.json");
  await fs.writeFile(expectationsPath, `${JSON.stringify(expectations, null, 2)}\n`, "utf8");
  return expectationsPath;
}

const passingExpectations = {
  slides: 1,
  minTextboxes: 1,
  minShapes: 3,
  minImages: 1,
  minNotes: 1,
  requiredNames: ["Title", "Shield", "Arrow"],
  forbiddenNames: ["FullSlideScreenshot"],
};

test("validates the published example fidelity ledger", async () => {
  const ledgerPath = path.join(await skillRoot(), "assets", "fidelity-ledger.example.json");
  const result = run(await scriptPath("validate-fidelity-ledger.mjs"), [ledgerPath]);
  assertPass(result);
  assert.match(result.stdout, /4 elements/);
  assert.match(result.stdout, /1 connectors/);
});

test("rejects a fidelity ledger with an invalid canvas and no elements", async (t) => {
  const ledger = clone(await readExample("fidelity-ledger.example.json"));
  ledger.slideSize = { width: 0, height: 900 };
  ledger.elements = [];
  const { filePath } = await writeJson(t, "ledger.json", ledger);
  const result = run(await scriptPath("validate-fidelity-ledger.mjs"), [filePath]);
  assertFail(result, /slideSize\.width and slideSize\.height must be positive numbers/);
  assert.match(result.stderr, /elements must be a non-empty array/);
  assert.match(result.stderr, /2 errors/);
});

test("rejects duplicate visual layers in a fidelity ledger", async (t) => {
  const ledger = clone(await readExample("fidelity-ledger.example.json"));
  elementById(ledger, "s1-title").visualKey = elementById(ledger, "s1-ambient-background").visualKey;
  const { filePath } = await writeJson(t, "ledger.json", ledger);
  assertFail(
    run(await scriptPath("validate-fidelity-ledger.mjs"), [filePath]),
    /duplicate visualKey violates the single-visual-layer invariant/,
  );
});

test("rejects a complex icon that is not a generated sticker", async (t) => {
  const ledger = clone(await readExample("fidelity-ledger.example.json"));
  const icon = elementById(ledger, "s1-security-shield-icon");
  icon.representation = "native";
  icon.assetOrigin = "native-rebuild";
  icon.constructionMethod = "native-shapes";
  const { filePath } = await writeJson(t, "ledger.json", ledger);
  assertFail(
    run(await scriptPath("validate-fidelity-ledger.mjs"), [filePath]),
    /complex icon-like visuals must use a text-free generated sticker/,
  );
});

test("rejects visible text that is not a native object", async (t) => {
  const ledger = clone(await readExample("fidelity-ledger.example.json"));
  elementById(ledger, "s1-title").representation = "sticker";
  const { filePath } = await writeJson(t, "ledger.json", ledger);
  assertFail(
    run(await scriptPath("validate-fidelity-ledger.mjs"), [filePath]),
    /every visible text element must use a native representation/,
  );
});

test("rejects a large semantic sticker without justification", async (t) => {
  const ledger = clone(await readExample("fidelity-ledger.example.json"));
  elementById(ledger, "s1-security-shield-icon").bbox = [0, 0, 1000, 500];
  const { filePath } = await writeJson(t, "ledger.json", ledger);
  assertFail(
    run(await scriptPath("validate-fidelity-ledger.mjs"), [filePath]),
    /semantic stickers covering 30% or more of the slide require largeAssetJustification/,
  );
});

test("rejects a connector that has no points", async (t) => {
  const ledger = clone(await readExample("fidelity-ledger.example.json"));
  delete elementById(ledger, "s1-transfer-arrow").points;
  const { filePath } = await writeJson(t, "ledger.json", ledger);
  assertFail(
    run(await scriptPath("validate-fidelity-ledger.mjs"), [filePath]),
    /connector requires points/,
  );
});

test("fidelity ledger usage fails before reading a file", async () => {
  const result = run(await scriptPath("validate-fidelity-ledger.mjs"), []);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Usage: node validate-fidelity-ledger\.mjs/);
});

test("validates the published visual QA example when comparison artifacts exist", async (t) => {
  const report = clone(await readExample("visual-qa-report.example.json"));
  const { directory, filePath } = await writeJson(t, "visual-qa-report.json", report);
  await materializeArtifacts(directory, report);
  const result = run(await scriptPath("validate-visual-qa.mjs"), [filePath]);
  assertPass(result);
  assert.match(result.stdout, /1 slide,/);
  assert.match(result.stdout, /1 reviewed anchors/);
  assert.match(result.stdout, /1 reviewed connectors/);
});

test("rejects a visual QA report whose comparison artifact is missing or empty", async (t) => {
  const report = clone(await readExample("visual-qa-report.example.json"));
  const { directory, filePath } = await writeJson(t, "visual-qa-report.json", report);
  await materializeArtifacts(directory, report);
  const difference = report.slides[0].comparisonArtifacts.difference;
  const differencePath = path.resolve(directory, difference);
  await fs.rm(differencePath);
  assertFail(
    run(await scriptPath("validate-visual-qa.mjs"), [filePath]),
    new RegExp(`comparison artifact does not exist: ${difference.replaceAll(".", "\\.")}`),
  );

  await fs.writeFile(differencePath, "");
  assertFail(
    run(await scriptPath("validate-visual-qa.mjs"), [filePath]),
    new RegExp(`comparison artifact is empty: ${difference.replaceAll(".", "\\.")}`),
  );
});

test("rejects a content frame whose aspect ratio drifts from the reference", async (t) => {
  const report = clone(await readExample("visual-qa-report.example.json"));
  report.slides[0].contentFrame = [125, 0, 1200, 900];
  const { directory, filePath } = await writeJson(t, "visual-qa-report.json", report);
  await materializeArtifacts(directory, report);
  assertFail(
    run(await scriptPath("validate-visual-qa.mjs"), [filePath]),
    /contentFrame aspect ratio differs from the reference/,
  );
});

test("rejects critical anchor drift past the visual gate", async (t) => {
  const report = clone(await readExample("visual-qa-report.example.json"));
  report.slides[0].keyAnchors[0].finalBox = [100, 100, 200, 200];
  const { directory, filePath } = await writeJson(t, "visual-qa-report.json", report);
  await materializeArtifacts(directory, report);
  const result = run(await scriptPath("validate-visual-qa.mjs"), [filePath]);
  assertFail(result, /critical anchor center drift exceeds the visual gate/);
  assert.match(result.stderr, /critical anchor size drift exceeds the visual gate/);
});

test("rejects connector drift and unresolved critical differences", async (t) => {
  const report = clone(await readExample("visual-qa-report.example.json"));
  report.slides[0].connectors[0].finalPoints = [
    [20, 20],
    [40, 40],
    [60, 60],
  ];
  report.slides[0].unresolvedCriticalDifferences = ["title baseline shifted"];
  const { directory, filePath } = await writeJson(t, "visual-qa-report.json", report);
  await materializeArtifacts(directory, report);
  const result = run(await scriptPath("validate-visual-qa.mjs"), [filePath]);
  assertFail(result, /point 1 drift exceeds the visual gate/);
  assert.match(result.stderr, /unresolved critical visual differences remain/);
});

test("rejects visual QA that was not rendered after the last edit", async (t) => {
  const report = clone(await readExample("visual-qa-report.example.json"));
  report.structureQaPassed = false;
  report.slides[0].renderedAfterLastEdit = false;
  report.slides[0].visualQaPassed = false;
  const { directory, filePath } = await writeJson(t, "visual-qa-report.json", report);
  await materializeArtifacts(directory, report);
  const result = run(await scriptPath("validate-visual-qa.mjs"), [filePath]);
  assertFail(result, /structureQaPassed must be true/);
  assert.match(result.stderr, /final render must be produced after the last edit/);
  assert.match(result.stderr, /slide 1: visualQaPassed must be true/);
});

test("visual QA usage fails before reading a file", async () => {
  const result = run(await scriptPath("validate-visual-qa.mjs"), []);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Usage: node validate-visual-qa\.mjs/);
});

test("verifies a minimal PPTX against passing structural expectations", async (t) => {
  const { directory, pptxPath, reportDirectory } = await writeDeck(t);
  const expectationsPath = await writeExpectations(directory, passingExpectations);
  const result = run(await scriptPath("verify-ppt-structure.mjs"), [
    pptxPath,
    expectationsPath,
    reportDirectory,
  ]);
  assert.equal(result.status, 0, `${result.stderr}\n${result.stdout}`);
  const report = JSON.parse(await fs.readFile(path.join(reportDirectory, "structure-qa.json"), "utf8"));
  assert.equal(report.result, "PASS");
  assert.equal(report.slides, 1);
  assert.equal(report.textboxes, 1);
  assert.equal(report.shapes, 3);
  assert.equal(report.images, 1);
  assert.equal(report.notes, 1);
  assert.equal(report.visualRenderRequiredSeparately, true);
  assert.deepEqual(report.errors, []);
});

test("rejects structural expectation misses and still writes the report", async (t) => {
  const { directory, pptxPath, reportDirectory } = await writeDeck(t, { notes: 0 });
  const expectationsPath = await writeExpectations(directory, {
    ...passingExpectations,
    slides: 2,
    minTextboxes: 5,
    minNotes: 1,
    requiredNames: ["Title", "MissingLabel"],
    forbiddenNames: ["Title"],
  });
  const result = run(await scriptPath("verify-ppt-structure.mjs"), [
    pptxPath,
    expectationsPath,
    reportDirectory,
  ]);
  assert.equal(result.status, 1, result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.result, "FAIL");
  assert.match(report.errors.join("\n"), /slides: expected exactly 2, found 1/);
  assert.match(report.errors.join("\n"), /textboxes: expected at least 5, found 1/);
  assert.match(report.errors.join("\n"), /notes: expected at least 1, found 0/);
  assert.match(report.errors.join("\n"), /missing required object name: MissingLabel/);
  assert.match(report.errors.join("\n"), /forbidden duplicate object name exists: Title/);
  const written = JSON.parse(
    await fs.readFile(path.join(reportDirectory, "structure-qa.json"), "utf8"),
  );
  assert.equal(written.result, "FAIL");
});

test("structure verifier usage fails before reading a deck", async () => {
  const result = run(await scriptPath("verify-ppt-structure.mjs"), []);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Usage: node verify-ppt-structure\.mjs/);
});

test("structure verifier uses PPT_FIDELITY_NODE_MODULES only as an override", async (t) => {
  const directory = await tempDir(t);
  const isolatedScript = path.join(directory, "verify-ppt-structure.mjs");
  await fs.copyFile(await scriptPath("verify-ppt-structure.mjs"), isolatedScript);
  const { directory: deckDirectory, pptxPath, reportDirectory } = await writeDeck(t);
  const expectationsPath = await writeExpectations(deckDirectory, passingExpectations);
  const args = [isolatedScript, pptxPath, expectationsPath, reportDirectory];

  const missing = spawnSync(process.execPath, args, {
    encoding: "utf8",
    env: { ...process.env, PPT_FIDELITY_NODE_MODULES: "" },
  });
  assert.equal(missing.status, 2, `${missing.stderr}\n${missing.stdout}`);
  assert.match(missing.stderr, /requires jszip/);

  const overridden = spawnSync(process.execPath, args, {
    encoding: "utf8",
    env: {
      ...process.env,
      PPT_FIDELITY_NODE_MODULES: path.join(repoRoot, "node_modules"),
    },
  });
  assert.equal(overridden.status, 0, `${overridden.stderr}\n${overridden.stdout}`);
});

test("skill asset validation discovers scripts without a hardcoded directory", async () => {
  assert.deepEqual(await validateSkillAssets(repoRoot), []);
});
