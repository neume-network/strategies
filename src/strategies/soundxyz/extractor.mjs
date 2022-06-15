// @format
import { env } from "process";
import { createInterface } from "readline";
import { createReadStream } from "fs";

import { toHex, encodeCallSignature } from "eth-fun";

export const version = "0.0.1";
export const name = "soundxyz";
export const props = {
  signatures: {
    tokenURI: "tokenURI(uint256)",
  },
  contract: {
    address: "0x01ab7d30525e4f3010af27a003180463a6c811a6",
  },
  options: {
    url: env.RPC_HTTP_HOST,
  },
};

if (env.RPC_API_KEY) {
  props.options.headers = {
    Authorization: `Bearer ${env.RPC_API_KEY}`,
  };
}

export async function init(filePath) {
  const rl = createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity,
  });

  let messages = [];
  for await (const line of rl) {
    // NOTE: We're ignoring empty lines
    if (line === "") continue;
    const nfts = JSON.parse(line);

    messages = [
      ...messages,
      ...nfts
        .filter(({ address }) => address === props.contract.address)
        .map(({ tokenId, createdAtBlockNumber }) =>
          makeRequest(tokenId, createdAtBlockNumber)
        ),
    ];
  }
  messages[messages.length - 1].last = true;
  return {
    write: null,
    messages,
  };
}

export function makeRequest(tokenId, blockNumber) {
  const data = encodeCallSignature(
    props.signatures.tokenURI,
    ["uint256"],
    [tokenId]
  );

  const from = null;
  return {
    type: "json-rpc",
    commissioner: name,
    options: props.options,
    version,
    method: "eth_call",
    params: [
      {
        from,
        to: props.contract.address,
        data,
      },
      toHex(parseInt(blockNumber)),
    ],
    metadata: {
      block: {
        number: blockNumber,
      },
      contract: {
        address: props.contract.address,
      },
      tokenId,
    },
    results: null,
    error: null,
  };
}

export function update(message) {
  let messages = [];
  if (message.last) {
    messages = [
      {
        type: "transformation",
        version,
        name,
        args: null,
      },
    ];
  }

  return {
    messages,
    write: JSON.stringify({
      metadata: message.metadata,
      results: message.results,
    }),
  };
}
