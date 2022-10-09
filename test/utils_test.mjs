import test from "ava";

import { parseJSON, anyIpfsToNativeIpfs } from "../src/utils.mjs";

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

function ipfsTest(t, input, expected) {
  t.is(anyIpfsToNativeIpfs(input), expected);
}

[
  [
    "https://soundxyz.mypinata.cloud/ipfs/QmXHfjwQ1MKmZLmzMNWc51brBTxFRWyjXKtLLysj2e5FcU",
    "ipfs://QmXHfjwQ1MKmZLmzMNWc51brBTxFRWyjXKtLLysj2e5FcU",
  ],
  [
    "https://neume.infura-ipfs.io/ipfs/bafybeihehacot7c5dj7y5qhwgaj7q6gdxfrjfmxcltl6wmtrjxzcn6cs7e",
    "ipfs://bafybeihehacot7c5dj7y5qhwgaj7q6gdxfrjfmxcltl6wmtrjxzcn6cs7e",
  ],
  [
    "https://neume.infura-ipfs.io/ipfs/bafybeihehacot7c5dj7y5qhwgaj7q6gdxfrjfmxcltl6wmtrjxzcn6cs7e/path/to/",
    "ipfs://bafybeihehacot7c5dj7y5qhwgaj7q6gdxfrjfmxcltl6wmtrjxzcn6cs7e/path/to/",
  ],
  [
    "https://ipfs.fleek.co/ipfs/bafybeiamien6u7hqvnij4ylfz76hcv3ojshzmdklsfguz42krrs6mpaubm/",
    "ipfs://bafybeiamien6u7hqvnij4ylfz76hcv3ojshzmdklsfguz42krrs6mpaubm/",
  ],
  [
    "https://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq.ipfs.dweb.link",
    "ipfs://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq",
  ],
  [
    "https://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq.ipfs.cf-ipfs.com/wiki/Vincent_van_Gogh.html",
    "ipfs://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq/wiki/Vincent_van_Gogh.html",
  ],
].forEach((args) =>
  test(`valid anyIpfsToNativeIpfs - ${args[0]}`, ipfsTest, args[0], args[1])
);

test("anyIpfsToNativeIpfs should throw error on invalid IPFS URI", (t) => {
  t.throws(() => anyIpfsToNativeIpfs("https://neume-ipfs.network"), {
    message: "Couldn't convert https://neume-ipfs.network to native IPFS URI",
  });
});

test("anyIpfsToNativeIpfs should throw error on non string URI", (t) => {
  t.throws(() => anyIpfsToNativeIpfs(undefined), {
    message: "Given IPFS URI should be of type string",
  });
});
