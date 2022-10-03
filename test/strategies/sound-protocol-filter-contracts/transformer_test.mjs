//@format
import test from "ava";

import { onLine } from "../../../src/strategies/sound-protocol-filter-contracts/transformer.mjs";

const snapshot0 = [
  {
    address: "0x65c25fadd9b88df5c8c101a3b99a5d614b708596",
    topics: [
      "0x9a9e0edce33a498fe7d57bfc9e7b46f9a2cd45507d8853c0c18c4c7bd860798c",
      "0x000000000000000000000000dc01dc4ccfca6238ec697c2cd29a1408c675d79e",
      "0x0000000000000000000000000000000000000000000000000000000000000018",
    ],
    data: "0x00000000000000000000000000000000000000000000000000b1a2bc2ec5000000000000000000000000000000000000000000000000000000000000633dd4b9000000000000000000000000000000000000000000000000000000006341c8b000000000000000000000000000000000000000000000000000000000ffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000005",
    blockNumber: "0xef0b4b",
    transactionHash:
      "0x937a2196612bab1ff858de93251ef22319222c6dd4dd88bb0221b25b1476f769",
    transactionIndex: "0x72",
    blockHash:
      "0x37162ef89fe2eb26301a42b8704783eaa2c3b2430dcfad77c7ef859c40945d29",
    logIndex: "0xba",
    removed: false,
  },
  {
    address: "0xeae422887230c0ffb91fd8f708f5fdd354c92f2f",
    topics: [
      "0xeeb5941fb79bbfe40edd76c2e086e8ccdb0b463fc8ac07416266100b4dfddccf",
      "0x000000000000000000000000dc01dc4ccfca6238ec697c2cd29a1408c675d79e",
      "0x000000000000000000000000aef3e8c8723d9c31863be8de54df2668ef7c4b89",
    ],
    data: "0x000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000633dc6a900000000000000000000000000000000000000000000000000000000633dd4b90000000000000000000000000000000000000000000000000000000000000000",
    blockNumber: "0xef0b4b",
    transactionHash:
      "0x937a2196612bab1ff858de93251ef22319222c6dd4dd88bb0221b25b1476f769",
    transactionIndex: "0x72",
    blockHash:
      "0x37162ef89fe2eb26301a42b8704783eaa2c3b2430dcfad77c7ef859c40945d29",
    logIndex: "0xbb",
    removed: false,
  },
  {
    address: "0xeae422887230c0ffb91fd8f708f5fdd354c92f2f",
    topics: [
      "0xd9faafd9b789bcd20399f1fafa1c6459996ac840e9177ee687c23cdbe3b7a9cb",
      "0x000000000000000000000000dc01dc4ccfca6238ec697c2cd29a1408c675d79e",
      "0x0000000000000000000000000000000000000000000000000000000000000016",
    ],
    data: "0xead27d962f762ec823cbb8aa24a85da7df62b5e024db5c23e30d42cc183f51d300000000000000000000000000000000000000000000000000b1a2bc2ec5000000000000000000000000000000000000000000000000000000000000633dc6a900000000000000000000000000000000000000000000000000000000633dd4b9000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000320000000000000000000000000000000000000000000000000000000000000001",
    blockNumber: "0xef0b4b",
    transactionHash:
      "0x937a2196612bab1ff858de93251ef22319222c6dd4dd88bb0221b25b1476f769",
    transactionIndex: "0x72",
    blockHash:
      "0x37162ef89fe2eb26301a42b8704783eaa2c3b2430dcfad77c7ef859c40945d29",
    logIndex: "0xbc",
    removed: false,
  },
  {
    address: "0xdc01dc4ccfca6238ec697c2cd29a1408c675d79e",
    topics: [
      "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
      "0x000000000000000000000000aef3e8c8723d9c31863be8de54df2668ef7c4b89",
      "0x000000000000000000000000bcefc4906b443e4db64e2b00b9af2c39e76c785c",
    ],
    data: "0x",
    blockNumber: "0xef0b4b",
    transactionHash:
      "0x937a2196612bab1ff858de93251ef22319222c6dd4dd88bb0221b25b1476f769",
    transactionIndex: "0x72",
    blockHash:
      "0x37162ef89fe2eb26301a42b8704783eaa2c3b2430dcfad77c7ef859c40945d29",
    logIndex: "0xbd",
    removed: false,
  },
  {
    address: "0xaef3e8c8723d9c31863be8de54df2668ef7c4b89",
    topics: [
      "0x405098db99342b699216d8150e930dbbf2f686f5a43485aed1e69219dafd4935",
      "0x000000000000000000000000dc01dc4ccfca6238ec697c2cd29a1408c675d79e",
      "0x000000000000000000000000bcefc4906b443e4db64e2b00b9af2c39e76c785c",
    ],
    data: "0x000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000003800000000000000000000000000000000000000000000000000000000000000420000000000000000000000000000000000000000000000000000000000000086000000000000000000000000000000000000000000000000000000000000002c4dd012a11000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000003ca50e8da8c3d359fc934aea0161f5346ccb62a100000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000002400000000000000000000000004cfb3ea7df3cfd66d35602a9a2a315db8324f30400000000000000000000000000000000000000000000000000000000000003e8000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000006341c8b00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000001942616c6c21202877697468204b6576696e2047656f7267652900000000000000000000000000000000000000000000000000000000000000000000000000000442414c4c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003061723a2f2f414e72556b364837646154694b67583641534d746d38725678655f614a724b46356f5170534e2d7844743400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005368747470733a2f2f6d657461646174612e736f756e642e78797a2f76312f3078446330316443344343466361363233386563363937633243443239613134303863363735443739452f73746f726566726f6e7400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000dc01dc4ccfca6238ec697c2cd29a1408c675d79e000000000000000000000000dc01dc4ccfca6238ec697c2cd29a1408c675d79e00000000000000000000000065c25fadd9b88df5c8c101a3b99a5d614b708596000000000000000000000000eae422887230c0ffb91fd8f708f5fdd354c92f2f000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000002e000000000000000000000000000000000000000000000000000000000000000441c10893f00000000000000000000000065c25fadd9b88df5c8c101a3b99a5d614b70859600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000441c10893f000000000000000000000000eae422887230c0ffb91fd8f708f5fdd354c92f2f00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001247cbf126b000000000000000000000000dc01dc4ccfca6238ec697c2cd29a1408c675d79e00000000000000000000000000000000000000000000000000b1a2bc2ec5000000000000000000000000000000000000000000000000000000000000633dd4b9000000000000000000000000000000000000000000000000000000006341c8b000000000000000000000000000000000000000000000000000000000ffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000104c309c47d000000000000000000000000dc01dc4ccfca6238ec697c2cd29a1408c675d79eead27d962f762ec823cbb8aa24a85da7df62b5e024db5c23e30d42cc183f51d300000000000000000000000000000000000000000000000000b1a2bc2ec5000000000000000000000000000000000000000000000000000000000000633dc6a900000000000000000000000000000000000000000000000000000000633dd4b9000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000320000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000016",
    blockNumber: "0xef0b4b",
    transactionHash:
      "0x937a2196612bab1ff858de93251ef22319222c6dd4dd88bb0221b25b1476f769",
    transactionIndex: "0x72",
    blockHash:
      "0x37162ef89fe2eb26301a42b8704783eaa2c3b2430dcfad77c7ef859c40945d29",
    logIndex: "0xbe",
    removed: false,
  },
  {
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    topics: [
      "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65",
      "0x0000000000000000000000007cb7f6970d929e021ecf802b7888c2fb808a65c0",
    ],
    data: "0x000000000000000000000000000000000000000000000000069789fbbc4f8000",
    blockNumber: "0xef0b4b",
    transactionHash:
      "0xa63630c7638b09e5f54ab4f03af9bf68cc33757c55cf5e191fdc3c2b71d33989",
    transactionIndex: "0x73",
    blockHash:
      "0x37162ef89fe2eb26301a42b8704783eaa2c3b2430dcfad77c7ef859c40945d29",
    logIndex: "0xbf",
    removed: false,
  },
  {
    address: "0x5564886ca2c518d1964e5fcea4f423b41db9f561",
    topics: [
      "0xa6697e974e6a320f454390be03f74955e8978f1a6971ea6730542e37b66179bc",
      "0x7061726c616d656e740000000000000000000000000000000000000000000000",
    ],
    data: "0x",
    blockNumber: "0xef0b4b",
    transactionHash:
      "0xfb7524df7425b985c7d8deb523986161cf6b874e6c99c504e9b4b79d9a52e99e",
    transactionIndex: "0x74",
    blockHash:
      "0x37162ef89fe2eb26301a42b8704783eaa2c3b2430dcfad77c7ef859c40945d29",
    logIndex: "0xc0",
    removed: false,
  },
  {
    address: "0x5564886ca2c518d1964e5fcea4f423b41db9f561",
    topics: [
      "0xa6697e974e6a320f454390be03f74955e8978f1a6971ea6730542e37b66179bc",
      "0x476f64206861746573204e465473000000000000000000000000000000000000",
    ],
    data: "0x",
    blockNumber: "0xef0b4b",
    transactionHash:
      "0x0c75a89e91e4fac795f8da1c12bd5f47dfe3b72ba034f4ce59cbaf6ff7b7692c",
    transactionIndex: "0x75",
    blockHash:
      "0x37162ef89fe2eb26301a42b8704783eaa2c3b2430dcfad77c7ef859c40945d29",
    logIndex: "0xc1",
    removed: false,
  },
  {
    address: "0x5564886ca2c518d1964e5fcea4f423b41db9f561",
    topics: [
      "0xa6697e974e6a320f454390be03f74955e8978f1a6971ea6730542e37b66179bc",
      "0x3639343034000000000000000000000000000000000000000000000000000000",
    ],
    data: "0x",
    blockNumber: "0xef0b4b",
    transactionHash:
      "0x1dddc45dbcdd45db2116086dd4c027b88720847f8a62bd65276905361d08a405",
    transactionIndex: "0x76",
    blockHash:
      "0x37162ef89fe2eb26301a42b8704783eaa2c3b2430dcfad77c7ef859c40945d29",
    logIndex: "0xc2",
    removed: false,
  },
  {
    address: "0x5564886ca2c518d1964e5fcea4f423b41db9f561",
    topics: [
      "0xa6697e974e6a320f454390be03f74955e8978f1a6971ea6730542e37b66179bc",
      "0x44452d4649000000000000000000000000000000000000000000000000000000",
    ],
    data: "0x",
    blockNumber: "0xef0b4b",
    transactionHash:
      "0x260da1314ad755c2ce03bc83b8cb0cf2b34cadf9978d88e58cbf7dc40800aadb",
    transactionIndex: "0x77",
    blockHash:
      "0x37162ef89fe2eb26301a42b8704783eaa2c3b2430dcfad77c7ef859c40945d29",
    logIndex: "0xc3",
    removed: false,
  },
  {
    address: "0xf09d6a40872c426b2cf5bec88944e5fa3ac40837",
    topics: [
      "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
      "0x000000000000000000000000f09d6a40872c426b2cf5bec88944e5fa3ac40837",
      "0x0000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d",
    ],
    data: "0x0000000000000000000000000000000000000000000000000000013846316202",
    blockNumber: "0xef0b4b",
    transactionHash:
      "0x35492e805562da52c4b00f4d2a3c3c6ee20ff4f5e0f618680f409c704b0bd7dd",
    transactionIndex: "0x78",
    blockHash:
      "0x37162ef89fe2eb26301a42b8704783eaa2c3b2430dcfad77c7ef859c40945d29",
    logIndex: "0xc4",
    removed: false,
  },
  {
    address: "0xf09d6a40872c426b2cf5bec88944e5fa3ac40837",
    topics: [
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      "0x000000000000000000000000f09d6a40872c426b2cf5bec88944e5fa3ac40837",
      "0x000000000000000000000000492c19f59603d221a0bcdaf7764ed49700799fd0",
    ],
    data: "0x00000000000000000000000000000000000000000000000000000128a915504f",
    blockNumber: "0xef0b4b",
    transactionHash:
      "0x35492e805562da52c4b00f4d2a3c3c6ee20ff4f5e0f618680f409c704b0bd7dd",
    transactionIndex: "0x78",
    blockHash:
      "0x37162ef89fe2eb26301a42b8704783eaa2c3b2430dcfad77c7ef859c40945d29",
    logIndex: "0xc5",
    removed: false,
  },
];

const snapshot1 = [
  {
    address: "0x5564886ca2c518d1964e5fcea4f423b41db9f561",
    topics: [
      "0xa6697e974e6a320f454390be03f74955e8978f1a6971ea6730542e37b66179bc",
      "0x44452d4649000000000000000000000000000000000000000000000000000000",
    ],
    data: "0x",
    blockNumber: "0xef0b4b",
    transactionHash:
      "0x260da1314ad755c2ce03bc83b8cb0cf2b34cadf9978d88e58cbf7dc40800aadb",
    transactionIndex: "0x77",
    blockHash:
      "0x37162ef89fe2eb26301a42b8704783eaa2c3b2430dcfad77c7ef859c40945d29",
    logIndex: "0xc3",
    removed: false,
  },
];

test("sound-protocol-filter-contracts transformer", (t) => {
  const editionCreatedSelector =
    "0x405098db99342b699216d8150e930dbbf2f686f5a43485aed1e69219dafd4935";
  const res0 = onLine(JSON.stringify(snapshot0), editionCreatedSelector);
  const res1 = onLine(JSON.stringify(snapshot1), editionCreatedSelector);

  t.deepEqual(JSON.parse(res0), {
    "0xdc01dc4ccfca6238ec697c2cd29a1408c675d79e": {
      name: "sound-protocol",
    },
  });
  t.is(res1, "");
});
