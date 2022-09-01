// @format
import test from "ava";

import { callTokenUriFactory } from "../../../src/strategy-factories/call-tokenuri/extractor.mjs";

test("if call-tokenuri factory can gracefully shutdown if source file doesn't exist", async (t) => {
  const name = "test name";
  const { init, update } = callTokenUriFactory(name);
  const sourcePath = "non-existent";
  const result = await init(sourcePath);
  t.deepEqual(result, { write: "", messages: [] });
});
