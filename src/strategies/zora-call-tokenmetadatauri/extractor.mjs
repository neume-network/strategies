// @format
import { env } from "process";
import { createInterface } from "readline";
import { createReadStream } from "fs";

import { toHex, encodeCallSignature } from "eth-fun";

export const version = "0.0.1";
export const name = "zora-call-tokenmetadatauri";
export const props = {
  signatures: {
    tokenMetadataURI: "tokenMetadataURI(uint256)",
  },
  contract: {
    address: "0xabefbc9fd2f806065b4f3c237d4b59d9a97bcac7",
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
    props.signatures.tokenMetadataURI,
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
    write: message.results,
  };
}
