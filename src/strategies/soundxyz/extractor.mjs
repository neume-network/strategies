// @format
import { env } from "process";
import { call, encodeCallSignature, decodeCallOutput, toHex } from "eth-fun";

export const props = {
  // TODO: Document autoStart property in readme.md
  autoStart: false,
  signatures: {
    tokenURI: "tokenURI(uint256)",
  },
  node: {
    url: env.RPC_HTTP_HOST,
    options: {
      headers: {
        Authorization: `Bearer ${env.RPC_API_KEY}`,
      },
    },
  },
};

export function init(state) {
  const data = encodeCallSignature(
    signatures.tokenURI,
    ["uint256"],
    [state.tokenId]
  );

  const from = null;
  return {
    messages: [
      {
        type: "json-rpc",
        options,
        version: "0.0.1",
        method: "eth_call",
        params: [
          {
            from,
            to: address,
            data,
          },
          "latest",
        ],
        results: null,
        errors: null,
      },
    ],
    state,
  };
}

export function update(message, state) {
  return {
    messages: [],
  };
}
