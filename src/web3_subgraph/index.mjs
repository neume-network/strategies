// @format
import { exit } from "process";
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

export function transform(response) {
  return response.data.nfts
    .map(({ id }) => {
      const [address, tokenId] = id.split("/");
      return `${address},${tokenId}`;
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
  if (message.results.errors) {
    log(message.results.errors);
    return exit(1);
  }
  if (message.error) {
    log(message.error);
    return exit(1);
  }

  const header = "address,tokenId";
  const rows = transform(message.results);
  await write(path, header, rows);

  const { first } = message.graphql;
  const skip = message.graphql.skip + first;

  const nextMessage = messageGen(skip, first);
  worker.postMessage(nextMessage);
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
