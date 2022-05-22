// @format
const version = "0.0.1";
export const name = "web3subgraph";

function generate(first, lastId) {
  return {
    type: "graphql",
    commissioner: name,
    version,
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
  autoStart: true,
  first: 1000,
  lastId: "",
};

export function init(state) {
  return {
    messages: [generate(props.first, props.lastId)],
    state,
    write: null,
  };
}

export function update(message, state) {
  const { nfts } = message.results.data;

  let messages = [];
  let write = null;
  if (nfts.length) {
    const lastId = nfts[nfts.length - 1].id;
    messages = [generate(props.first, lastId)];
    write = JSON.stringify(nfts);
  } else {
    messages = [
      {
        type: "transformation",
        version: "0.0.1",
        name,
        args: null,
        results: null,
        error: null,
      },
    ];
  }
  return {
    messages,
    state,
    write,
  };
}
