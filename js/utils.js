function* idGenerator() {
  let i = 1;
  while (i < Number.MAX_SAFE_INTEGER) {
    yield i++;
  }
  throw new Error("Cannot generate more ids");
}

function makeIdGenerator() {
  const gen = idGenerator();
  return () => gen.next().value;
}

function getQuadFromBBox(bbox = []) {
  if (!bbox || bbox.length !== 4) {
    throw new Error("bbox have to be an array with x1, y1, x2, y2 values");
  }
  const [x1, y1, x2, y2] = bbox;
  return {
    p1: { x: x1, y: y1 },
    p2: { x: x2, y: y1 },
    p3: { x: x2, y: y2 },
    p4: { x: x1, y: y2 },
  };
}

function compareBy(property, ascending = true) {
  if (ascending) {
    return (a, b) => (a[property] ?? -Infinity) - (b[property] ?? -Infinity);
  } else {
    return (a, b) => (b[property] ?? -Infinity) - (a[property] ?? -Infinity);
  }
}

export { makeIdGenerator, getQuadFromBBox, compareBy };
