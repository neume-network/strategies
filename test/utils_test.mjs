import test from "ava";

import { parseJSON, deepMapKeys } from "../src/utils.mjs";

test("deep map object keys", (t) => {
  const obj = {
    a: 1,
    b: {
      c: 2,
    },
    d: {},
    e: [],
    f: [3],
    g: [{ h: 4 }],
    i: [{ j: { k: [{ l: 5 }] } }],
    m: null,
    n: undefined,
    o: 0,
    p: true,
    q: false,
  };
  t.plan(8);
  deepMapKeys(obj, (key, value) => {
    if (key === "a") t.is(value, 1);
    if (key === "c") t.is(value, 2);
    if (key === "h") t.is(value, 4);
    if (key === "l") t.is(value, 5);
    if (key === "m") t.is(value, null);
    if (key === "o") t.is(value, 0);
    if (key === "p") t.is(value, true);
    if (key === "q") t.is(value, false);
  });
});

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
