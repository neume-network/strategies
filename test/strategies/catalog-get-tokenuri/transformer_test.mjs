// @format
import test from "ava";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { track } from "@neume-network/schema";

import { onLine } from "../../../src/strategies/catalog-get-tokenuri/transformer.mjs";

const ajv = new Ajv();
addFormats(ajv);

test("catalog-get-tokenuri transformer", async (t) => {
  const payload = {
    metadata: {
      block: { number: 14618792 },
      contract: { address: "0x0bc2a24ce568dad89691116d5b34deb6c203f342" },
      tokenId: "10",
      tokenURI:
        "ipfs://bafybeidxymjnbgf6ka6xdtx3wfx5jrschzmqfgqgqpi4a65ijxlgzdl4wq",
    },
    results: {
      animation_url:
        "ipfs://bafybeiaubc6l3g56st6dllzq7noyvb3aitha7xi24ggkxwmx644bxldnza",
      artist: "Claude VonStroke",
      attributes: { artist: "Claude VonStroke" },
      description:
        "Written and produced by Claude VonStroke\r\nc&p 2019\r\nwww.ClaudeVonStroke.com\r\n\r\nArtwork by Charlie Immer",
      duration: 410.384,
      external_url:
        "https://catalog.works/0x3c3c5b648fac2f9f59c444da03e804b98a4c046d/please-oh-please-oh-please-1650414082",
      image:
        "ipfs://bafybeiegtusak3q4vmhbsvpmdxs6ilr4tmpb4xdz2iwym63olje2f3c2rq",
      losslessAudio:
        "ipfs://bafybeievvqv2fjjilhltgsjpkgrpj5hpfto7rlev7qzb5sfh4rn2ndnfpe",
      mimeType: "audio/wav",
      name: "Claude VonStroke - Please Oh Please Oh Please",
      title: "Please Oh Please Oh Please",
      version: "catalog-20220222",
    },
  };

  const { write } = onLine(JSON.stringify(payload));

  const validate = ajv.compile(track);
  const data = JSON.parse(write);
  const valid = validate(data);
  t.true(valid);
});
