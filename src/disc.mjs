// @format
import { constants } from "fs";
import { appendFile, access } from "fs/promises";

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
