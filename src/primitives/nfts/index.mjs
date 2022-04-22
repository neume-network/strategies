// @format
import jsonata from "jsonata";

function generate(first, lastId) {
  return {
    type: "graphql",
    version: "0.0.1",
    options: {
      url: "https://api.thegraph.com/subgraphs/name/timdaub/web3musicsubgraph",
      body: JSON.stringify({
        query: `
      query manyNFTs($lastId: String) {
        nfts(first: ${first}, where: { id_gt: $lastId }) {
          id
        }
      }`,
        variables: { lastId },
      }),
    },
    results: null,
    error: null,
  };
}

export const props = {
  first: 1000,
  lastId: "",
};

export function init(message, props, state) {
  return {
    message: generate(props.first, props.lastId),
    props,
    state,
  };
}

export function update(message, props, state) {
  const expr = `message.results.data.nfts[id ~> /(?<address>0x[a-fA-F0-9]{40})/(?<tokenId>[0-9]+)/ ].id`;
  const results = jsonata(expr).evaluate(data);
  const { address, tokenId } = results[results.length - 1];
  const lastId = `${address}/${tokenId}`;
  return {
    message: generate(props.first, lastId),
    props,
    state,
  };
}
