// @format
import { createInterface } from "readline";
import { createReadStream } from "fs";
import { env } from "process";
import { resolve } from "path";

import uniqWith from "lodash.uniqwith";

import logger from "../../logger.mjs";
import { fileExists } from "../../disc.mjs";

const version = "0.0.1";
export const name = "music-os-accumulator";
const log = logger(name);

const strategies = [
  {
    files: [
      "zora-get-tokenuri-transformation",
      "soundxyz-get-tokenuri-transformation",
    ],
    map: new Map(),
    accumulator: (map) => {
      return (line) => {
        const data = JSON.parse(line);
        map.set(data.erc721.tokenURI, data);
      };
    },
  },
  {
    files: [
      "zora-call-tokenmetadatauri-transformation",
      "soundxyz-call-tokenuri-transformation",
    ],
    map: new Map(),
    accumulator: (map) => {
      return (line) => {
        const data = JSON.parse(line);
        const id = caip19(
          data.metadata.contract.address,
          data.metadata.tokenId
        );

        map.set(id, data);
        map.set(data.tokenURI, data);
      };
    },
  },
  {
    files: ["zora-call-tokenuri-transformation"],
    map: new Map(),
    accumulator: (map) => {
      return (line) => {
        const data = JSON.parse(line);
        const id = caip19(
          data.metadata.contract.address,
          data.metadata.tokenId
        );

        map.set(id, data);
        map.set(data.tokenURI, data);
      };
    },
  },
  {
    files: ["catalog-get-tokenuri-transformation"],
    map: [],
    accumulator: (list) => {
      return (line) => {
        const data = JSON.parse(line);
        list.push(data);
      };
    },
  },
  {
    files: ["mintsongs-get-tokenuri-transformation"],
    map: [],
    accumulator: (list) => {
      return (line) => {
        const data = JSON.parse(line);
        list.push(data);
      };
    },
  },
  {
    files: ["noizd-get-tokenuri-transformation"],
    map: [],
    accumulator: (list) => {
      return (line) => {
        const data = JSON.parse(line);
        list.push(data);
      };
    },
  },
  {
    files: ["sound-protocol-get-tokenuri-transformation"],
    map: new Map(),
    accumulator: (map) => {
      return (line) => {
        const data = JSON.parse(line);
        // unique each song by sound edition contract address and trackNumber
        const id = caip19(
          data.erc721.address,
          data.erc721.metadata.trackNumber
        );
        !map.has(id) && map.set(id, data);
      };
    },
  },
];

async function lineReader(filePath, accumulator) {
  if (!(await fileExists(filePath))) {
    log(
      `Couldn't find source file in music-os-accumulator for file "${filePath}"`
    );
    return;
  }
  const rl = createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line === "") continue;
    accumulator(line);
  }
  return;
}

function caip19(address, tokenId) {
  return `eip155:1/erc721:${address}/${tokenId}`;
}

function isUnique(arrVal, othVal) {
  return (
    arrVal.erc721.address === othVal.erc721.address &&
    arrVal.erc721.tokenId == othVal.erc721.tokenId
  );
}

export async function init() {
  const maps = [];
  for await (const strategyType of strategies) {
    for await (const file of strategyType.files) {
      const filePath = resolve(env.DATA_DIR, file);
      await lineReader(filePath, strategyType.accumulator(strategyType.map));
    }
  }

  const data = {
    metadata: strategies[0].map,
    uris: strategies[1].map,
    zora: {
      tokenuri: strategies[2].map,
    },
  };

  const tracks = new Map();
  for (let [tokenURI, metadata] of data.metadata) {
    if (
      metadata.platform.name === "Catalog" &&
      metadata.platform.version === "1.0.0"
    ) {
      const chainData = data.uris.get(tokenURI);
      metadata.erc721.address = chainData.metadata.contract.address;
      metadata.erc721.tokenId = chainData.metadata.tokenId;
      metadata.erc721.createdAt = chainData.metadata.block.number;

      const caip19Id = caip19(
        chainData.metadata.contract.address,
        chainData.metadata.tokenId
      );
      const version =
        metadata.erc721.metadata.version ||
        (metadata.erc721.metadata.body &&
          metadata.erc721.metadata.body.version);
      const media = data.zora.tokenuri.get(caip19Id);

      if (media && version && version.includes("catalog")) {
        metadata.manifestations[0].uri = media.tokenURI;
        metadata.manifestations[0].mimetype = "audio";
        tracks.set(tokenURI, metadata);
      }
    } else if (metadata.platform.name === "Sound") {
      const chainData = data.uris.get(tokenURI);
      metadata.erc721.createdAt = chainData.metadata.block.number;
      metadata.erc721.address = chainData.metadata.contract.address;
      metadata.erc721.tokenId = chainData.metadata.tokenId;
      tracks.set(tokenURI, metadata);
    }
  }
  let trackList = Array.from(tracks.values());
  trackList = [...trackList, ...strategies[3].map];
  trackList = [...trackList, ...strategies[4].map];
  trackList = [...trackList, ...strategies[5].map];
  trackList = [...trackList, ...Array.from(strategies[6].map.values())];
  // NOTE: See: https://github.com/neume-network/strategies/issues/246#issuecomment-1240365903
  trackList = uniqWith(trackList, isUnique);
  return {
    messages: [],
    write: JSON.stringify(trackList),
  };
}

export function update() {}
