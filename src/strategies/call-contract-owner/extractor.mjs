import { env } from "process";
import { createInterface } from "readline";
import { createReadStream } from "fs";

import { toHex, encodeFunctionSignature } from "eth-fun";

const version = "0.0.1";
export const name = "call-contract-owner";
export const props = {};

const options = {
  url: env.RPC_HTTP_HOST,
};

if (env.RPC_API_KEY) {
  options.headers = {
    Authorization: `Bearer ${env.RPC_API_KEY}`,
  };
}

const signature = {
  name: "owner",
  type: "function",
  inputs: [],
};

export function makeRequest(to, blockNumber) {
  return {
    type: "json-rpc",
    commissioner: name,
    method: "eth_call",
    params: [
      {
        from: null,
        to,
        data: encodeFunctionSignature(signature),
      },
      toHex(parseInt(blockNumber, 10)),
    ],
    version,
    options,
    results: null,
    error: null,
  };
}

export async function init(filePath) {
  const rl = createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity,
  });

  const contracts = new Set();
  for await (const line of rl) {
    // NOTE: We're ignoring empty lines
    if (line === "") continue;
    const nfts = JSON.parse(line);

    nfts.forEach(({ address, createdAtBlockNumber }) =>
      contracts.add({ address, block: { number: createdAtBlockNumber } })
    );
  }

  const contractList = Array.from(contracts.values());
  return {
    messages: contractList.map(({ address, block }) =>
      makeRequest(address, block.number)
    ),
    write: null,
  };
}

export function update(message) {
  if (message.results) {
    return {
      messages: [],
      write: JSON.stringify({
        metadata: {
          block: {
            number: parseInt(message.params[1], 16),
          },
          contract: {
            address: message.params[0].to,
          },
        },
        results: message.results,
      }),
    };
  }
}
