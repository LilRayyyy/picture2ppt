import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const REQUIRED_FILES = [
  "README.md",
  "README.en.md",
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
  "skills/picture2ppt/SKILL.md",
  "skills/picture2ppt/agents/openai.yaml",
  "skills/picture2ppt/assets/fidelity-ledger.example.json",
  "skills/picture2ppt/assets/visual-qa-report.example.json",
];

const REQUIRED_SKILL_DIRECTORIES = ["agents", "assets", "references", "scripts"];

const PROJECT_ONLY_BASENAMES = new Set([
  "README.md",
  "README.en.md",
  "LICENSE",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
  "SUPPORT.md",
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

async function pathExists(filePath) {
  try {
    await fs.stat(filePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function walkFiles(directory) {
  if (!(await pathExists(directory))) return [];
  const entries = await fs.readdir(directory, { withFileTypes: true });
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

async function checkRequiredFiles(root, errors) {
  for (const relativePath of REQUIRED_FILES) {
    if (!(await pathExists(path.join(root, relativePath)))) {
      errors.push(`missing required file: ${relativePath}`);
    }
  }

  const skillRoot = path.join(root, "skills", "picture2ppt");
  for (const directory of REQUIRED_SKILL_DIRECTORIES) {
    const relativePath = path.join("skills", "picture2ppt", directory);
    try {
      const stat = await fs.stat(path.join(skillRoot, directory));
      if (!stat.isDirectory()) errors.push(`required Skill directory is not a directory: ${relativePath}`);
    } catch (error) {
      if (error?.code === "ENOENT") {
        errors.push(`missing required Skill directory: ${relativePath}`);
      } else {
        throw error;
      }
    }
  }
}

function parseFrontmatter(markdown) {
  const normalized = markdown.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) return null;
  const closingIndex = normalized.indexOf("\n---", 4);
  if (closingIndex === -1) return null;

  const fields = new Map();
  for (const line of normalized.slice(4, closingIndex).split("\n")) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) fields.set(match[1], match[2].trim());
  }
  return fields;
}

async function checkSkillIdentity(skillRoot, errors) {
  const skillPath = path.join(skillRoot, "SKILL.md");
  if (!(await pathExists(skillPath))) return;

  const fields = parseFrontmatter(await fs.readFile(skillPath, "utf8"));
  if (!fields) {
    errors.push("Skill frontmatter is missing or malformed");
    return;
  }
  if (fields.get("name") !== "picture2ppt") {
    errors.push("Skill frontmatter name must be picture2ppt");
  }
  if (!fields.get("description")) {
    errors.push("Skill frontmatter description must be non-empty");
  }
}

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

function markdownTargets(markdown) {
  const targets = [];
  const pattern = /!?\[[^\]]*]\(([^)]+)\)/g;
  for (const match of markdown.matchAll(pattern)) {
    let target = match[1].trim();
    if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1);
    const titleSeparator = target.search(/\s+["']/);
    if (titleSeparator !== -1) target = target.slice(0, titleSeparator);
    targets.push(target);
  }
  return targets;
}

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

async function checkMarkdownLinks(root, skillRoot, errors) {
  const markdownFiles = [
    path.join(root, "README.md"),
    path.join(root, "README.en.md"),
    ...(await walkFiles(skillRoot)).filter((filePath) => filePath.endsWith(".md")),
  ];

  for (const filePath of markdownFiles) {
    if (await pathExists(filePath)) await checkMarkdownFileLinks(root, filePath, errors);
  }
}

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

export async function validateRepository(rootDirectory) {
  const errors = [];
  const root = path.resolve(rootDirectory);
  const skillRoot = path.join(root, "skills", "picture2ppt");

  await checkRequiredFiles(root, errors);
  await checkSkillIdentity(skillRoot, errors);
  await checkSkillPackageBoundaries(skillRoot, errors);
  await checkMarkdownLinks(root, skillRoot, errors);
  await checkPublicCopy(root, errors);

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
