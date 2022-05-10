// @format
import { toJSON } from "../../disc.mjs";

const version = "0.0.1";

function generate(first, lastId) {
  return {
    type: "graphql",
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
  };
}

export function update(message, state) {
  const { nfts } = message.results.data;
  const lastId = nfts[nfts.length - 1].id;
  const expr = new RegExp(
    "^(?<address>0x[a-fA-F0-9]{40})\\/(?<tokenId>[0-9]*)$"
  );
  const ids = toJSON(
    nfts.map((entry) => entry.id),
    expr
  );
  const messages = ids.map(({ address, tokenId }) => ({
    type: "extraction",
    version,
    params: {
      address,
      tokenId,
    },
  }));
  return {
    messages: [...messages, generate(props.first, lastId)],
    state,
  };
}
