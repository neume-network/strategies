// @format
import { constants } from "fs";
import { readdir, stat, appendFile, access } from "fs/promises";
import { statSync } from "fs";
import { resolve, basename } from "path";

import logger from "./logger.mjs";

const log = logger("disc");

export async function loadAll(paths, filename) {
  const names = paths.map((path) => basename(path));
  const pImports = paths.map(
    async (path) => await import(resolve(path, filename))
  );
  const results = await Promise.allSettled(pImports);

  return results
    .filter((result, i) => {
      if (result.status === "rejected") {
        names.splice(i, 1);
        log(`Rejected loading strategy with reason: "${result.reason}"`);
        return false;
      } else {
        return true;
      }
    })
    .map(({ value }, i) => ({ module: value, name: names[i] }));
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
