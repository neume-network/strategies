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

export function anyIpfsToNativeIpfs(ipfsUri) {
  const IPFSIANAScheme = "ipfs://";
  const pathGatewayPattern = /^https?:\/\/[^/]+\/ipfs\/([^/?#]+)(.*)/;
  const subdomainGatewayPattern = /^https?:\/\/([^/]+)\.ipfs\.[^/?#]+(.*)/;

  if (typeof ipfsUri !== "string")
    throw new Error("Given IPFS URI should be of type string");

  if (ipfsUri.startsWith(IPFSIANAScheme)) return ipfsUri;

  const pathGatewayMatch = ipfsUri.match(pathGatewayPattern);
  if (pathGatewayMatch) {
    const [_, hash, path] = pathGatewayMatch;
    return `${IPFSIANAScheme}${hash}${path}`;
  }

  const subdomainGatewayMatch = ipfsUri.match(subdomainGatewayPattern);
  if (subdomainGatewayMatch) {
    const [_, hash, path] = subdomainGatewayMatch;
    return `${IPFSIANAScheme}${hash}${path}`;
  }

  throw new Error(`Couldn't convert ${ipfsUri} to native IPFS URI`);
}

export function ifIpfsConvertToNativeIpfs(uri) {
  try {
    anyIpfsToNativeIpfs(uri);
  } catch {
    return uri;
  }
}
