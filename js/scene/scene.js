import makeEventHandler from "../events.js";
import makeSceneObjectFactory from "./object.js";

const Scene = {
  make() {
    const events = makeEventHandler();

    const SceneObject = makeSceneObjectFactory();

    const scene = {
      ...events,
      addObject(objectData = {}) {
        SceneObject.make(objectData);

        events.emit("update", SceneObject.getVertexData());
      },
    };

    return scene;
  },
};

export default Scene;
