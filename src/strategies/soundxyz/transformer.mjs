// @format
import { decodeCallOutput } from "eth-fun";
const version = "0.1.0";

export function transform(line) {
  let tokenURI;
  try {
    [tokenURI] = decodeCallOutput(["string"], line);
  } catch (err) {
    console.log(err);
    return {
      messages: [],
      state: {},
      write: null,
    };
  }
  console.log(tokenURI);
  return {
    messages: [],
    state: {},
    write: tokenURI,
  };
}
