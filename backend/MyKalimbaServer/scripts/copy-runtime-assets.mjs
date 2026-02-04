import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const distRoot = path.join(projectRoot, "dist");

/**
 * Copy JS/runtime folders into dist so the transitional build works
 * while most of the codebase is still JavaScript.
 */
const foldersToCopy = ["sql", "public", "views"];

for (const folder of foldersToCopy) {
  const src = path.join(projectRoot, folder);
  const dst = path.join(distRoot, folder);

  if (!fs.existsSync(src)) continue;

  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.cpSync(src, dst, { recursive: true, force: true });
}
