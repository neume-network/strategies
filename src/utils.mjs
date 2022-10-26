// @format

export function deepMapKeys(obj, cb) {
  Object.keys(obj).map((key) => {
    const value = obj[key];
    if (Array.isArray(value)) {
      for (let elem of value) {
        deepMapKeys(elem, cb);
      }
    } else if (value !== null && typeof value === "object") {
      deepMapKeys(value, cb);
    } else {
      cb(key, value);
    }
  });
}

export function parseJSON(value, distance = 10) {
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch (err) {
    const index = parseInt(err.toString().split("position ")[1], 10);
    let start = index - distance;
    let end = index + distance;

    if (start < 0) {
      start = 0;
    }
    if (end > value.length) {
      end = value.length;
    }
    const snippet = value.substring(start, end);
    throw new SyntaxError(
      `JSON parsing error: "${snippet}", Original Error: "${err.toString()}"`
    );
  }
  return parsed;
}

export function breakdownIpfs(ipfsUri) {
  // Modified from is-ipfs package at https://github.com/ipfs-shipyard/is-ipfs/blob/393859af921ef52d786c0f14bf772eeda7f8930b/src/index.js#L12
  const nativeIpfsPattern = /ipfs:\/\/([^/?#]+)(.*)/;
  const pathGatewayPattern = /^https?:\/\/[^/]+\/ipfs\/([^/?#]+)(.*)/;
  const subdomainGatewayPattern = /^https?:\/\/([^/]+)\.ipfs\.[^/?#]+(.*)/;

  if (typeof ipfsUri !== "string")
    throw new Error("Given IPFS URI should be of type string");

  const nativeIpfsMatch = ipfsUri.match(nativeIpfsPattern);
  if (nativeIpfsMatch) {
    const [_, hash, path] = nativeIpfsMatch;
    return {
      cid: hash,
      path: path,
    };
  }

  const pathGatewayMatch = ipfsUri.match(pathGatewayPattern);
  if (pathGatewayMatch) {
    const [_, hash, path] = pathGatewayMatch;
    return {
      cid: hash,
      path: path,
    };
  }

  const subdomainGatewayMatch = ipfsUri.match(subdomainGatewayPattern);
  if (subdomainGatewayMatch) {
    const [_, hash, path] = subdomainGatewayMatch;
    return {
      cid: hash,
      path: path,
    };
  }

  throw new Error(`Couldn't convert ${ipfsUri} to native IPFS URI`);
}

export function anyIpfsToNativeIpfs(ipfsUri) {
  const IPFSIANAScheme = "ipfs://";
  const ipfs = breakdownIpfs(ipfsUri);
  return `${IPFSIANAScheme}${ipfs.cid}${ipfs.path}`;
}

export function ifIpfsConvertToNativeIpfs(uri) {
  try {
    return anyIpfsToNativeIpfs(uri);
  } catch {
    return uri;
  }
}
