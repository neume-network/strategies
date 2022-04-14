//@format
import { run as blockIterator } from "./block_iterator/index.mjs";
import { run as web3Subgraph } from "./web3_subgraph/index.mjs";

export function run(inputs, log) {
  web3Subgraph(inputs, log);
  //blockIterator(inputs, log);
}
