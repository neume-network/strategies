// @format
import { env } from "process";
import { createInterface } from "readline";
import { createReadStream } from "fs";

import { toHex, encodeFunctionCall } from "eth-fun";

const BLOCK_NUMBER = 15050010;

/**
 * This strategy factory calls tokenURI(uint256) or equivalent function
 * on the contract.
 * */
export const getTokenUriFactory = (props) => {
  const { strategyName, version, signature, filterFunc } = props;

  const options = {
    url: env.RPC_HTTP_HOST,
  };

  if (env.RPC_API_KEY) {
    options.headers = {
      Authorization: `Bearer ${env.RPC_API_KEY}`,
    };
  }

  async function init(filePath) {
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
          .map(({ tokenId, createdAtBlockNumber, address }) =>
            makeRequest(tokenId, createdAtBlockNumber, address)
          ),
      ];
    }
    return {
      write: null,
      messages,
    };
  }

  function makeRequest(tokenId, blockNumber, address) {
    const data = encodeFunctionCall(signature, [tokenId]);

    const from = null;
    return {
      type: "json-rpc",
      commissioner: strategyName,
      options,
      version,
      method: "eth_call",
      params: [
        {
          from,
          to: address,
          data,
        },
        toHex(BLOCK_NUMBER),
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
      results: null,
      error: null,
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

  return {
    init,
    update,
  };
};
