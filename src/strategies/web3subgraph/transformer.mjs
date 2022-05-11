// @format
const version = "0.1.0";

import { toJSON } from "../../disc.mjs";

export function transform(line) {
  let data;
  try {
    data = JSON.parse(line);
  } catch (err) {
    return null;
  }
  const expr = new RegExp(
    "^(?<address>0x[a-fA-F0-9]{40})\\/(?<tokenId>[0-9]*)$"
  );
  return toJSON(
    data.map((entry) => entry.id),
    expr
  );
}
