import makeEventHandler from "../events.js";

const Scene = {
  make() {
    const events = makeEventHandler();
    const objects = new Map();
    let objectId = 1;

    function getPositions() {
      return Array.from(objects.values()).flatMap(object => object.points);
    }

    return {
      ...events,
      addObject(object = {}) {
        if (!object?.points?.length > 0) {
          throw new Error("An object must have points");
        }
        object.id = objectId++;
        objects.set(object.id, object);

        events.emit("update", { positions: getPositions() });
      },
    };
  },
};

export default Scene;
