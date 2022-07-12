// @format
import { env } from "process";
import { createInterface } from "readline";
import { createReadStream } from "fs";

import { toHex, encodeFunctionCall, decodeParameters } from "eth-fun";

const version = "0.0.1";
export const name = "soundxyz-metadata";
export const props = {
  signatures: {
    tokenToEdition: {
      name: "tokenToEdition",
      type: "function",
      inputs: [
        {
          name: "tokenId",
          type: "uint256",
        },
      ],
    },
    editions: {
      name: "editions",
      type: "function",
      inputs: [
        {
          name: "input",
          type: "uint256",
        },
      ],
    },
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

  return {
    write: null,
    messages,
  };
}

export function makeRequest(tokenId, blockNumber) {
  const data = encodeFunctionCall(props.signatures.tokenToEdition, [tokenId]);

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
  // The editions call returns 9 fields each of 32 bytes. Hence, the result contains 32*2*9 characters. Additional two characters for 0x prefix.
  const LENGTH_OF_EDITIONS_RESPONSE = 578;
  // The tokenToEdition call returns 1 field each of 32 bytes. Hence, the result contains 32*1*1 characters. Additional two characters for 0x prefix.
  const LENGTH_OF_TOKEN_TO_EDITION_RESPONSE = 66;

  if (message.results.length === LENGTH_OF_EDITIONS_RESPONSE) {
    return {
      messages: [
        {
          type: "transformation",
          version,
          name,
          args: null,
          results: null,
          error: null,
        },
      ],
      write: JSON.stringify({
        metadata: message.metadata,
        results: message.results,
      }),
    };
  } else if (message.results.length === LENGTH_OF_TOKEN_TO_EDITION_RESPONSE) {
    const edition = parseInt(decodeParameters(["uint256"], message.results));

    const data = encodeFunctionCall(props.signatures.editions, [edition]);

    const from = null;
    return {
      messages: [
        {
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
            toHex(parseInt(message.metadata.block.number)),
          ],
          metadata: {
            block: {
              number: message.metadata.block.number,
            },
            contract: {
              address: props.contract.address,
            },
            tokenId: message.metadata.tokenId,
          },
          results: null,
          error: null,
        },
      ],
      write: null,
    };
  } else {
    return {
      messages: [],
      write: null,
    };
  }
}
