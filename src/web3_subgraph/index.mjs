// @format
import { exit, env } from "process";

import { call, encodeCallSignature, decodeCallOutput, toHex } from "eth-fun";

import { write } from "../disc.mjs";

let worker, log;
const path = "musicdata.csv";
const optionsBoilerplate = {
  url: "https://api.thegraph.com/subgraphs/name/timdaub/web3musicsubgraph",
  method: "POST",
};
const msgBoilerplate = {
  type: "https",
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
  const data = encodeCallSignature("tokenURI(uint256)", ["uint256"], [tokenId]);
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

export function toJSON(list) {
  return list.map(({ id }) => {
    const [address, tokenId] = id.split("/");
    return { address, tokenId };
  });
}

export function toCSV(list) {
  return list
    .map(({ address, tokenId, tokenURI }) => {
      return `${address},${tokenId},${tokenURI}`;
    })
    .join("\n");
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
  if (message && message.results && message.results.errors) {
    log(message.results.errors);
    return exit(1);
  }
  if (message && message.error) {
    log(message.error);
    return exit(1);
  }

  if (message.type === "https") {
    const ids = toJSON(message.results.data.nfts);
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
