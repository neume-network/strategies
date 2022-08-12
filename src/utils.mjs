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
    throw new SyntaxError(`JSON parsing error: "${snippet}"`);
  }
  return parsed;
}
