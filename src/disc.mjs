// @format
import { constants } from "fs";
import { readdir, stat, appendFile, access } from "fs/promises";
import { statSync } from "fs";
import { resolve } from "path";

export async function load(paths) {
  const pImports = paths.map(
    async (path) => await import(resolve(path, "index.mjs"))
  );
  return await Promise.all(pImports);
}

export async function getdirdirs(path) {
  const directories = await readdir(path);
  return directories
    .filter((file) => statSync(resolve(path, file)).isDirectory())
    .map((file) => resolve(path, file));
}

export async function write(path, header, rows) {
  try {
    await access(path, constants.R_OK);
  } catch (err) {
    await appendFile(path, `${header}\n`);
  }
  await appendFile(path, rows);
}

export function toCSV(list) {
  return list.map((entry) => Object.values(entry).join(",")).join("\n");
}

export function toJSON(list, expr) {
  return list.map((entry) => {
    const match = expr.exec(entry);
    return match.groups;
  });
}
