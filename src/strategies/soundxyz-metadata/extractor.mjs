// @format
import { env } from "process";
import { encodeCallSignature, decodeCallOutput } from "eth-fun";

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
        version: "0.0.1",
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
  // because "editions" returns a struct with 9 fields
  if (message.results.length === 578) {
    const editionMetadata = decodeCallOutput(
      [
        "address",
        "uint256",
        "uint32",
        "uint32",
        "uint32",
        "uint32",
        "uint32",
        "uint32",
        "address",
      ],
      message.results
    );

    return {
      messages: [],
      write: JSON.stringify(editionMetadata),
    };
  } else if (message.results.length === 66) {
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
          version: "0.0.1",
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
