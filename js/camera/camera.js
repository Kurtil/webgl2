import { getQuadFromBBox } from "../utils.js";
import makeEventHandler from "../events.js";
import Transform2D from "./transform2D.js";
import makeDefaultCameraController from "./controllers/default.js";
import { Transform } from "../../node_modules/@pixi/math/dist/esm/math.js";

/**
 * Make a camera.
 *
 * A camera emits events:
 * - "update", payload { MatrixExtended } : the camera transform. Emited when the camera is updated.
 *
 * @param { Viewer } viewer
 *
 * @returns { Camera } the created camera
 */
const Camera = {
  make(viewer) {
    const transform2D = Transform2D(viewer);

    const camera = {
      controller: makeDefaultCameraController(viewer),
      get transform() {
        return transform2D.transform;
      },
      /**
       * @param { number[] | Bounds } bbox
       */
      fitView(bbox = []) {
        if (!Array.isArray(bbox)) {
          bbox = [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY];
        }
        transform2D.fitView(getQuadFromBBox(bbox));
      },
      translate(dx = 0, dy = 0) {
        transform2D.translate(dx, dy);
      },
      scale(factor = 1, position = { x: 0, y: 0 }) {
        transform2D.scale(factor, position);
      },
      rotate(angle = 0, position = { x: 0, y: 0 }) {
        transform2D.rotate(angle, position);
      },
      getPosition() {
        return transform2D.transform.decompose(Transform.IDENTITY).position;
      },
      getScale() {
        return transform2D.transform.decompose(Transform.IDENTITY).scale;
      },
      getRotation() {
        return transform2D.transform.decompose(Transform.IDENTITY).rotation;
      },
      destroy() {
        if (this.controller) {
          this.controller.destroy();
        }
        transform2D.clear();
      },
      ...makeEventHandler(),
    };

    transform2D.on("update", transform => camera.emit("update", transform));

    return Object.freeze(camera);
  },
};

export default Camera;
