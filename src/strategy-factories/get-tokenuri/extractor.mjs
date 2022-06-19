// @format
import { env } from "process";
import { createInterface } from "readline";
import { createReadStream } from "fs";

import { toHex, encodeCallSignature } from "eth-fun";

/**
 * This strategy factory calls tokenURI(uint256) or equivalent function
 * on the contract.
 * */
export const getTokenUriFactory = (props) => {
  const { strategyName, version, signature, address } = props;

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
          .filter(({ address }) => address === props.address)
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

  function makeRequest(tokenId, blockNumber) {
    const data = encodeCallSignature(signature, ["uint256"], [tokenId]);

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
        toHex(parseInt(blockNumber)),
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
    let messages = [];
    if (message.last) {
      messages = [
        {
          type: "transformation",
          version,
          name: strategyName,
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

  return {
    init,
    update,
  };
};
