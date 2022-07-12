// @format
import { resolve } from "path";
import { env } from "process";

import logger from "../../logger.mjs";

export const name = "soundxyz-get-tokenuri";
const log = logger(name);
export const version = "0.1.0";

export function onClose() {
  log("closed");
  return {
    write: null,
    messages: [
      {
        type: "extraction",
        version,
        name: "zora-call-tokenuri",
        args: [resolve(env.DATA_DIR, `web3subgraph-transformation`)],
      },
    ],
  };
}

export function onError(error) {
  log(error.toString());
  throw error;
}

export function onLine(line) {
  const obj = JSON.parse(line);
  const datum = obj.results;
  return {
    messages: [],
    write: JSON.stringify({
      version,
      title: datum.name,
      // TODO
      //duration: "PT0M",
      artist: {
        version,
        name: datum.artist_name,
      },
      platform: {
        version,
        name: "Sound",
        uri: "https://sound.xyz",
      },
      erc721: {
        version,
        // TODO
        //address: nft[1],
        //tokenId: nft[2],
        tokenURI: obj.metadata.tokenURI,
        metadata: {
          ...datum,
        },
      },
      manifestations: [
        {
          version,
          uri: datum.audio_url,
          mimetype: "audio",
        },
        {
          version,
          uri: datum.image,
          mimetype: "image",
        },
        {
          version,
          uri: datum.animation_url,
          mimetype: "image",
        },
      ],
    }),
  };
}
