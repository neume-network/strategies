import { decodeLog } from "eth-fun";

export function toEIP721(log) {
  const topics = log.topics;
  topics.shift();
  const { to, from, tokenId } = decodeLog(
    [
      {
        type: "address",
        name: "to",
        indexed: true,
      },
      {
        type: "address",
        name: "from",
        indexed: true,
      },
      {
        type: "uint256",
        name: "tokenId",
        indexed: true,
      },
    ],
    log.data,
    topics
  );
  return {
    to: log.address,
    transactionHash: log.transactionHash,
    transfer: {
      to,
      from,
      tokenId,
    },
    block: {
      number: `${parseInt(log.blockNumber, 16)}`,
    },
  };
}
