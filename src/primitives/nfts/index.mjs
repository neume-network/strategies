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
    message: generate(props.first, props.lastId),
    state,
  };
}

export function transform(results) {
  const expr = new RegExp("(?<address>0x[a-fA-F0-9]{40})\\/(?<tokenId>[0-9]+)");
  return results.data.nfts.map(({ id }) => id.match(expr).groups);
}

export function update(message, state) {
  const { address, tokenId } = message.results[message.results.length - 1];
  const lastId = `${address}/${tokenId}`;
  return {
    message: generate(props.first, lastId),
    state,
  };
}
