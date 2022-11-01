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
