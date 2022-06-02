//@format
import test from "ava";
import { onLine } from "../../../src/strategies/soundxyz-get-tokenuri/transformer.mjs";

const payload = `{"name":"Fever Dream #14","artist_name":"Dot","description":"simple description","external_url":"https://www.sound.xyz/dot/fever-dream","image":"https://soundxyz.mypinata.cloud/ipfs/QmSJ3waSjiqLLgrW3n6dXUJhmRaouUYsBdf1kGs1duC9St","audio_url":"https://soundxyz.mypinata.cloud/ipfs/QmfXoeHScHC68PVCdtTj8NhxGeSSmhVRNqQSt6kVv4TxiG","animation_url":"https://soundxyz.mypinata.cloud/ipfs/QmfXoeHScHC68PVCdtTj8NhxGeSSmhVRNqQSt6kVv4TxiG","comment_wall_url":"https://soundxyz.mypinata.cloud/ipfs/QmZ6VjoAWciv3soxfc3u2aqivVYLiY3bh4DmZMjYXxXF8F","attributes":[{"trait_type":"Fever Dream","value":"Song Edition"},{"value":"Genesis"}]}`;

test("soundxyz-get-tokenuri transformer", (t) => {
  const { write } = onLine(payload);
  t.is(
    write,
    `{"version":"0.1.0","title":"Fever Dream #14","artist":{"version":"0.1.0","name":"Dot"},"platform":{"version":"0.1.0","name":"Sound","uri":"https://sound.xyz"},"erc721":{"version":"0.1.0","metadata":{"name":"Fever Dream #14","artist_name":"Dot","description":"simple description","external_url":"https://www.sound.xyz/dot/fever-dream","image":"https://soundxyz.mypinata.cloud/ipfs/QmSJ3waSjiqLLgrW3n6dXUJhmRaouUYsBdf1kGs1duC9St","audio_url":"https://soundxyz.mypinata.cloud/ipfs/QmfXoeHScHC68PVCdtTj8NhxGeSSmhVRNqQSt6kVv4TxiG","animation_url":"https://soundxyz.mypinata.cloud/ipfs/QmfXoeHScHC68PVCdtTj8NhxGeSSmhVRNqQSt6kVv4TxiG","comment_wall_url":"https://soundxyz.mypinata.cloud/ipfs/QmZ6VjoAWciv3soxfc3u2aqivVYLiY3bh4DmZMjYXxXF8F","attributes":[{"trait_type":"Fever Dream","value":"Song Edition"},{"value":"Genesis"}]}},"manifestations":[{"version":"0.1.0","uri":"https://soundxyz.mypinata.cloud/ipfs/QmfXoeHScHC68PVCdtTj8NhxGeSSmhVRNqQSt6kVv4TxiG"},{"version":"0.1.0","uri":"https://soundxyz.mypinata.cloud/ipfs/QmSJ3waSjiqLLgrW3n6dXUJhmRaouUYsBdf1kGs1duC9St"},{"version":"0.1.0","uri":"https://soundxyz.mypinata.cloud/ipfs/QmfXoeHScHC68PVCdtTj8NhxGeSSmhVRNqQSt6kVv4TxiG"}]}`
  );
});
