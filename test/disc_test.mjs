//@format
import { constants } from "fs";
import { access, unlink } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import { toJSON, toCSV, write, getdirdirs, load } from "../src/disc.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

test("test loading & validating primitives", async (t) => {
  const path = resolve(__dirname, "../src/primitives");
  const dirs = await getdirdirs(path);
  const primitives = await load(dirs);
  t.truthy(primitives);
  t.plan(primitives.length * 3 + 1);
  for (const primitive of primitives) {
    t.is(typeof primitive.init, "function");
    t.is(typeof primitive.update, "function");
    t.is(typeof primitive.transform, "function");
    t.is(typeof primitive.props, "object");
  }
});

test("reading directory files", async (t) => {
  const path = resolve(__dirname, "../");
  const dirs = await getdirdirs(path);
  t.true(dirs.includes(resolve(path, "src")));
  t.true(dirs.includes(resolve(path, "test")));
  t.false(dirs.includes(resolve(path, "readme.md")));
});

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

test("transforming to CSV", (t) => {
  const list = [
    { address: "abc", tokenId: "1", tokenURI: "https://example.com" },
    { address: "def", tokenId: "2", tokenURI: "https://example2.com" },
  ];
  const result = toCSV(list);
  t.is("abc,1,https://example.com\ndef,2,https://example2.com", result);
});

test("tranform from original => JSON => CSV", (t) => {
  const addr = "0x881D40237659C251811CEC9c364ef91dC08D300C";
  const list = [`${addr}/1`, `${addr}/2`];
  const expr = new RegExp(
    "^(?<address>0x[a-fA-F0-9]{40})\\/(?<tokenId>[0-9]*)$"
  );
  const result = toCSV(toJSON(list, expr));
  t.is(`${addr},1\n${addr},2`, result);
});

test("transforming to JSON", (t) => {
  const addr = "0x881D40237659C251811CEC9c364ef91dC08D300C";
  const list = [`${addr}/1`, `${addr}/2`];
  const expr = new RegExp(
    "^(?<address>0x[a-fA-F0-9]{40})\\/(?<tokenId>[0-9]*)$"
  );
  const result = toJSON(list, expr);
  t.deepEqual(
    [
      { address: addr, tokenId: "1" },
      { address: addr, tokenId: "2" },
    ],
    result
  );
});
