// @format
import { constants, statSync } from "fs";
import { readdir, stat, appendFile } from "fs/promises";
import { resolve, dirname, basename } from "path";
import { fileURLToPath } from "url";

import logger from "./logger.mjs";

const log = logger("disc");

const __dirname = dirname(fileURLToPath(import.meta.url));
const strategyDir = "./strategies";

export async function loadStrategies(pathTip, fileName) {
  const strategyDir = resolve(__dirname, pathTip);
  const strategies = await getdirdirs(strategyDir);
  return await loadAll(strategies, fileName);
}

export async function loadAll(paths, filename) {
  const pImports = paths.map(
    async (path) => await import(resolve(path, filename))
  );
  const results = await Promise.allSettled(pImports);

  return results
    .filter((result, i) => {
      if (result.status === "rejected") {
        log(`Rejected loading strategy with reason: "${result.reason}"`);
        return false;
      } else {
        return true;
      }
    })
    .map(({ value }, i) => ({ module: value }));
}

export async function getdirdirs(path) {
  const directories = await readdir(path);
  return directories
    .filter((file) => statSync(resolve(path, file)).isDirectory())
    .map((file) => resolve(path, file));
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
