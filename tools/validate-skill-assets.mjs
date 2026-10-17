import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { findSkillPackages } from "./skill-package.mjs";

/**
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
async function pathExists(filePath) {
  try {
    await fs.stat(filePath);
    return true;
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

/**
 * @param {string} program
 * @param {string[]} args
 * @returns {import("node:child_process").SpawnSyncReturns<string>}
 */
function run(program, args) {
  return spawnSync(program, args, { encoding: "utf8" });
}

/**
 * @param {string} label
 * @param {import("node:child_process").SpawnSyncReturns<string>} result
 * @param {string[]} errors
 */
function recordFailure(label, result, errors) {
  if (result.status === 0) return;
  const detail = `${result.stderr || ""}${result.stdout || ""}`.trim();
  errors.push(detail ? `${label}\n${detail}` : `${label} failed`);
}

/**
 * Syntax-check every bundled script and run the example fidelity ledger.
 * Paths come from the discovered Skill package, so a directory rename does not
 * require a matching edit in CI.
 *
 * @param {string} rootDirectory
 * @returns {Promise<string[]>}
 */
export async function validateSkillAssets(rootDirectory) {
  /** @type {string[]} */
  const errors = [];
  const skillPackages = await findSkillPackages(rootDirectory);
  if (skillPackages.length !== 1) {
    errors.push(
      skillPackages.length === 0
        ? "missing Skill package: expected one skills/<name>/SKILL.md"
        : `expected exactly one Skill package, found ${skillPackages.length}`,
    );
    return errors;
  }

  const skill = skillPackages[0];
  if (!skill) {
    errors.push("missing Skill package: expected one skills/<name>/SKILL.md");
    return errors;
  }
  const scriptsDirectory = path.join(skill.root, "scripts");
  /** @type {string[]} */
  let scriptNames;
  try {
    scriptNames = (await fs.readdir(scriptsDirectory))
      .filter((name) => name.endsWith(".mjs") && !name.endsWith(".test.mjs"))
      .sort((a, b) => a.localeCompare(b));
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
      errors.push(`missing Skill scripts directory: ${path.relative(rootDirectory, scriptsDirectory)}`);
      return errors;
    }
    throw error;
  }

  for (const name of scriptNames) {
    const scriptPath = path.join(scriptsDirectory, name);
    recordFailure(
      `${name} failed syntax check`,
      run(process.execPath, ["--check", scriptPath]),
      errors,
    );
  }

  const ledgerPath = path.join(skill.root, "assets", "fidelity-ledger.example.json");
  const ledgerValidator = path.join(scriptsDirectory, "validate-fidelity-ledger.mjs");
  if (!(await pathExists(ledgerPath)) || !(await pathExists(ledgerValidator))) {
    errors.push("missing fidelity ledger example or validate-fidelity-ledger.mjs");
  } else {
    recordFailure(
      "example fidelity ledger failed validation",
      run(process.execPath, [ledgerValidator, ledgerPath]),
      errors,
    );
  }

  return errors;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  const root = process.argv[2] || process.cwd();
  const errors = await validateSkillAssets(root);
  if (errors.length === 0) {
    console.log("PASS: skill scripts and example fidelity ledger are valid");
  } else {
    console.error(`Skill asset validation failed (${errors.length} errors):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  }
}
