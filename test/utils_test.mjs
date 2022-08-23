import test from "ava";

import { parseJSON } from "../src/utils.mjs";

test("json parser parses", (t) => {
  const data = '{"hello": "world", "invalid": "string"}';
  t.deepEqual(parseJSON(data), JSON.parse(data));
});

test("json parser throws useful message", (t) => {
  const data = '{"hello": "world", invalid: "string"}';
  try {
    parseJSON(data);
  } catch (err) {
    t.true(err.toString().includes("invalid"));
    t.true(err.toString().includes("position"));
  }
});

test("json parser can handle big distance", (t) => {
  const data = '{"hello": "world", invalid: "string"}';
  const distance = 100;
  try {
    parseJSON(data, distance);
  } catch (err) {
    t.true(err.toString().includes("invalid"));
    t.true(err.toString().includes("position"));
  }
});
