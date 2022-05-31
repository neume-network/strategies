// @format
const version = "0.1.0";

import { toHex } from "eth-fun";
import { toJSON } from "../../disc.mjs";

function generate(address, tokenId, blockNumber) {
  if (address === "0x01ab7d30525e4f3010af27a003180463a6c811a6") {
    return {
      type: "extraction",
      version: "0.0.1",
      name: "soundxyz",
      args: [tokenId, toHex(parseInt(blockNumber))],
    };
  }
}

export function transform(line) {
  let data;
  try {
    data = JSON.parse(line);
  } catch (err) {
    return {
      messages: [],
      write: null,
    };
  }
  if (!data) {
    return {
      messages: [],
      write: null,
    };
  }
  const expr = new RegExp(
    "^(?<address>0x[a-fA-F0-9]{40})\\/(?<tokenId>[0-9]*)$"
  );
  const nfts = toJSON(
    data.map((entry) => entry.id),
    expr
  );
  const messages = nfts
    .map(({ address, tokenId }, i) =>
      generate(address, tokenId, data[i].createdAtBlockNumber)
    )
    .filter((message) => !!message);
  return {
    messages,
    write: JSON.stringify(nfts),
  };
}
