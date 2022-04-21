// @format
import { exit, env } from "process";

import { call, encodeCallSignature, decodeCallOutput, toHex } from "eth-fun";

import { toJSON, toCSV, write } from "../disc.mjs";

let worker, log;
const optionsBoilerplate = {
  url: "https://api.thegraph.com/subgraphs/name/timdaub/web3musicsubgraph",
};
const zora = {
  address: "0xabefbc9fd2f806065b4f3c237d4b59d9a97bcac7",
};
const msgBoilerplate = {
  type: "graphql",
  version: "0.0.1",
  results: null,
  error: null,
};
const first = 1000;

export function tokenURIMsgGen(address, tokenId) {
  const options = {
    url: env.RPC_HTTP_HOST,
  };
  if (env.RPC_API_KEY) {
    options.headers = {
      Authorization: `Bearer ${env.RPC_API_KEY}`,
    };
  }

  let signature = "tokenURI(uint256)";
  // NOTE: Zora isn't compatible to the ERC721 standard and so to get their
  // tokens's metadata, we need to call `tokenMetadataURI`.
  if (address === zora.address) {
    signature = "tokenMetadataURI(uint256)";
  }

  const data = encodeCallSignature(signature, ["uint256"], [tokenId]);
  const from = null;
  return {
    type: "json-rpc",
    options,
    version: "0.0.1",
    method: "eth_call",
    params: [
      {
        from,
        to: address,
        data,
      },
      "latest",
    ],
    results: null,
    errors: null,
  };
}

function queryGen(first, lastId) {
  return JSON.stringify({
    query: `
      query manyNFTs($lastId: String) {
        nfts(first: ${first}, where: { id_gt: $lastId }) {
          id
        }
      }`,
    variables: { lastId },
  });
}

function messageGen(first, lastId) {
  const options = {
    ...optionsBoilerplate,
    ...{ body: queryGen(first, lastId) },
  };
  return { ...msgBoilerplate, options };
}

async function handle(message) {
  if (message.type === "graphql") {
    // NOTE: We only want to stop the strategy when a `graphql` message fails
    // as it means we've reached the last page of NFTs
    if (message && message.error) {
      log(message.error);
      // NOTE: Once we get an error message from graphql that we reached the
      // last page, we return that branch.
      return;
    }

    const expr = new RegExp(
      "^(?<address>0x[a-fA-F0-9]{40})\\/(?<tokenId>[0-9]*)$"
    );
    const ids = toJSON(
      message.results.data.nfts.map((entry) => entry.id),
      expr
    );
    ids.forEach(({ address, tokenId }) =>
      worker.postMessage({
        ...{ metadata: { address, tokenId } },
        ...tokenURIMsgGen(address, tokenId),
      })
    );

    const lastId = message.results.data.nfts.pop().id;
    const nextMessage = messageGen(first, lastId);
    worker.postMessage(nextMessage);
  } else if (message.type === "json-rpc") {
    if (message.method === "eth_call") {
      let tokenURI;
      try {
        [tokenURI] = decodeCallOutput(["string"], message.results);
      } catch (err) {
        log(err.toString());
        return;
      }
      const header = "address,tokenId,tokenURI";
      worker.postMessage({
        type: "https",
        version: "0.0.1",
        options: {
          url: tokenURI,
          method: "GET",
        },
        results: null,
        error: null,
        metadata: {
          ...message.metadata,
          tokenURI,
        },
      });
    }
  } else if (message.type === "https") {
    const row = toCSV([
      { metadata: JSON.stringify(message.results), ...message.metadata },
    ]);
    console.log(row);
  }
}

export function run(inputs, _log) {
  worker = inputs.worker;
  log = _log;
  log("Start web3-subgraph strategy");

  const lastId = "";
  const message0 = messageGen(first, lastId);
  worker.postMessage(message0);
  worker.on("message", handle);
}
