export const eth_blockNumberSchema = {
  type: "string",
  pattern: "^0x[a-fA-F0-9]+$",
};

export const eth_getLogsSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  definitions: {
    Log: {
      additionalProperties: {},
      description: "An indexed event generated during a transaction",
      properties: {
        address: {
          description: "Sender of the transaction",
          type: "string",
        },
        blockHash: {
          description:
            "The hex representation of the Keccak 256 of the RLP encoded block",
          type: "string",
        },
        blockNumber: {
          description: "The hex representation of the block's height",
          type: "string",
        },
        data: {
          description: "The data/input string sent along with the transaction",
          type: "string",
        },
        logIndex: {
          description:
            "The index of the event within its transaction, null when its pending",
          type: "string",
        },
        removed: {
          description: "Whether or not the log was orphaned off the main chain",
          type: "boolean",
        },
        topics: {
          description:
            "Topics are order-dependent. Each topic can also be an array of DATA with 'or' options.",
          items: {
            type: "string",
          },
          type: "array",
        },
        transactionHash: {
          description: "Keccak 256 Hash of the RLP encoding of a transaction",
          type: "string",
        },
        transactionIndex: {
          description: "The index of the transaction. null when its pending",
          type: "string",
        },
      },
      type: "object",
    },
  },
  items: {
    $ref: "#/definitions/Log",
  },
  type: "array",
};
