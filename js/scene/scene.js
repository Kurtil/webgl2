import makeEventHandler from "../events.js";

const Scene = {
  make() {
    const events = makeEventHandler();
    const objects = new Map();
    let objectId = 1;

    function getPositions() {
      return Array.from(objects.values()).flatMap(getObjectVertexData);
    }

    function getObjectVertexData(object) {
      const vertexData = [];
      object.points.forEach((point, i) => {
        vertexData.push(point);
        if (i % 2 !== 0) {
          // is odd
          vertexData.push(...object.color, 255); // opacity 1
        }
      });

      return vertexData;
    }

    return {
      ...events,
      addObject(object = {}) {
        if (!object?.points?.length > 0) {
          throw new Error("An object must have points");
        }

        object.color = new Uint8ClampedArray(object.color || [0, 0, 0]); // black by default

        object.id = objectId++;
        objects.set(object.id, object);

        events.emit("update", { positions: getPositions() });
      },
    };
  },
};

export default Scene;
