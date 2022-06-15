// @format
import { env } from "process";
import { createInterface } from "readline";
import { createReadStream } from "fs";

import { encodeCallSignature, decodeCallOutput } from "eth-fun";

const version = "0.0.1";
export const name = "soundxyz-metadata";
export const props = {
  signatures: {
    tokenToEdition: "tokenToEdition(uint256)",
    editions: "editions(uint256)",
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
  const data = encodeCallSignature(
    props.signatures.tokenToEdition,
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
      //TODO: https://github.com/neume-network/strategies/issues/68
      //blockNumber,
      "latest",
    ],
    metadata: {
      block: {
        // TODO: Change to actual block number
        number: "latest",
      },
      contract: {
        addresss: props.contract.address,
      },
      tokenID,
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
    const edition = parseInt(decodeCallOutput(["uint256"], message.results));

    const data = encodeCallSignature(
      props.signatures.editions,
      ["uint256"],
      [edition]
    );

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
            //TODO: https://github.com/neume-network/strategies/issues/68
            "latest",
          ],
          metadata: {
            block: {
              // TODO: Change to actual block number
              number: "latest",
            },
            contract: {
              addresss: props.contract.address,
            },
            tokenID,
            edition,
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
