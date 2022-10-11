// @format
import { env } from "process";
import { createInterface } from "readline";
import { createReadStream } from "fs";

import { toHex, encodeFunctionCall } from "eth-fun";

import logger from "../../logger.mjs";
import { fileExists } from "../../disc.mjs";
import { eth_callSchema } from "../../strategy-factories/call-tokenuri/schema.mjs";
import { decodeParameters } from "eth-fun";

export const version = "0.0.1";
export const name = "sound-protocol-call-tokenuri";

const signature = {
  tokenURI: {
    name: "tokenURI",
    type: "function",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
      },
    ],
  },
  nextTokenId: {
    inputs: [],
    name: "nextTokenId",
    type: "function",
  },
};
const filterFunc = ({ platform }) => platform.name === "sound-protocol";
const BLOCK_NUMBER = 15050010;
const log = logger(name);

const options = {
  url: env.RPC_HTTP_HOST,
};

if (env.RPC_API_KEY) {
  options.headers = {
    Authorization: `Bearer ${env.RPC_API_KEY}`,
  };
}

export async function init(filePath) {
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
        .map(({ createdAtBlockNumber, address }) =>
          makeRequest(createdAtBlockNumber, address)
        ),
    ];
  }
  return {
    write: null,
    messages,
  };
}

function makeRequest(blockNumber, address) {
  const data = encodeFunctionCall(signature.nextTokenId, []);

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
    },
    schema: eth_callSchema,
  };
}

export function update(message) {
  // The nextTokenId call returns 1 field each of 32 bytes. Hence, the result contains 32*1*1 characters. Additional two characters for 0x prefix.
  const LENGTH_OF_NEXT_TOKENID = 66;
  if (message.results.length === LENGTH_OF_NEXT_TOKENID) {
    const nextTokenId = parseInt(
      decodeParameters(["uint256"], message.results)
    );

    const from = null;
    const address = message.params[0].to;
    const blockNumber = message.metadata.block.number;

    const messages = new Array(nextTokenId - 1).fill(null).map((_, index) => ({
      type: "json-rpc",
      options,
      version,
      method: "eth_call",
      params: [
        {
          from,
          to: address,
          data: encodeFunctionCall(signature.tokenURI, [index + 1]),
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
        tokenId: index + 1,
      },
      schema: eth_callSchema,
    }));

    return {
      messages,
      write: null,
    };
  }

  return {
    messages: [],
    write: JSON.stringify({
      metadata: message.metadata,
      results: message.results,
    }),
  };
}

export function write(writeResult, string) {
  const res = JSON.parse(string);
  const [tokenURI] = decodeParameters(["string"], res.results);
  if (writeResult === "")
    return JSON.stringify({
      metadata: {
        block: {
          number: res.metadata.block.number,
        },
        contract: {
          address: res.metadata.contract.address,
        },
      },
      results: [tokenURI],
    });

  const writeObject = JSON.parse(writeResult);
  writeObject.results.push(tokenURI);
  return JSON.stringify(writeObject);
}
