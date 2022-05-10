// @format

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

export function init(state) {
  return {
    messages: [generate(props.first, props.lastId)],
    state,
  };
}

export function update(message, state) {
  const { nfts } = message.results.data;
  const lastId = nfts[nfts.length - 1].id;
  return {
    messages: [generate(props.first, lastId)],
    state,
  };
}
