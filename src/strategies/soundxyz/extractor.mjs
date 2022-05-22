// @format
import { env } from "process";
import { call, encodeCallSignature, decodeCallOutput, toHex } from "eth-fun";

export const name = "soundxyz";
export const props = {
  // TODO: Document autoStart property in readme.md
  autoStart: false,
  signatures: {
    tokenURI: "tokenURI(uint256)",
  },
  contract: {
    address: "0x01ab7d30525e4f3010af27a003180463a6c811a6",
  },
  options: {
    url: env.RPC_HTTP_HOST,
    headers: {
      Authorization: `Bearer ${env.RPC_API_KEY}`,
    },
  },
};

export function init(state) {
  const data = encodeCallSignature(
    props.signatures.tokenURI,
    ["uint256"],
    [state.tokenId]
  );

  const from = null;
  return {
    messages: [
      {
        type: "json-rpc",
        commissioner: name,
        options: props.options,
        version: "0.0.1",
        method: "eth_call",
        params: [
          {
            from,
            to: props.contract.address,
            data,
          },
          "latest",
        ],
        results: null,
        error: null,
      },
    ],
    state,
  };
}

export function update(message, state) {
  return {
    messages: [
      {
        type: "transformation",
        version: "0.0.1",
        name,
        args: null,
        results: null,
        error: null,
      },
    ],
    state: {},
    write: message.results,
  };
}
