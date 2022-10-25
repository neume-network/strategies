//@format
import fs from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

import test from "ava";

import { onLine } from "../../../src/strategies/sound-protocol-get-tokenuri/transformer.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const snapshot = JSON.parse(
  fs.readFileSync(resolve(__dirname, "./extractor_snapshot.json"))
);

test("sound-protocol-get-tokenuri transformer", (t) => {
  const write = onLine(snapshot.expect.write);
  t.is(
    write,
    '{"version":"0.1.0","title":"Terra Lago #39","artist":{"version":"0.1.0","name":"Reo Cragun"},"platform":{"version":"0.1.0","name":"Sound Protocol","uri":"https://sound.xyz"},"erc721":{"version":"0.1.0","createdAt":15665995,"tokenId":"1","address":"0xf0701a661363f463c8de5bd6b009c0e9ceaba51a","tokenURI":"ar://-bLbFg-u3BraSe7oQ90IbW3603C7VCSkS4LomfFR5V0/1","metadata":{"animation_url":"ar://S-53WSQNpa7PJ4OFrPRBwAKneOk3k-vaOVQQmiuqce4","artist":"Reo Cragun","artwork":{"mimeType":"image/png","uri":"ar://3UemdKuay5ZxV3s_YZ4cwMl6PYYaFbjRyZ37N-PB-Rk","nft":null},"attributes":[{"trait_type":"ARTIST","value":"Reo Cragun"},{"trait_type":"PROJECT","value":"frameworks"},{"trait_type":"SINGLE","value":"Terra Lago"},{"trait_type":"TYPE","value":"Song Edition"}],"bpm":null,"credits":null,"description":"Frameworks is an audiovisual project in partnership with Sound.xyz and Bonfire.\\n\\nIt\'s the first project to utilize Sound Protocol and hosted both here and on reocragun.xyz at the same time.\\n\\nWith a total of 5 songs and 333 editions it’s the first of its kind to have 5 golden eggs under one contract. \\n\\nThis project was brought to life with: \\n\\nBloody white\\nDaniel Allan \\nClear eyes \\nLackhoney \\nPluko \\nDeegan \\nSubb \\nGho$tLord\\nEvrlstng \\nCooper Turley\\n\\nMy last album Diary of a Loner was introspective, while Frameworks is bold and in your face. \\n\\nThe marathon continues!","duration":170,"external_url":"https://www.sound.xyz/reocragun/terra-lago","genre":"Hip-hop & Rap","image":"ar://3UemdKuay5ZxV3s_YZ4cwMl6PYYaFbjRyZ37N-PB-Rk","isrc":null,"key":null,"license":null,"locationCreated":null,"losslessAudio":"ar://S-53WSQNpa7PJ4OFrPRBwAKneOk3k-vaOVQQmiuqce4","lyrics":null,"mimeType":"audio/wave","nftSerialNumber":39,"name":"Terra Lago #39","originalReleaseDate":null,"project":{"title":"frameworks","artwork":{"uri":"ar://IVE8kT4x3I2vSZnp8AnmjV_Cefc5NkOx1KAZsGStgBc","mimeType":"image/gif","nft":null},"description":"Frameworks is an audiovisual project in partnership with Sound.xyz and Bonfire.\\n\\nIt\'s the first project to utilize Sound Protocol and hosted both here and on reocragun.xyz at the same time.\\n\\nWith a total of 5 songs and 333 editions it’s the first of its kind to have 5 golden eggs under one contract. \\n\\nThis project was brought to life with: \\n\\nBloody white\\nDaniel Allan \\nClear eyes \\nLackhoney \\nPluko \\nDeegan \\nSubb \\nGho$tLord\\nEvrlstng \\nCooper Turley\\n\\nMy last album Diary of a Loner was introspective, while Frameworks is bold and in your face. \\n\\nThe marathon continues!","originalReleaseDate":null,"type":"Album","publisher":null,"recordLabel":null,"upc":null},"publisher":null,"recordLabel":null,"tags":null,"title":"Terra Lago","trackNumber":2,"version":"sound-edition-20220930","visualizer":null}},"manifestations":[{"version":"0.1.0","uri":"ar://S-53WSQNpa7PJ4OFrPRBwAKneOk3k-vaOVQQmiuqce4","mimetype":"audio"},{"version":"0.1.0","uri":"ar://3UemdKuay5ZxV3s_YZ4cwMl6PYYaFbjRyZ37N-PB-Rk","mimetype":"image"}]}'
  );
});
