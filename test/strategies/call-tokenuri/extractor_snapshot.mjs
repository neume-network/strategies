import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  inputs: [
    resolve(__dirname, "./extractor_input_data"),
    {
      name: "tokenURI",
      type: "function",
      inputs: [
        {
          name: "tokenId",
          type: "uint256",
        },
      ],
    },
    ({ log }) => log.address === "0x0bc2a24ce568dad89691116d5b34deb6c203f342",
  ],
  expect: {
    write:
      '{"metadata":{"block":{"number":15159173},"contract":{"address":"0x0bc2a24ce568dad89691116d5b34deb6c203f342"},"tokenId":"206"},"results":"0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000042697066733a2f2f6261667962656962677265357863776f6c68367037327a6f6b797576736137346775347865766e6a3263343566643432336f686237757272763261000000000000000000000000000000000000000000000000000000000000"}\n',
  },
};
