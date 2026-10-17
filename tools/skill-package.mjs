import fs from "node:fs/promises";
import path from "node:path";

/**
 * @typedef {object} SkillPackage
 * @property {string} directoryName
 * @property {string} root
 */

/**
 * @param {unknown} error
 * @returns {boolean}
 */
function isEnoent(error) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

/**
 * Locate installable Skill packages by the presence of SKILL.md.
 * Callers must not assume a particular directory name: a rename is valid when
 * the directory and the frontmatter `name` stay in sync.
 *
 * @param {string} rootDirectory
 * @returns {Promise<SkillPackage[]>}
 */
export async function findSkillPackages(rootDirectory) {
  const skillsDirectory = path.join(path.resolve(rootDirectory), "skills");
  /** @type {import("node:fs").Dirent[]} */
  let entries;
  try {
    entries = await fs.readdir(skillsDirectory, { withFileTypes: true });
  } catch (error) {
    if (isEnoent(error)) return [];
    throw error;
  }

  /** @type {SkillPackage[]} */
  const packages = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) continue;
    const root = path.join(skillsDirectory, entry.name);
    try {
      const stat = await fs.stat(path.join(root, "SKILL.md"));
      if (!stat.isFile()) continue;
    } catch (error) {
      if (isEnoent(error)) continue;
      throw error;
    }
    packages.push({ directoryName: entry.name, root });
  }
  return packages;
}
