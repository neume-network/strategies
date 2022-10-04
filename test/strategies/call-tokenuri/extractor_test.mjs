// @format
import test from "ava";

import snapshotExtractor from "../../../utils/snapshot_extractor.mjs";
import snapshot from "./extractor_snapshot.mjs";
import * as callTokenUri from "../../../src/strategies/call-tokenuri/extractor.mjs";

test("call-tokenuri extractor", async (t) => {
  const result = await snapshotExtractor(callTokenUri, snapshot);
  t.deepEqual(JSON.parse(result), JSON.parse(snapshot.expect.write));
});
