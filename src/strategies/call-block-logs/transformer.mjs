// @format
import { encodeFunctionCall } from "eth-fun";

import logger from "../../logger.mjs";
import { parseJSON } from "../../utils.mjs";

export const name = "call-block-logs";
const log = logger(name);
export const version = "0.1.0";

// Instead of querying at the block number soundxyz NFT
// was minted, we query at a higher block number because
// soundxyz changed their tokenURI and the previous one
// doesn't work anymore. https://github.com/neume-network/data/issues/19
const BLOCK_NUMBER = "0xe5a51a";

export function onClose() {
  log("closed");
  return;
}

export function onError(error) {
  log(error.toString());
  throw error;
}

function validate(contracts) {
  const keys = Object.keys(contracts);
  if (keys.length === 0) {
    throw new Error(
      `${name}-transformer needs contract object to have at least one key.`
    );
  }
  keys.forEach((contract) => {
    if (contract !== contract.toLowerCase()) {
      throw new Error("Contract address must be lower key");
    }
  });
}

const transferEventSelector =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const emptyB32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const signature = {
  name: "tokenURI",
  type: "function",
  inputs: [
    {
      name: "tokenId",
      type: "uint256",
    },
  ],
};

export function onLine(line, contracts = []) {
  validate(contracts);
  let logs;
  try {
    logs = parseJSON(line, 100);
  } catch (err) {
    log(err.toString());
    return;
  }

  logs = logs
    .filter((log) => {
      return (
        log.topics[0] === transferEventSelector &&
        log.topics[1] === emptyB32 &&
        Object.keys(contracts).includes(log.address)
      );
    })
    .map((log) => {
      const tokenId = BigInt(log.topics[3]).toString(10);
      return {
        platform: {
          ...contracts[log.address],
        },
        erc721: {
          tokenURI: {
            type: "json-rpc",
            version: "0.0.1",
            method: "eth_call",
            params: [
              {
                from: null,
                to: log.address,
                data: encodeFunctionCall(signature, [tokenId]),
              },
              Math.max(log.blockNumber, BLOCK_NUMBER),
            ],
          },
          createdAt: parseInt(log.blockNumber, 16),
          address: log.address,
          tokens: [
            {
              minting: {
                transactionHash: log.transactionHash,
              },
              id: tokenId,
            },
          ],
        },
      };
    });

  if (logs.length) {
    return JSON.stringify(logs);
  } else {
    return "";
  }
}
