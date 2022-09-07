// @format
import { createInterface } from "readline";
import { createReadStream } from "fs";
import { env } from "process";
import { resolve } from "path";

import logger from "../../logger.mjs";
import { fileExists } from "../../disc.mjs";

const version = "0.0.1";
export const name = "music-os-accumulator";
const log = logger(name);
export const props = {};

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

        const IPFSIANAScheme = "ipfs://";
        if (data.erc721.tokenURI.includes(IPFSIANAScheme)) {
          data.tokenURI = data.tokenURI.replace(
            IPFSIANAScheme,
            env.IPFS_HTTPS_GATEWAY
          );
        }
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

        if (
          data.tokenURI.includes("https://") &&
          data.tokenURI.includes("ipfs")
        ) {
          const parts = data.tokenURI.split("/");
          const hash = parts.pop();
          data.tokenURI = `${env.IPFS_HTTPS_GATEWAY}${hash}`;
        }

        const IPFSIANAScheme = "ipfs://";
        if (data.tokenURI.includes(IPFSIANAScheme)) {
          data.tokenURI = data.tokenURI.replace(
            IPFSIANAScheme,
            env.IPFS_HTTPS_GATEWAY
          );
        }
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

        if (data.tokenURI.includes("https://")) {
          const parts = data.tokenURI.split("/");
          const hash = parts.pop();
          data.tokenURI = `${env.IPFS_HTTPS_GATEWAY}${hash}`;
        }

        const IPFSIANAScheme = "ipfs://";
        if (data.tokenURI.includes(IPFSIANAScheme)) {
          data.tokenURI = data.tokenURI.replace(
            IPFSIANAScheme,
            env.IPFS_HTTPS_GATEWAY
          );
        }
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
    catalog: strategies[3].map,
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
  return {
    messages: [],
    write: JSON.stringify(trackList),
  };
}

export function update() {}
