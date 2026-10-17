import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { validateRepository } from "./validate-repository.mjs";

/**
 * @param {string} root
 * @param {string} relativePath
 * @param {string} [content]
 */
async function write(root, relativePath, content = "fixture\n") {
  const filePath = path.join(root, relativePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

/**
 * @param {import("node:test").TestContext} t
 */
async function createValidFixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "picture2ppt-"));
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
    "AGENTS.md",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "skills/picture2ppt/agents/openai.yaml",
    "skills/picture2ppt/assets/fidelity-ledger.example.json",
    "skills/picture2ppt/assets/visual-qa-report.example.json",
    "skills/picture2ppt/scripts/check.mjs",
  ];

  for (const file of projectFiles) await write(root, file);

  await write(
    root,
    "README.md",
    [
      "# Project",
      "[English](README.en.md)",
      "[License](LICENSE)",
      "[Skill](skills/picture2ppt/SKILL.md)",
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
    "skills/picture2ppt/SKILL.md",
    [
      "---",
      "name: picture2ppt",
      "description: Use when reconstructing editable PowerPoint slides.",
      "---",
      "",
      "# Skill",
      "",
      "Read [the guide](references/guide.md).",
      "",
    ].join("\n"),
  );
  await write(root, "skills/picture2ppt/references/guide.md", "# Guide\n");

  return {
    root,
    skillRoot: path.join(root, "skills", "picture2ppt"),
    skillPath: path.join(root, "skills", "picture2ppt", "SKILL.md"),
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
    /name must match its directory name/,
  );
});

test("accepts a renamed Skill package when frontmatter matches the directory", async (t) => {
  const { root } = await createValidFixture(t);
  const from = path.join(root, "skills", "picture2ppt");
  const to = path.join(root, "skills", "renamed-skill");
  await fs.rename(from, to);
  const skillPath = path.join(to, "SKILL.md");
  const skill = await fs.readFile(skillPath, "utf8");
  await fs.writeFile(skillPath, skill.replace("name: picture2ppt", "name: renamed-skill"));
  const readmePath = path.join(root, "README.md");
  const readme = await fs.readFile(readmePath, "utf8");
  await fs.writeFile(
    readmePath,
    readme.replaceAll("skills/picture2ppt/SKILL.md", "skills/renamed-skill/SKILL.md"),
  );
  assert.deepEqual(await validateRepository(root), []);
});

test("rejects more than one Skill package", async (t) => {
  const { root, skillRoot } = await createValidFixture(t);
  const copy = path.join(root, "skills", "another-skill");
  await fs.cp(skillRoot, copy, { recursive: true });
  const skillPath = path.join(copy, "SKILL.md");
  const skill = await fs.readFile(skillPath, "utf8");
  await fs.writeFile(skillPath, skill.replace("name: picture2ppt", "name: another-skill"));
  assert.deepEqual(await validateRepository(root), [
    "expected exactly one Skill package, found 2",
  ]);
});

test("reports a missing Skill package without a hardcoded directory", async (t) => {
  const { root } = await createValidFixture(t);
  await fs.rm(path.join(root, "skills"), { recursive: true, force: true });
  assert.match(
    (await validateRepository(root)).join("\n"),
    /missing Skill package: expected one skills\/<name>\/SKILL\.md/,
  );
});

test("rejects workflow and package scripts that hardcode a Skill path", async (t) => {
  const { root } = await createValidFixture(t);
  await fs.writeFile(
    path.join(root, ".github", "workflows", "validate.yml"),
    "run: node skills/ppt-fidelity-editor/scripts/validate-fidelity-ledger.mjs\n",
    "utf8",
  );
  await fs.writeFile(
    path.join(root, "package.json"),
    `${JSON.stringify({
      scripts: { test: "node skills/picture2ppt/scripts/validate-fidelity-ledger.mjs" },
    })}\n`,
    "utf8",
  );
  assert.deepEqual(await validateRepository(root), [
    "package.json hardcodes a Skill directory path; discover skills/* instead",
    ".github/workflows/validate.yml hardcodes a Skill directory path; discover skills/* instead",
  ]);
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
