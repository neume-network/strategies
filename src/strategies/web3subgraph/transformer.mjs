// @format
const version = "0.1.0";

import { toJSON } from "../../disc.mjs";

function generate(address, tokenId) {
  if (address === "0x01ab7d30525e4f3010af27a003180463a6c811a6") {
    return {
      type: "extraction",
      version: "0.0.1",
      name: "soundxyz",
      state: { tokenId },
      results: null,
      error: null,
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
      state: {},
      write: null,
    };
  }
  if (!data) {
    return {
      messages: [],
      state: {},
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
    .map(({ address, tokenId }) => generate(address, tokenId))
    .filter((message) => !!message);
  return {
    messages,
    state: {},
    write: JSON.stringify(nfts),
  };
}
