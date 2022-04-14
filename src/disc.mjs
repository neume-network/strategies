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
