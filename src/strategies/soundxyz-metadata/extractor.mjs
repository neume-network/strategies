// @format
import { env } from "process";
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
    headers: {
      Authorization: `Bearer ${env.RPC_API_KEY}`,
    },
  },
};

export function init(tokenId) {
  const data = encodeCallSignature(
    props.signatures.tokenToEdition,
    ["uint256"],
    [tokenId]
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
          "latest",
        ],
        results: null,
        error: null,
      },
    ],
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
      write: message.results,
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
            "latest",
          ],
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
