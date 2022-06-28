// @format
import { createInterface } from "readline";
import { createReadStream } from "fs";
import { env } from "process";
import { resolve } from "path";

const version = "0.0.1";
export const name = "music-os-accumulator";
export const props = {};

const strategies = [
  {
    files: ["zora-get-tokenuri-transformation"],
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
];

async function lineReader(filePath, accumulator) {
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

  // NOTE: Following code segment maps zora metadata and media blobs to neume
  // track
  const zoranfts = strategies[0].map;
  const zorametadatatokenuris = strategies[1].map;
  const zoratokenuris = strategies[2].map;

  for (let [tokenuri, value] of zoranfts) {
    const { metadata } = zorametadatatokenuris.get(tokenuri);
    if (metadata) {
      value.erc721.address = metadata.contract.address;
      value.erc721.tokenId = metadata.tokenId;

      const id = caip19(metadata.contract.address, metadata.tokenId);
      const zTokenURI = zoratokenuris.get(id);
      if (zTokenURI) {
        value.manifestations[0].uri = zTokenURI.tokenURI;
        zoranfts.set(tokenuri, value);
      } else {
        zoranfts.delete(tokenuri);
      }
    } else {
      zoranfts.delete(tokenuri);
    }
  }
  const zoraTracks = Array.from(zoranfts.values());
  const catalogTracks = zoraTracks.filter((track) => {
    const version =
      track.erc721.metadata.version ||
      (track.erc721.metadata.body && track.erc721.metadata.body.version);
    return version && version.includes("catalog");
  });
  return {
    messages: [
      {
        type: "exit",
        version: "0.0.1",
      },
    ],
    write: catalogTracks.map(JSON.stringify).join("\n"),
  };
}

export function update() {}
