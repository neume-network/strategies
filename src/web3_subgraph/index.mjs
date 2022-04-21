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

function queryGen(skip, first) {
  return JSON.stringify({
    query: `{ nfts(first: ${first}, skip: ${skip}) { id } }`,
  });
}

function messageGen(skip, first) {
  const options = { ...optionsBoilerplate, ...{ body: queryGen(skip, first) } };
  return { ...msgBoilerplate, options, graphql: { skip, first } };
}

async function handle(message) {
  if (message && message.error) {
    log(message.error);
    return exit(1);
  }

  if (message.type === "graphql") {
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

    const { first } = message.graphql;
    const skip = message.graphql.skip + first;

    const nextMessage = messageGen(skip, first);
    worker.postMessage(nextMessage);
  } else if (message.type === "json-rpc") {
    if (message.method === "eth_call") {
      const [tokenURI] = decodeCallOutput(["string"], message.results);
      const row = toCSV([{ tokenURI, ...message.metadata }]);
      const header = "address,tokenId,tokenURI";
      console.log(row);
      //await write(path, header, row);
    }
  }
}

export function run(inputs, _log) {
  worker = inputs.worker;
  log = _log;
  log("Start web3-subgraph strategy");

  const skip = 0;
  const maxStep = 1000;
  const first = maxStep;
  const message0 = messageGen(skip, first);
  worker.postMessage(message0);
  worker.on("message", handle);
}
