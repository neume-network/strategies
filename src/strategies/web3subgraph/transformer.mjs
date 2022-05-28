// @format
const version = "0.1.0";

import { toJSON } from "../../disc.mjs";

function generate(address, tokenId, blockNumber) {
  if (address === "0x01ab7d30525e4f3010af27a003180463a6c811a6") {
    return {
      type: "extraction",
      version: "0.0.1",
      name: "soundxyz",
      args: [tokenId, `0x${blockNumber.toString(16)}`],
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
    data.nfts.map((entry) => entry.id),
    expr
  );
  const messages = nfts
    .map(({ address, tokenId }) =>
      generate(address, tokenId, data._meta.block.number)
    )
    .filter((message) => !!message);
  return {
    messages,
    write: JSON.stringify(nfts),
  };
}
