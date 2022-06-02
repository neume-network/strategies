// @format
import { env } from "process";
import { resolve } from "path";

import { toHex } from "eth-fun";

import { toJSON } from "../../disc.mjs";
import logger from "../../logger.mjs";

const name = "web3subgraph";
const log = logger(name);
const version = "0.1.0";

export function onLine(line) {
  // NOTE: Parse isn't enclosed in a try catch loop as we want to catch the
  // error when we're envoking `function onLine`.
  const data = JSON.parse(line);
  if (!data) {
    throw new Error(`No data passed to "onLine" handler`);
  }
  const expr = new RegExp(
    "^(?<address>0x[a-fA-F0-9]{40})\\/(?<tokenId>[0-9]*)$"
  );
  let nfts = toJSON(
    data.map((entry) => entry.id),
    expr
  );
  nfts = nfts.map((nft, i) => {
    nft.createdAtBlockNumber = data[i].createdAtBlockNumber;
    return nft;
  });

  return {
    messages: [],
    write: JSON.stringify(nfts),
  };
}

export function onError(error) {
  // TODO: Figure out how to properly handle errors in transformers
  log(error.toString());
  throw error;
}

export function onClose() {
  const fileName = `${name}-transformation`;
  return {
    messages: [
      {
        type: "extraction",
        version,
        name: "soundxyz",
        args: [resolve(env.DATA_DIR, fileName)],
      },
      {
        type: "extraction",
        version,
        name: "soundxyz-metadata",
        args: [resolve(env.DATA_DIR, fileName)],
      },
    ],
    write: null,
  };
}
