//@format
import { constants } from "fs";
import { access, unlink } from "fs/promises";

import test from "ava";

import { write } from "../src/disc.mjs";

test("writing csv to disk", async (t) => {
  const path = "data.csv";
  const header = "a,b";
  const rows = "1,2";
  await write(path, header, rows);
  try {
    await access(path, constants.R_OK);
  } catch (err) {
    t.log(err);
    t.fail();
  }
  await unlink(path);
  t.pass();
});
