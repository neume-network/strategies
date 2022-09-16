//@format
import fs from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import { onLine } from "../../../src/strategies/soundxyz-get-tokenuri/transformer.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const snapshot = JSON.parse(
  fs.readFileSync(resolve(__dirname, "./extractor_snapshot.json"))
);

test("soundxyz-get-tokenuri transformer", (t) => {
  const { write } = onLine(snapshot.expect.write);
  t.is(
    write,
    '{"version":"0.1.0","title":"Fever Dream #1","artist":{"version":"0.1.0","name":"Dot"},"platform":{"version":"0.1.0","name":"Sound","uri":"https://sound.xyz"},"erc721":{"version":"0.1.0","tokenURI":"https://metadata.sound.xyz/v1/0x01ab7d30525e4f3010af27a003180463a6c811a6/1","metadata":{"name":"Fever Dream #1","artist_name":"Dot","description":"My name is Kate Ellwanger, and I make music as Dot. I\'m originally from Olympia, WA, and now spend my time between Los Angeles and Ketchum, Idaho. \\n\\n\\"Fever Dream\\" is the first single from my new EP, and each song on the project represents a different type of battle I\'ve fought with grief and depression over the past year. While the instrumental of this song has a brighter and easygoing feel, the lyrics hint at some darkness underneath the glossy exterior. \\n\\nThe song paints a surrealistic picture of a person\'s desire to wake up from the dream states so many of us live in, but going about it in all the wrong ways -- through self-destructive behavior and romanticized substance abuse. It follows the main character on a road trip from LA to Las Vegas, with the lyrics becoming more and more nonsensical and drifting further from reality as the music progresses. \\n\\nI wrote this song as a reminder to myself that seeking altered states through those shortcuts will never lead you to true fulfillment or wakefulness -- they just keep you in a feedback loop of dishonest self-reflection, and searching for more highs that ultimately take you nowhere. \\n\\nI think this message is especially important during a time when so many of us are trying to find meaning in our lives, but what we see spread across the news and on our timelines devalues human life on so many levels. It\'s easier to take on a carefree \\"yolo\\" mentality in this environment than to truly show love to ourselves and the people around us, because the cognitive dissonance becomes so overwhelming amidst current events.","external_url":"https://www.sound.xyz/dot/fever-dream","image":"https://soundxyz.mypinata.cloud/ipfs/QmSJ3waSjiqLLgrW3n6dXUJhmRaouUYsBdf1kGs1duC9St","audio_url":"https://soundxyz.mypinata.cloud/ipfs/QmfXoeHScHC68PVCdtTj8NhxGeSSmhVRNqQSt6kVv4TxiG","animation_url":"https://soundxyz.mypinata.cloud/ipfs/QmfXoeHScHC68PVCdtTj8NhxGeSSmhVRNqQSt6kVv4TxiG","comment_wall_url":"https://soundxyz.mypinata.cloud/ipfs/QmXuXAjU3FoaT8hH4gjeeeV4jpExJFM55u7KPD5QpLiYw2","attributes":[{"trait_type":"Fever Dream","value":"Song Edition"},{"value":"Genesis"}]}},"manifestations":[{"version":"0.1.0","uri":"https://soundxyz.mypinata.cloud/ipfs/QmfXoeHScHC68PVCdtTj8NhxGeSSmhVRNqQSt6kVv4TxiG","mimetype":"audio"},{"version":"0.1.0","uri":"https://soundxyz.mypinata.cloud/ipfs/QmSJ3waSjiqLLgrW3n6dXUJhmRaouUYsBdf1kGs1duC9St","mimetype":"image"},{"version":"0.1.0","uri":"https://soundxyz.mypinata.cloud/ipfs/QmfXoeHScHC68PVCdtTj8NhxGeSSmhVRNqQSt6kVv4TxiG","mimetype":"image"}]}'
  );
});
