//@format
import fs from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import { onLine } from "../../../src/strategies/zora-drops-call-tokenuri/transformer.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const snapshot = JSON.parse(
  fs.readFileSync(resolve(__dirname, "./extractor_snapshot.json"))
);

test("zora-drops-call-tokenuri transformer", (t) => {
  const write = onLine(snapshot.expect.write);
  const expected = {
    metadata: {
      block: { number: 15610515 },
      contract: {
        address: "0x5ba2cae53603fc0e533fc19765ad09e2dc414de6",
      },
      tokenId: "1",
    },
    tokenURI:
      "data:application/json;base64,eyJuYW1lIjogIlRoZSBNZXJnZSBvcjogSG93IEkgTGVhcm5lZCB0byBTdG9wIFdvcnJ5aW5nIGFuZCBMb3ZlIHRoZSBMaXF1aWQgU3BsaXRzIDEiLCAiZGVzY3JpcHRpb24iOiAiNS42NyBFVEggd2FzIHN0dWNrIGluIFRoZSBNZXJnZSBDb250cmFjdCAoJDcsNTM3LjA5KS5cblxudGhlIG1lbWVzOiDwn6agXG4tIFRoZSBNZXJnZVxuLSBMaXF1aWQgU3BsaXRzXG4tIEVJUDI5Mjlcblxud2hlcmUgSSBmYWlsZWQ6IPCfmJNcbi0gSSBmYWlsZWQgdG8ga25vdyB0cmFuc2ZlciBoYXMgYSBzdHJpY3QgZ2FzLWxpbWl0IG9mIDIsMzAwXG4tIEkgZmFpbGVkIHRvIHdyaXRlIGEgd2l0aGRyYXcgbWV0aG9kIHRoYXQgd29ya2VkIHdpdGggU29uZy1BLURheSBEQU8ncyBHbm9zaXMgU2FmZVxuLSBJIGZhaWxlZCB0byBidWlsZCBhIHNvbHV0aW9uIHdpdGggRUlQMjkyOVxuXG53aGVyZSBJIHN1Y2NlZWRlZDogXG4tIEkgd2Fzbid0IGFmcmFpZCB0byBhZG1pdCBJIGZhaWxlZCAmIGFzayBmb3IgaGVscFxuLSBJIG5ldmVyIGdhdmUgdXAuIEkga2VwdCB0cnlpbmcgdW50aWwuLi5cbi0gSSBGT1VORCBBIFNPTFVUSU9OIPCfjIhcblxuQWxsIGZ1bmRzIHJlY2VpdmVkIGZyb20gdGhpcyBwcm9qZWN0IGFyZSBkaXZpZGVkIHVzaW5nIDB4U3BsaXRzOlxuLSBMaXF1aWQgU3BsaXQ6IFRoZSBNZXJnZVxuLSBFdGhlcmV1bSBDb3JlIERldnNcbi0gU29uZyBhIERheSBEQU9cbi0gbXlzZWxmIChjcmVhdG9yKVxuLSBTcGxpdDogMHgwMkY5NEM5OTdDNzg0YkIyYzk0NzNEMzA4NTIwODA3MmM2NjlFZDQ3XG5cbkZ1bGwgVmlkZW8gb24gWW91VHViZTog8J+OrFxuaHR0cHM6Ly95b3V0dS5iZS9wemU2TDcxSWo5cyAiLCAiaW1hZ2UiOiAiaXBmczovL2JhZmtyZWlkN3FxbXBsbmU0YjRyZ2JuYTZoYmp3dmFuenNqZGg1dDV2eHU3M2g3ZjYzbGl6end1aGVtP2lkPTEiLCAiYW5pbWF0aW9uX3VybCI6ICJpcGZzOi8vYmFmeWJlaWJqdnZ0cnUzY29tcGdtbjJ2NHVzZmVxZXBsNjRhNXF4N3Bzc3M0aGN2dmFnaWVrcHVmZWE/aWQ9MSIsICJwcm9wZXJ0aWVzIjogeyJudW1iZXIiOiAxLCAibmFtZSI6ICJUaGUgTWVyZ2Ugb3I6IEhvdyBJIExlYXJuZWQgdG8gU3RvcCBXb3JyeWluZyBhbmQgTG92ZSB0aGUgTGlxdWlkIFNwbGl0cyJ9fQ==",
  };
  t.is(write, JSON.stringify(expected));
});
