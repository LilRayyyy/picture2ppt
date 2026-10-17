import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { findSkillPackages } from "./skill-package.mjs";

const REQUIRED_FILES = [
  "README.md",
  "README.en.md",
  "LICENSE",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
  "SUPPORT.md",
  "AGENTS.md",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  ".github/CODEOWNERS",
  ".github/PULL_REQUEST_TEMPLATE.md",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/config.yml",
  ".github/workflows/validate.yml",
  "docs/PUBLIC_RELEASE_CHECKLIST.md",
];

const REQUIRED_SKILL_DIRECTORIES = ["agents", "assets", "references", "scripts"];

const REQUIRED_SKILL_FILES = [
  "agents/openai.yaml",
  "assets/fidelity-ledger.example.json",
  "assets/visual-qa-report.example.json",
];

const PROJECT_ONLY_BASENAMES = new Set([
  "README.md",
  "README.en.md",
  "LICENSE",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
  "SUPPORT.md",
  "AGENTS.md",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
]);

const PUBLIC_COPY_FILES = [
  "README.md",
  "README.en.md",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
  "SUPPORT.md",
  "docs/PUBLIC_RELEASE_CHECKLIST.md",
  ".github/PULL_REQUEST_TEMPLATE.md",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/config.yml",
];

const HARDCODED_SKILL_PATH = /skills\/[A-Za-z0-9._-]+/;

/**
 * @param {unknown} error
 * @returns {boolean}
 */
function isEnoent(error) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

/**
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
async function pathExists(filePath) {
  try {
    await fs.stat(filePath);
    return true;
  } catch (error) {
    if (isEnoent(error)) return false;
    throw error;
  }
}

/**
 * @param {string} directory
 * @returns {Promise<string[]>}
 */
async function walkFiles(directory) {
  if (!(await pathExists(directory))) return [];
  const entries = await fs.readdir(directory, { withFileTypes: true });
  /** @type {string[]} */
  const files = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

/**
 * @param {string} root
 * @param {import("./skill-package.mjs").SkillPackage[]} skillPackages
 * @param {string[]} errors
 */
async function checkRequiredFiles(root, skillPackages, errors) {
  for (const relativePath of REQUIRED_FILES) {
    if (!(await pathExists(path.join(root, relativePath)))) {
      errors.push(`missing required file: ${relativePath}`);
    }
  }

  for (const skill of skillPackages) {
    for (const directory of REQUIRED_SKILL_DIRECTORIES) {
      const absolute = path.join(skill.root, directory);
      const relativePath = path.relative(root, absolute);
      try {
        const stat = await fs.stat(absolute);
        if (!stat.isDirectory()) errors.push(`required Skill directory is not a directory: ${relativePath}`);
      } catch (error) {
        if (isEnoent(error)) {
          errors.push(`missing required Skill directory: ${relativePath}`);
        } else {
          throw error;
        }
      }
    }

    for (const relative of REQUIRED_SKILL_FILES) {
      const absolute = path.join(skill.root, relative);
      if (!(await pathExists(absolute))) {
        errors.push(`missing required file: ${path.relative(root, absolute)}`);
      }
    }
  }
}

/**
 * @param {string} markdown
 * @returns {Map<string, string> | null}
 */
function parseFrontmatter(markdown) {
  const normalized = markdown.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) return null;
  const closingIndex = normalized.indexOf("\n---", 4);
  if (closingIndex === -1) return null;

  /** @type {Map<string, string>} */
  const fields = new Map();
  for (const line of normalized.slice(4, closingIndex).split("\n")) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match?.[1] && match[2] !== undefined) fields.set(match[1], match[2].trim());
  }
  return fields;
}

/**
 * @param {import("./skill-package.mjs").SkillPackage} skill
 * @param {string[]} errors
 */
async function checkSkillIdentity(skill, errors) {
  const fields = parseFrontmatter(await fs.readFile(path.join(skill.root, "SKILL.md"), "utf8"));
  if (!fields) {
    errors.push("Skill frontmatter is missing or malformed");
    return;
  }
  if (fields.get("name") !== skill.directoryName) {
    errors.push(`Skill frontmatter name must match its directory name (${skill.directoryName})`);
  }
  if (!fields.get("description")) {
    errors.push("Skill frontmatter description must be non-empty");
  }
}

/**
 * @param {string} skillRoot
 * @param {string[]} errors
 */
async function checkSkillPackageBoundaries(skillRoot, errors) {
  for (const filePath of await walkFiles(skillRoot)) {
    const basename = path.basename(filePath);
    if (PROJECT_ONLY_BASENAMES.has(basename)) {
      errors.push(
        `project-level file inside Skill package: ${path.relative(skillRoot, filePath)}`,
      );
    }
  }
}

/**
 * @param {string} markdown
 * @returns {string[]}
 */
function markdownTargets(markdown) {
  /** @type {string[]} */
  const targets = [];
  const pattern = /!?\[[^\]]*]\(([^)]+)\)/g;
  for (const match of markdown.matchAll(pattern)) {
    const rawTarget = match[1];
    if (!rawTarget) continue;
    let target = rawTarget.trim();
    if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1);
    const titleSeparator = target.search(/\s+["']/);
    if (titleSeparator !== -1) target = target.slice(0, titleSeparator);
    targets.push(target);
  }
  return targets;
}

/**
 * @param {string} root
 * @param {string} filePath
 * @param {string[]} errors
 */
async function checkMarkdownFileLinks(root, filePath, errors) {
  const markdown = await fs.readFile(filePath, "utf8");
  for (const rawTarget of markdownTargets(markdown)) {
    if (/^(?:https?:|mailto:|#)/i.test(rawTarget)) continue;

    const withoutFragment = rawTarget.split("#", 1)[0];
    if (!withoutFragment) continue;

    let decodedTarget;
    try {
      decodedTarget = decodeURIComponent(withoutFragment);
    } catch {
      errors.push(
        `invalid encoded Markdown link in ${path.relative(root, filePath)}: ${rawTarget}`,
      );
      continue;
    }

    const targetPath = decodedTarget.startsWith("/")
      ? path.join(root, decodedTarget.slice(1))
      : path.resolve(path.dirname(filePath), decodedTarget);
    if (!(await pathExists(targetPath))) {
      errors.push(
        `broken relative link in ${path.relative(root, filePath)}: ${rawTarget}`,
      );
    }
  }
}

/**
 * @param {string} root
 * @param {import("./skill-package.mjs").SkillPackage[]} skillPackages
 * @param {string[]} errors
 */
async function checkMarkdownLinks(root, skillPackages, errors) {
  /** @type {string[]} */
  const markdownFiles = [
    path.join(root, "README.md"),
    path.join(root, "README.en.md"),
    path.join(root, "AGENTS.md"),
  ];

  for (const skill of skillPackages) {
    markdownFiles.push(
      ...(await walkFiles(skill.root)).filter((filePath) => filePath.endsWith(".md")),
    );
  }

  for (const filePath of markdownFiles) {
    if (await pathExists(filePath)) await checkMarkdownFileLinks(root, filePath, errors);
  }
}

/**
 * @param {string} root
 * @param {string[]} errors
 */
async function checkPublicCopy(root, errors) {
  const unfinishedPattern = /\b(?:TODO|TBD|FIXME)\b|your-name|example@example\.com/i;

  for (const relativePath of PUBLIC_COPY_FILES) {
    const filePath = path.join(root, relativePath);
    if (!(await pathExists(filePath))) continue;
    const content = await fs.readFile(filePath, "utf8");
    if (unfinishedPattern.test(content)) {
      errors.push(`unfinished public copy in ${relativePath}`);
    }
  }
}

/**
 * CI previously failed after the skill directory was renamed because workflow
 * steps named `skills/<old-name>/...` directly. npm scripts must discover the
 * package instead.
 *
 * @param {string} root
 * @param {string[]} errors
 */
async function checkDiscoveredPaths(root, errors) {
  /** @type {string[]} */
  const files = [];
  const packageJson = path.join(root, "package.json");
  if (await pathExists(packageJson)) files.push(packageJson);

  const workflowDirectory = path.join(root, ".github", "workflows");
  for (const filePath of await walkFiles(workflowDirectory)) {
    if (filePath.endsWith(".yml") || filePath.endsWith(".yaml")) files.push(filePath);
  }

  for (const filePath of files) {
    const content = await fs.readFile(filePath, "utf8");
    if (HARDCODED_SKILL_PATH.test(content)) {
      errors.push(
        `${path.relative(root, filePath)} hardcodes a Skill directory path; discover skills/* instead`,
      );
    }
  }
}

/**
 * @param {string} rootDirectory
 * @returns {Promise<string[]>}
 */
export async function validateRepository(rootDirectory) {
  /** @type {string[]} */
  const errors = [];
  const root = path.resolve(rootDirectory);
  const skillPackages = await findSkillPackages(root);
  if (skillPackages.length === 0) {
    errors.push("missing Skill package: expected one skills/<name>/SKILL.md");
  } else if (skillPackages.length !== 1) {
    errors.push(`expected exactly one Skill package, found ${skillPackages.length}`);
  }

  await checkRequiredFiles(root, skillPackages, errors);
  for (const skill of skillPackages) {
    await checkSkillIdentity(skill, errors);
    await checkSkillPackageBoundaries(skill.root, errors);
  }
  await checkMarkdownLinks(root, skillPackages, errors);
  await checkPublicCopy(root, errors);
  await checkDiscoveredPaths(root, errors);

  return errors;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  const root = process.argv[2] || process.cwd();
  const errors = await validateRepository(root);

  if (errors.length === 0) {
    console.log(
      "PASS: public repository structure, Skill package, and Markdown links are valid",
    );
  } else {
    console.error(`Repository validation failed (${errors.length} errors):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  }
}
