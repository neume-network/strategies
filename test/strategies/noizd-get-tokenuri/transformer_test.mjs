//@format
import fs from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import { onLine } from "../../../src/strategies/noizd-get-tokenuri/transformer.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const snapshot = JSON.parse(
  fs.readFileSync(resolve(__dirname, "./extractor_snapshot.json"))
);

test("noizd-get-tokenuri transformer", (t) => {
  const write = onLine(snapshot.expect.write);
  t.is(
    write,
    '{"version":"0.1.0","title":"Rick and Morty","artist":{"version":"0.1.0","name":" "},"platform":{"version":"0.1.0","name":"Noizd","uri":"https://noizd.com"},"erc721":{"version":"0.1.0","tokenURI":"https://cloudflare-ipfs.com/ipfs/QmUkHiRMC2wvNWef6Z1Lx522JPcLx2sBmavsPgbLVsPpxH","metadata":{"contract":"0xF5819E27B9bAD9F97c177Bf007c1F96F26D91CA6","image":"https://cf-prod.noizd.com/e060c2ae-5211-4617-a25b-6278e485d818/68c91b9a-d83c-427d-bf95-509ec46640a2.png","audio_url":"https://cf-prod.noizd.com/e060c2ae-5211-4617-a25b-6278e485d818/a63ac588-b3c0-400a-8909-ed2ec884d820.mpeg","animation_url":"https://cf-prod.noizd.com/e060c2ae-5211-4617-a25b-6278e485d818/a63ac588-b3c0-400a-8909-ed2ec884d820.mpeg","external_url":"https://www-prod.noizd.com/assets/8cc035fa-5aca-406f-be34-6ebd8389e26b","name":"Rick and Morty","description":"You know I keep it wavey with that champion sound 🎶 🎧","artist_name":" ","artist_address":"0xE7c8566EB4e7d8310d415d73730d665f2bEcFD14","artist_link":"https://www-prod.noizd.com/user/e060c2ae-5211-4617-a25b-6278e485d818","attributes":[{"trait_type":"genres","value":"Instrumental, Hip Hop Instrumental"},{"trait_type":"languages","value":""},{"trait_type":"countries","value":"BW"},{"trait_type":"preview","value":"https://cf-prod.noizd.com/e060c2ae-5211-4617-a25b-6278e485d818/a63ac588-b3c0-400a-8909-ed2ec884d820.mpeg"}]}},"manifestations":[{"version":"0.1.0","uri":"https://cf-prod.noizd.com/e060c2ae-5211-4617-a25b-6278e485d818/a63ac588-b3c0-400a-8909-ed2ec884d820.mpeg","mimetype":"audio"},{"version":"0.1.0","uri":"https://cf-prod.noizd.com/e060c2ae-5211-4617-a25b-6278e485d818/68c91b9a-d83c-427d-bf95-509ec46640a2.png","mimetype":"image"},{"version":"0.1.0","uri":"https://cf-prod.noizd.com/e060c2ae-5211-4617-a25b-6278e485d818/a63ac588-b3c0-400a-8909-ed2ec884d820.mpeg","mimetype":"image"}]}'
  );
});
