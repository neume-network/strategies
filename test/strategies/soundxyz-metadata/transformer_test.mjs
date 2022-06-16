//@format
import fs from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import { onLine } from "../../../src/strategies/soundxyz-metadata/transformer.mjs";

test("soundxyz-metadata transformer", (t) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const snapshot = JSON.parse(
    fs.readFileSync(resolve(__dirname, "./extractor_snapshot.json"))
  );

  const { write } = onLine(snapshot.expect.write);
  t.is(
    write,
    '{"results":{"fundingRecipient":"0x92526B99715AFeEd324Fb56EcAFcac8056379300","price":"100000000000000000","numSold":"6","quantity":"25","royaltyBPS":"1000","startTime":"1646605996","endTime":"4294967295","presaleQuantity":"25","signerAddress":"0xA66CDDA1817C85eD3D232a5Affd17673E933D8a7"},"metadata":{"block":{"number":"14323199"},"contract":{"address":"0x01ab7d30525e4f3010af27a003180463a6c811a6"},"tokenId":"1"}}'
  );
});
