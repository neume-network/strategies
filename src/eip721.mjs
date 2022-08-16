import { decodeLog } from "eth-fun";

export function toEIP721(log) {
  const topics = log.topics;
  topics.shift();
  const { to, from, tokenId } = decodeLog(
    [
      {
        type: "address",
        name: "to",
      },
      {
        type: "address",
        name: "from",
      },
      {
        type: "uint256",
        name: "tokenId",
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
    blockNumber: `${parseInt(log.blockNumber, 16)}`,
  };
}
