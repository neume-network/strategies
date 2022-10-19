// @format
import { env } from "process";
import { createInterface } from "readline";
import { createReadStream } from "fs";

import { toHex, encodeFunctionCall } from "eth-fun";

import logger from "../../logger.mjs";
import { fileExists } from "../../disc.mjs";
import { eth_callSchema } from "./schema.mjs";

// Instead of querying at the block number soundxyz NFT
// was minted, we query at a higher block number because
// soundxyz changed their tokenURI and the previous one
// doesn't work anymore. https://github.com/neume-network/data/issues/19
const BLOCK_NUMBER = 15050010;

export const name = "call-tokenuri";
export const version = "0.0.1";

const log = logger(name);

const options = {
  url: env.RPC_HTTP_HOST,
};

if (env.RPC_API_KEY) {
  options.headers = {
    Authorization: `Bearer ${env.RPC_API_KEY}`,
  };
}

async function init(filePath, signature, filterFunc) {
  if (!(await fileExists(filePath))) {
    log(
      `Skipping "${name}" extractor execution as file doesn't exist "${filePath}"`
    );
    return {
      write: "",
      messages: [],
    };
  }
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
        .filter(filterFunc)
        .map(({ log }) =>
          makeRequest(
            BigInt(log.topics[3]).toString(10),
            parseInt(log.blockNumber, 16),
            log.address,
            signature
          )
        ),
    ];
  }
  return {
    write: null,
    messages,
  };
}

function makeRequest(tokenId, blockNumber, address, signature) {
  const data = encodeFunctionCall(signature, [tokenId]);

  const from = null;
  return {
    type: "json-rpc",
    options,
    version,
    method: "eth_call",
    params: [
      {
        from,
        to: address,
        data,
      },
      toHex(Math.max(blockNumber, BLOCK_NUMBER)),
    ],
    metadata: {
      block: {
        number: blockNumber,
      },
      contract: {
        address,
      },
      tokenId,
    },
    schema: eth_callSchema,
  };
}

function update(message) {
  return {
    messages: [],
    write: JSON.stringify({
      metadata: message.metadata,
      results: message.results,
    }),
  };
}

export { init, update };
