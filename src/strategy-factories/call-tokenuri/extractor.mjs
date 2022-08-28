// @format
import { env } from "process";
import { createInterface } from "readline";
import { createReadStream } from "fs";

import { toHex, encodeFunctionCall } from "eth-fun";

// Instead of querying at the block number soundxyz NFT
// was minted, we query at a higher block number because
// soundxyz changed their tokenURI and the previous one
// doesn't work anymore. https://github.com/neume-network/data/issues/19
const BLOCK_NUMBER = 15050010;

/**
 * This strategy factory calls tokenURI(uint256) or equivalent function
 * on the contract.
 * */
export const callTokenUriFactory = (props) => {
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
      options,
      version,
      method: "eth_call",
      params: [
        {
          from,
          to: address,
          data,
        },
        toHex(Math.max(parseInt(blockNumber), BLOCK_NUMBER)),
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
