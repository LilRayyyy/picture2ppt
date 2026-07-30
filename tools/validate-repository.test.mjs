import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { validateRepository } from "./validate-repository.mjs";

async function write(root, relativePath, content = "fixture\n") {
  const filePath = path.join(root, relativePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

async function createValidFixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "ppt-fidelity-editor-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  const projectFiles = [
    "LICENSE",
    "CONTRIBUTING.md",
    "CODE_OF_CONDUCT.md",
    "SECURITY.md",
    "SUPPORT.md",
    ".github/CODEOWNERS",
    ".github/PULL_REQUEST_TEMPLATE.md",
    ".github/ISSUE_TEMPLATE/bug_report.yml",
    ".github/ISSUE_TEMPLATE/feature_request.yml",
    ".github/ISSUE_TEMPLATE/config.yml",
    ".github/workflows/validate.yml",
    "docs/PUBLIC_RELEASE_CHECKLIST.md",
    "skills/ppt-fidelity-editor/agents/openai.yaml",
    "skills/ppt-fidelity-editor/assets/fidelity-ledger.example.json",
    "skills/ppt-fidelity-editor/assets/visual-qa-report.example.json",
    "skills/ppt-fidelity-editor/scripts/check.mjs",
  ];

  for (const file of projectFiles) await write(root, file);

  await write(
    root,
    "README.md",
    [
      "# Project",
      "[English](README.en.md)",
      "[License](LICENSE)",
      "[Skill](skills/ppt-fidelity-editor/SKILL.md)",
      "",
    ].join("\n"),
  );
  await write(
    root,
    "README.en.md",
    [
      "# Project",
      "[简体中文](README.md)",
      "[Support](SUPPORT.md)",
      "",
    ].join("\n"),
  );
  await write(
    root,
    "skills/ppt-fidelity-editor/SKILL.md",
    [
      "---",
      "name: ppt-fidelity-editor",
      "description: Use when reconstructing editable PowerPoint slides.",
      "---",
      "",
      "# Skill",
      "",
      "Read [the guide](references/guide.md).",
      "",
    ].join("\n"),
  );
  await write(root, "skills/ppt-fidelity-editor/references/guide.md", "# Guide\n");

  return {
    root,
    skillRoot: path.join(root, "skills", "ppt-fidelity-editor"),
    skillPath: path.join(root, "skills", "ppt-fidelity-editor", "SKILL.md"),
  };
}

test("accepts a complete public repository", async (t) => {
  const { root } = await createValidFixture(t);
  assert.deepEqual(await validateRepository(root), []);
});

test("reports every missing required file", async (t) => {
  const { root } = await createValidFixture(t);
  await fs.rm(path.join(root, "SECURITY.md"));
  assert.match(
    (await validateRepository(root)).join("\n"),
    /missing required file: SECURITY\.md/,
  );
});

test("rejects invalid Skill identity", async (t) => {
  const { root, skillPath } = await createValidFixture(t);
  await fs.writeFile(
    skillPath,
    "---\nname: wrong-name\ndescription: Use when testing.\n---\n",
    "utf8",
  );
  assert.match(
    (await validateRepository(root)).join("\n"),
    /name must be ppt-fidelity-editor/,
  );
});

test("rejects project documentation inside the Skill package", async (t) => {
  const { root, skillRoot } = await createValidFixture(t);
  await fs.writeFile(path.join(skillRoot, "README.md"), "# misplaced\n", "utf8");
  assert.match(
    (await validateRepository(root)).join("\n"),
    /project-level file inside Skill package/,
  );
});

test("reports broken relative Markdown links", async (t) => {
  const { root } = await createValidFixture(t);
  await fs.appendFile(path.join(root, "README.md"), "\n[broken](missing.md)\n");
  assert.match(
    (await validateRepository(root)).join("\n"),
    /broken relative link/,
  );
});

test("rejects unfinished public copy markers", async (t) => {
  const { root } = await createValidFixture(t);
  await fs.appendFile(path.join(root, "README.md"), "\nTBD\n");
  assert.match(
    (await validateRepository(root)).join("\n"),
    /unfinished public copy/,
  );
});

test("requires the validation workflow", async (t) => {
  const { root } = await createValidFixture(t);
  await fs.rm(path.join(root, ".github", "workflows", "validate.yml"));
  assert.match(
    (await validateRepository(root)).join("\n"),
    /missing required file: \.github\/workflows\/validate\.yml/,
  );
});
