import makeHTMLElementUIHandler from "../handlers/htmlElement.js";
import makeEventHandler from "../../events.js";

/**
 * Make a default camera controller.
 * Emits events:
 * - "pick", payload : { object, position, keys, rightClick: boolean }
 * - "pick-nothing", payload: { position, keys, rightClick: boolean }
 * - "hover-surface", payload: { object, position }
 * - "hover", payload: { object, position }
 * - "hover-out", payload: { object, position }
 * - "hover-off", payload: { position }
 *
 * @param { Viewer } viewer
 *
 * @returns {{destroy: function} & EventHandler }
 */
function makeDefaultCameraController(viewer) {
  const events = makeEventHandler();

  const htmlElementUIHandler = makeHTMLElementUIHandler(viewer.canvas);

  htmlElementUIHandler.on("drag", ({ dx, dy }) =>
    viewer.camera.translate(dx, dy)
  );

  htmlElementUIHandler.on("scroll", ({ dy, position, keys }) => {
    if (keys[viewer.settings.rotateKey]) {
      const angle = dy * viewer.settings.rotateSpeed;
      viewer.camera.rotate(angle, position);
    } else {
      const factor = Math.max(1 - dy * viewer.settings.scaleSpeed, 0);
      viewer.camera.scale(factor, position);
    }
  });

  htmlElementUIHandler.on("click", ({ position, keys }) => {
    viewer.ticker.addOnce("pick-click", () => {
      const object = viewer.picker.pick(position.x, position.y);
      if (object) {
        events.emit("pick", { object, position, keys });
      } else {
        events.emit("pick-nothing", { position, keys });
      }
    });
  });
  htmlElementUIHandler.on("right-click", ({ position, keys }) => {
    viewer.ticker.addOnce("pick-right-click", () => {
      const object = viewer.picker.pick(position.x, position.y);
      if (object) {
        events.emit("pick", { object, position, rightClick: true, keys });
      } else {
        events.emit("pick-nothing", { position, rightClick: true, keys });
      }
    });
  });

  let lastHoveredObject = null;

  htmlElementUIHandler.on("exit", () => {
    lastHoveredObject = null;
  });

  htmlElementUIHandler.on("move", ({ position }) => {
    viewer.ticker.addOnce("pick-move", () => {
      const object = viewer.picker.pick(position.x, position.y);
      if (object) {
        if (lastHoveredObject) {
          if (object.id === lastHoveredObject.id) {
            events.emit("hover-surface", { object, position });
          } else {
            events.emit("hover", { object, position });
            events.emit("hover-out", { object: lastHoveredObject, position });
            lastHoveredObject = object;
          }
        } else {
          events.emit("hover", { object, position });
          lastHoveredObject = object;
        }
      } else {
        if (lastHoveredObject) {
          events.emit("hover-out", { object: lastHoveredObject, position });
          lastHoveredObject = null;
        }
        events.emit("hover-off", { position });
      }
    });
  });

  return {
    ...events,
    destroy() {
      htmlElementUIHandler.clear();
      events.clear();
    },
  };
}

export default makeDefaultCameraController;
