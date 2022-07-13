import { env } from "process";

import { decodeParameters, encodeFunctionCall } from "eth-fun";

const version = "0.0.1";
export const name = "call-mintsongs-v2-tokenuri";
export const props = {};

const options = {
  url: env.RPC_HTTP_HOST,
};

if (env.RPC_API_KEY) {
  options.headers = {
    Authorization: `Bearer ${env.RPC_API_KEY}`,
  };
}

const address = "0x2B5426A5B98a3E366230ebA9f95a24f09Ae4a584";
const signature = {
  name: "tokenURI",
  type: "function",
  inputs: [
    {
      name: "tokenId",
      type: "uint256",
    },
  ],
};

const callTemplate = (tokenId) => encodeFunctionCall(signature, [tokenId]);

export function init(start = 1) {
  return {
    write: null,
    messages: [
      {
        type: "json-rpc",
        commissioner: name,
        method: "eth_call",
        params: [
          {
            from: null,
            to: address,
            data: callTemplate(start),
          },
          "latest",
        ],
        metadata: {
          tokenId: start,
        },
        version,
        options,
        results: null,
        error: null,
      },
    ],
  };
}

export function update(message) {
  const newTokenId = message.metadata.tokenId + 1;
  const [tokenURI] = decodeParameters(["string"], message.results);
  return {
    write: tokenURI,
    messages: [
      {
        type: "json-rpc",
        commissioner: name,
        method: "eth_call",
        params: [
          {
            from: null,
            to: address,
            data: callTemplate(newTokenId),
          },
          "latest",
        ],
        metadata: {
          tokenId: newTokenId,
        },
        version,
        options,
        results: null,
        error: null,
      },
    ],
  };
}
