# Public Release Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `LilRayyyy/ppt-fidelity-editor` into a bilingual, MIT-licensed, validated, contribution-ready GitHub project that can later be made public without changing visibility during implementation.

**Architecture:** Separate repository-level documentation, community policy, and automation from the installable Skill package at `skills/ppt-fidelity-editor/`. Add a dependency-free Node.js repository validator and a GitHub Actions workflow so the public-facing structure and existing Skill scripts are checked on every change.

**Tech Stack:** Markdown, YAML Issue Forms, GitHub Actions, Node.js 22 standard library, Codex Skill validation, Git.

## Global Constraints

- Keep the GitHub repository private throughout implementation.
- Use MIT License with `Copyright (c) 2026 LilRayyyy`.
- Use Simplified Chinese as the canonical README language and English as the secondary language.
- Move the Skill package without changing its fidelity, editability, provider-routing, or QA behavior.
- Do not claim marketplace installation, one-click installation, unsupported host compatibility, benchmarks, downloads, testimonials, or unavailable GitHub features.
- Do not add release automation, tags, package registries, a website, or fabricated project visuals.
- Use Node.js 22 in CI and no runtime dependencies for the repository validator.
- Remove `docs/superpowers/` from the final public-facing tree only after the implementation plan has been executed and verified.

---

### Task 1: Isolate the Installable Skill Package

**Files:**
- Move: `SKILL.md` → `skills/ppt-fidelity-editor/SKILL.md`
- Move: `agents/` → `skills/ppt-fidelity-editor/agents/`
- Move: `assets/` → `skills/ppt-fidelity-editor/assets/`
- Move: `references/` → `skills/ppt-fidelity-editor/references/`
- Move: `scripts/` → `skills/ppt-fidelity-editor/scripts/`

**Interfaces:**
- Consumes: the current root-level Skill with relative references among `SKILL.md`, `agents/`, `assets/`, `references/`, and `scripts/`
- Produces: the canonical installable package at `skills/ppt-fidelity-editor/` with unchanged internal paths

- [ ] **Step 1: Capture the pre-move package manifest and checksums**

Run:

```bash
find SKILL.md agents assets references scripts -type f -print | sort
find SKILL.md agents assets references scripts -type f -exec shasum -a 256 {} \; | sort -k 2
```

Expected: the manifest lists the current 12 Skill files plus the expanded image-routing reference, and every file has a checksum.

- [ ] **Step 2: Move the package as one mechanical change**

Run:

```bash
mkdir -p skills/ppt-fidelity-editor
git mv SKILL.md agents assets references scripts skills/ppt-fidelity-editor/
```

Expected: Git reports renames, not deleted-and-recreated content.

- [ ] **Step 3: Prove file contents were preserved**

Run the same checksum command against the new path:

```bash
find skills/ppt-fidelity-editor -type f -exec shasum -a 256 {} \; | sed 's#skills/ppt-fidelity-editor/##' | sort -k 2
```

Compare the hashes by relative path with Step 1. Expected: every relative file has the same SHA-256 value.

- [ ] **Step 4: Validate the moved Skill**

Run:

```bash
python3 '/Users/lilrayyy/.codex/skills/.system/skill-creator/scripts/quick_validate.py' skills/ppt-fidelity-editor
node --check skills/ppt-fidelity-editor/scripts/validate-fidelity-ledger.mjs
node --check skills/ppt-fidelity-editor/scripts/validate-visual-qa.mjs
node --check skills/ppt-fidelity-editor/scripts/verify-ppt-structure.mjs
node skills/ppt-fidelity-editor/scripts/validate-fidelity-ledger.mjs skills/ppt-fidelity-editor/assets/fidelity-ledger.example.json
```

Expected: `Skill is valid!`, all syntax checks exit 0, and the ledger validator reports `PASS`.

- [ ] **Step 5: Commit the package isolation**

```bash
git add skills/ppt-fidelity-editor
git commit -m "refactor: isolate installable skill package"
```

### Task 2: Add the Bilingual Project Landing Page and License

**Files:**
- Create: `README.md`
- Create: `README.en.md`
- Create: `LICENSE`

**Interfaces:**
- Consumes: the canonical package path from Task 1
- Produces: a Chinese-first GitHub landing page, a complete English counterpart, and an MIT grant covering the repository

- [ ] **Step 1: Create the MIT license**

Create `LICENSE` with the standard MIT text beginning with:

```text
MIT License

Copyright (c) 2026 LilRayyyy
```

Include the complete permission grant, condition requiring retention of the notice, and warranty/liability disclaimer.

- [ ] **Step 2: Create the Chinese README**

Use this exact section order:

```markdown
# PPT Fidelity Editor

[English](README.en.md) | 简体中文

[![Validate](https://github.com/LilRayyyy/ppt-fidelity-editor/actions/workflows/validate.yml/badge.svg)](https://github.com/LilRayyyy/ppt-fidelity-editor/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

一句话定位

## 为什么需要它
## 核心原则
## 适用场景
## 不适用场景
## 前置条件
## 安装
## 快速开始
## 工作流程
## 质量门槛
## 项目结构
## 本地验证
## 已知限制
## 贡献与支持
## 许可证
```

Use factual copy that explains:

- every visible semantic element must remain independently selectable;
- fidelity and semantic editability are joint requirements;
- inputs include screenshots, flattened images, PDFs, and low-editability PPTX files;
- complex visuals need a callable image-generation capability;
- source crops, Emoji substitutions, and silent low-fidelity fallbacks are prohibited;
- the project is Codex-first and other hosts are capability-dependent.

Use these installation commands:

```bash
git clone https://github.com/LilRayyyy/ppt-fidelity-editor.git
mkdir -p ~/.codex/skills
cp -R ppt-fidelity-editor/skills/ppt-fidelity-editor ~/.codex/skills/ppt-fidelity-editor
```

Use this invocation example:

```text
$ppt-fidelity-editor 将这个 PDF 重建为高保真、完全可编辑的 PowerPoint，并在交付前完成结构与视觉 QA。
```

Link to `CONTRIBUTING.md`, `SUPPORT.md`, `SECURITY.md`, `LICENSE`, and `skills/ppt-fidelity-editor/SKILL.md`.

- [ ] **Step 3: Create the complete English README**

Mirror the Chinese section order and commands:

```markdown
# PPT Fidelity Editor

English | [简体中文](README.md)

## Why this exists
## Core principles
## Use cases
## Non-goals
## Prerequisites
## Installation
## Quick start
## Workflow
## Quality gates
## Repository structure
## Local validation
## Known limitations
## Contributing and support
## License
```

Use this invocation example:

```text
$ppt-fidelity-editor Reconstruct this PDF as a high-fidelity, fully editable PowerPoint and complete structure and visual QA before delivery.
```

Keep all compatibility and limitation statements semantically aligned with `README.md`.

- [ ] **Step 4: Verify landing-page truthfulness and paths**

Run:

```bash
rg -n 'skills/ppt-fidelity-editor|imagegen|MIT|SECURITY|SUPPORT|CONTRIBUTING' README.md README.en.md
rg -n 'one-click|marketplace|downloads|benchmark|Claude-compatible|Gemini-compatible' README.md README.en.md
```

Expected: the first command finds the required content; the second returns no unsupported claims.

Run:

```bash
git diff --check -- README.md README.en.md LICENSE
```

Expected: no output.

- [ ] **Step 5: Commit the landing pages and license**

```bash
git add README.md README.en.md LICENSE
git commit -m "docs: add bilingual project documentation and MIT license"
```

### Task 3: Add Community, Support, Security, and Release-Gate Files

**Files:**
- Create: `CONTRIBUTING.md`
- Create: `CODE_OF_CONDUCT.md`
- Create: `SECURITY.md`
- Create: `SUPPORT.md`
- Create: `.github/CODEOWNERS`
- Create: `.github/PULL_REQUEST_TEMPLATE.md`
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml`
- Create: `.github/ISSUE_TEMPLATE/config.yml`
- Create: `docs/PUBLIC_RELEASE_CHECKLIST.md`

**Interfaces:**
- Consumes: repository paths and public claims from Task 2
- Produces: GitHub-recognized contribution and issue intake policy plus an explicit manual visibility gate

- [ ] **Step 1: Write contribution and conduct policies**

In `CONTRIBUTING.md`, use Chinese first and a concise English section. Require:

- Node.js 22 or newer for repository checks;
- edits to the Skill only inside `skills/ppt-fidelity-editor/`;
- both READMEs updated for user-visible behavior;
- `node tools/validate-repository.mjs`, Node syntax checks, ledger validation, and Skill validation before PR;
- focused commits and no unrelated refactors;
- no source screenshots, composite crops, or low-fidelity icon substitutions in examples.

In `CODE_OF_CONDUCT.md`, write an original bilingual policy with:

- respectful, inclusive collaboration;
- no harassment, threats, discrimination, doxxing, or publication of private information;
- maintainer enforcement and proportionate moderation;
- reporting through the maintainer's GitHub profile without public disclosure of sensitive details.

- [ ] **Step 2: Write security and support policies**

In `SECURITY.md`, state:

```markdown
- Supported version: the latest commit on `main` until tagged releases exist.
- Do not report vulnerabilities in public Issues.
- Prefer GitHub private vulnerability reporting when enabled.
- If that option is unavailable, contact @LilRayyyy through the GitHub profile without posting exploit details publicly.
```

In `SUPPORT.md`, route:

- reproducible defects to the bug form;
- enhancement ideas to the feature form;
- usage questions to Issues until Discussions is explicitly enabled;
- security reports to `SECURITY.md`.

- [ ] **Step 3: Create GitHub ownership and PR templates**

Use:

```text
# .github/CODEOWNERS
* @LilRayyyy
```

Make `.github/PULL_REQUEST_TEMPLATE.md` request:

- change summary and motivation;
- affected package paths;
- fidelity/editability impact;
- validation commands and results;
- documentation updates;
- checklist confirming no composite source crops, embedded visible text, secrets, or unrelated changes.

- [ ] **Step 4: Create YAML Issue Forms without label dependencies**

`bug_report.yml` must request:

- Codex/host version and operating system;
- input type;
- expected and actual behavior;
- minimal reproduction steps;
- logs or artifacts with secrets removed;
- confirmation that confidential source material is not being uploaded publicly.

`feature_request.yml` must request:

- user problem and use case;
- proposed behavior;
- alternatives considered;
- expected fidelity/editability impact.

Use this `config.yml` shape:

```yaml
blank_issues_enabled: false
contact_links:
  - name: 使用与支持 / Usage and support
    url: https://github.com/LilRayyyy/ppt-fidelity-editor/blob/main/SUPPORT.md
    about: 提交问题前请先阅读支持指南 / Read the support guide before opening an issue.
  - name: 安全问题 / Security
    url: https://github.com/LilRayyyy/ppt-fidelity-editor/blob/main/SECURITY.md
    about: 请勿在公开 Issue 中披露漏洞 / Do not disclose vulnerabilities in public issues.
```

Do not set labels, assignees, or projects.

- [ ] **Step 5: Create the public-release checklist**

`docs/PUBLIC_RELEASE_CHECKLIST.md` must use checkboxes for:

- repository history and Actions-log secret review;
- description and topics;
- Issues and Actions;
- optional Discussions;
- private vulnerability reporting;
- secret scanning, push protection, Dependabot alerts, and code-scanning review;
- truthful social preview;
- README rendering and link review;
- successful `main` validation workflow;
- Community Profile review after publication;
- final manual visibility change.

State at the top: this checklist does not change repository visibility.

- [ ] **Step 6: Validate YAML and public-policy links**

Run:

```bash
ruby -e 'require "yaml"; Dir[".github/ISSUE_TEMPLATE/*.{yml,yaml}"].each { |f| YAML.load_file(f); puts "PASS #{f}" }'
rg -n 'SECURITY.md|SUPPORT.md|CONTRIBUTING.md|CODE_OF_CONDUCT.md' README.md README.en.md .github docs
git diff --check
```

Expected: every YAML file parses, required links exist, and no whitespace errors are reported.

- [ ] **Step 7: Commit community readiness**

```bash
git add CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md SUPPORT.md .github docs/PUBLIC_RELEASE_CHECKLIST.md
git commit -m "docs: add open source community and release policies"
```

### Task 4: Build the Repository Validator with Tests

**Files:**
- Create: `tools/validate-repository.mjs`
- Create: `tools/validate-repository.test.mjs`

**Interfaces:**
- Produces: `validateRepository(rootDirectory: string): Promise<string[]>`
- CLI: `node tools/validate-repository.mjs [root-directory]`
- Success output: `PASS: public repository structure, Skill package, and Markdown links are valid`
- Failure output: one `- <actionable error>` line per problem and process exit code 1

- [ ] **Step 1: Write failing Node tests**

Create `tools/validate-repository.test.mjs` using `node:test`, `node:assert/strict`, and temporary directories.

Import the production interface exactly as:

```javascript
import { validateRepository } from "./validate-repository.mjs";
```

Define a `createValidFixture()` helper that writes:

- every required project file;
- `skills/ppt-fidelity-editor/SKILL.md` with valid frontmatter;
- required Skill directories and one script;
- valid relative links from both READMEs and the Skill.

Add these tests:

```javascript
test("accepts a complete public repository", async () => {
  assert.deepEqual(await validateRepository(root), []);
});

test("reports every missing required file", async () => {
  await fs.rm(path.join(root, "SECURITY.md"));
  assert.match((await validateRepository(root)).join("\n"), /missing required file: SECURITY\\.md/);
});

test("rejects invalid Skill identity", async () => {
  await fs.writeFile(skillPath, "---\\nname: wrong-name\\ndescription: x\\n---\\n");
  assert.match((await validateRepository(root)).join("\n"), /name must be ppt-fidelity-editor/);
});

test("rejects project documentation inside the Skill package", async () => {
  await fs.writeFile(path.join(skillRoot, "README.md"), "# misplaced");
  assert.match((await validateRepository(root)).join("\n"), /project-level file inside Skill package/);
});

test("reports broken relative Markdown links", async () => {
  await fs.appendFile(path.join(root, "README.md"), "\\n[broken](missing.md)\\n");
  assert.match((await validateRepository(root)).join("\n"), /broken relative link/);
});

test("rejects unfinished public copy markers", async () => {
  await fs.appendFile(path.join(root, "README.md"), "\\nTBD\\n");
  assert.match((await validateRepository(root)).join("\n"), /unfinished public copy/);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
node --test tools/validate-repository.test.mjs
```

Expected: FAIL because `validate-repository.mjs` or its exported function does not exist.

- [ ] **Step 3: Implement the dependency-free validator**

In `tools/validate-repository.mjs`, use only:

```javascript
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
```

Implement:

```javascript
export async function validateRepository(rootDirectory) {
  const errors = [];
  const root = path.resolve(rootDirectory);
  const skillRoot = path.join(root, "skills", "ppt-fidelity-editor");
  await checkRequiredFiles(root, errors);
  await checkSkillIdentity(skillRoot, errors);
  await checkSkillPackageBoundaries(skillRoot, errors);
  await checkMarkdownLinks(root, skillRoot, errors);
  await checkPublicCopy(root, errors);
  return errors;
}
```

Implement the called helpers in the same module:

- `pathExists(filePath): Promise<boolean>` uses `fs.stat`;
- `walkFiles(directory): Promise<string[]>` recursively returns files in deterministic sorted order;
- `checkRequiredFiles(root, errors)` appends `missing required file: <relative-path>`;
- `checkSkillIdentity(skillRoot, errors)` parses the opening `---` block and requires the exact name plus a non-empty description;
- `checkSkillPackageBoundaries(skillRoot, errors)` recursively rejects project-level basenames;
- `checkMarkdownLinks(root, skillRoot, errors)` checks `README.md`, `README.en.md`, and every Markdown file in the Skill, ignoring `http:`, `https:`, `mailto:`, and anchor-only targets;
- `checkPublicCopy(root, errors)` scans the two READMEs and community-policy files for unfinished-work and identity markers.

Use the exact required-file set from Tasks 2 and 3 plus:

```text
skills/ppt-fidelity-editor/SKILL.md
skills/ppt-fidelity-editor/agents/openai.yaml
skills/ppt-fidelity-editor/assets/fidelity-ledger.example.json
skills/ppt-fidelity-editor/assets/visual-qa-report.example.json
```

Scan unfinished copy with word boundaries for `TODO`, `TBD`, and `FIXME`, plus the literal identities `your-name` and `example@example.com`. Do not reject angle-bracket command metavariables.

For CLI execution, resolve `process.argv[2] || process.cwd()`, print the success message when `errors.length === 0`, otherwise print a failure heading and each error before setting `process.exitCode = 1`.

- [ ] **Step 4: Run tests and verify GREEN**

Run:

```bash
node --test tools/validate-repository.test.mjs
node tools/validate-repository.mjs
```

Expected: all six tests pass and the real repository reports `PASS`.

- [ ] **Step 5: Commit the validator**

```bash
git add tools/validate-repository.mjs tools/validate-repository.test.mjs
git commit -m "test: add public repository validation"
```

### Task 5: Add Continuous Integration

**Files:**
- Create: `.github/workflows/validate.yml`
- Modify: `tools/validate-repository.mjs`
- Modify: `tools/validate-repository.test.mjs`

**Interfaces:**
- Consumes: repository validator from Task 4 and Skill scripts from Task 1
- Produces: GitHub Actions validation for pushes, pull requests to `main`, and manual runs

- [ ] **Step 1: Add a failing workflow-presence test**

Extend the valid fixture to write `.github/workflows/validate.yml`, then add:

```javascript
test("requires the validation workflow", async () => {
  await fs.rm(path.join(root, ".github", "workflows", "validate.yml"));
  assert.match(
    (await validateRepository(root)).join("\n"),
    /missing required file: \\.github\\/workflows\\/validate\\.yml/
  );
});
```

- [ ] **Step 2: Run the new test and verify RED**

Run:

```bash
node --test tools/validate-repository.test.mjs
```

Expected: the new test fails because the validator does not yet require the workflow.

- [ ] **Step 3: Create the workflow and enforce its presence**

Use:

```yaml
name: Validate

on:
  push:
  pull_request:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Test repository validator
        run: node --test tools/validate-repository.test.mjs
      - name: Validate repository
        run: node tools/validate-repository.mjs
      - name: Check Skill scripts
        run: |
          node --check skills/ppt-fidelity-editor/scripts/validate-fidelity-ledger.mjs
          node --check skills/ppt-fidelity-editor/scripts/validate-visual-qa.mjs
          node --check skills/ppt-fidelity-editor/scripts/verify-ppt-structure.mjs
      - name: Validate example fidelity ledger
        run: node skills/ppt-fidelity-editor/scripts/validate-fidelity-ledger.mjs skills/ppt-fidelity-editor/assets/fidelity-ledger.example.json
```

Add `.github/workflows/validate.yml` to the required-file list in `tools/validate-repository.mjs`.

- [ ] **Step 4: Validate workflow syntax and local equivalents**

Run:

```bash
ruby -e 'require "yaml"; YAML.load_file(".github/workflows/validate.yml"); puts "PASS workflow YAML"'
node --test tools/validate-repository.test.mjs
node tools/validate-repository.mjs
node --check skills/ppt-fidelity-editor/scripts/validate-fidelity-ledger.mjs
node --check skills/ppt-fidelity-editor/scripts/validate-visual-qa.mjs
node --check skills/ppt-fidelity-editor/scripts/verify-ppt-structure.mjs
node skills/ppt-fidelity-editor/scripts/validate-fidelity-ledger.mjs skills/ppt-fidelity-editor/assets/fidelity-ledger.example.json
```

Expected: YAML parses, tests pass, repository validator passes, script syntax passes, and ledger validation reports `PASS`.

- [ ] **Step 5: Commit CI**

```bash
git add .github/workflows/validate.yml tools/validate-repository.mjs tools/validate-repository.test.mjs
git commit -m "ci: validate public repository readiness"
```

### Task 6: Remove Internal Planning Artifacts and Complete Verification

**Files:**
- Delete: `docs/superpowers/`
- Verify: all files created or moved in Tasks 1–5

**Interfaces:**
- Consumes: the complete public-ready repository
- Produces: a clean public-facing tree with planning history preserved only in Git history

- [ ] **Step 1: Remove internal planning documents from the final tree**

Run:

```bash
git rm -r docs/superpowers
```

Expected: only internal design and implementation-plan files are staged for deletion; `docs/PUBLIC_RELEASE_CHECKLIST.md` remains.

- [ ] **Step 2: Run the complete verification set**

Run:

```bash
node --test tools/validate-repository.test.mjs
node tools/validate-repository.mjs
python3 '/Users/lilrayyy/.codex/skills/.system/skill-creator/scripts/quick_validate.py' skills/ppt-fidelity-editor
node --check skills/ppt-fidelity-editor/scripts/validate-fidelity-ledger.mjs
node --check skills/ppt-fidelity-editor/scripts/validate-visual-qa.mjs
node --check skills/ppt-fidelity-editor/scripts/verify-ppt-structure.mjs
node skills/ppt-fidelity-editor/scripts/validate-fidelity-ledger.mjs skills/ppt-fidelity-editor/assets/fidelity-ledger.example.json
ruby -e 'require "yaml"; Dir[".github/**/*.{yml,yaml}"].each { |f| YAML.load_file(f); puts "PASS #{f}" }'
git diff --check
```

Expected: validator tests pass, repository and Skill validation pass, all JavaScript parses, the example ledger passes, all YAML parses, and no whitespace errors remain.

- [ ] **Step 3: Inspect public claims and final tree**

Run:

```bash
rg -n 'TODO|TBD|FIXME|your-name|example@example.com' README.md README.en.md CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md SUPPORT.md docs .github || true
rg --files | sort
git status --short --branch
```

Expected:

- no unfinished or identity placeholder markers;
- no `docs/superpowers/` files;
- the Skill exists only at `skills/ppt-fidelity-editor/`;
- only the planned cleanup deletion is uncommitted.

- [ ] **Step 4: Commit the public-tree cleanup**

```bash
git add docs
git commit -m "chore: remove internal planning artifacts"
```

- [ ] **Step 5: Run fresh post-commit verification**

Run:

```bash
node --test tools/validate-repository.test.mjs
node tools/validate-repository.mjs
python3 '/Users/lilrayyy/.codex/skills/.system/skill-creator/scripts/quick_validate.py' skills/ppt-fidelity-editor
node skills/ppt-fidelity-editor/scripts/validate-fidelity-ledger.mjs skills/ppt-fidelity-editor/assets/fidelity-ledger.example.json
git diff --check origin/main...HEAD
git status --short --branch
git log --oneline --decorate origin/main..HEAD
```

Expected: every validation passes, the worktree is clean, and the branch contains separate commits for design, plan, package isolation, bilingual docs/license, community readiness, repository validator, CI, and public-tree cleanup.

- [ ] **Step 6: Confirm the visibility boundary**

Confirm from the execution record that no GitHub repository-settings mutation was called. Do not call any visibility-changing API or CLI command.
