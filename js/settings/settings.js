import makeEventHandler from "../events.js";

/**
 * Make the viewer settings object.
 *
 * The viewer settings object emits events:
 * "[property]-update" when the corresponding property is updated.
 *
 * @returns { Settings } the viewer settings object.
 */
const Settings = {
  make() {
    const events = makeEventHandler();

    let pickingOrder = "area";

    const settings = new Proxy(
      {
        rotateKey: "shift",
        scaleSpeed: 0.002,
        rotateSpeed: 0.1,
        maxScale: 100,
        minScale: 0.1,
        fitViewRatio: 1,
        get pickingOrder() {
          return pickingOrder;
        },
        set pickingOrder(value) {
          if (["area", "zIndex"].includes(value)) {
            if (pickingOrder !== value) {
              pickingOrder = value;
            }
          } else {
            throw new Error(
              'Settings error. "pickingOrder" only accept "area" or "zIndex" values.'
            );
          }
        },
      },
      {
        set(target, property, value) {
          if (target[property] !== value) {
            const oldValue = target[property];
            if (Reflect.set(target, property, value)) {
              events.emit(`${property}-update`, { value, oldValue });
            } else {
              console.error(`Settings error. Unable to set "${property}".`);
            }
          }
          return true;
        },
      }
    );

    Object.defineProperties(settings, Object.getOwnPropertyDescriptors(events));

    return Object.seal(settings);
  },
};

export default Settings;
