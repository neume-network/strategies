// @format
import { decodeParameters } from "eth-fun";
import logger from "../../logger.mjs";

export const name = "sound-protocol-call-tokenuri";
export const version = "0.1.0";

const resultKey = "tokenURI";
const log = logger(name);

const extractTokenId = (tokenURI) => parseInt(tokenURI.split("/")[3]);

export function onClose() {
  return;
}

export function onError(error) {
  log(error.toString());
  throw error;
}

export function onLine(line) {
  let obj;

  try {
    obj = JSON.parse(line);
  } catch (err) {
    log(err.toString());
    return;
  }

  let { results: tokenURIs } = obj;
  let result = [];
  try {
    tokenURIs = tokenURIs.filter(
      (tokenURI) => tokenURI.split("/").length === 4
    );
    tokenURIs.sort((a, b) => extractTokenId(a) - extractTokenId(b));
    tokenURIs.forEach((tokenURI) => {
      const tokenId = extractTokenId(tokenURI);
      const url = tokenURI.split("/")[2];
      let added = false;
      result.forEach((item) => {
        if (item.url === url) {
          if (item.max[item.max.length - 1] === tokenId - 1)
            item.max[item.max.length - 1] = tokenId;
          else item.min.push(tokenId), item.max.push(tokenId);
          added = true;
        }
      });
      if (!added) {
        result.push({
          url,
          min: [tokenId],
          max: [tokenId],
        });
      }
    });

    result = result.map(
      (item) =>
        `ar://${item.url}/[${item.min
          .map((v, i) => `${v}-${item.max[i]}`)
          .join(", ")}]`
    );
  } catch (err) {
    log(err.toString());
    return;
  }
  return JSON.stringify({
    metadata: obj.metadata,
    tokenURI: result,
  });
}
