import makeEventHandler from "../events.js";

import { Matrix, Point } from "../../node_modules/@pixi/math/dist/esm/math.js";

// import { Bounds } from "../../node_modules/@pixi/display/dist/esm/display.js";

function makeTransform2D(viewer) {
  const viewport = {
    get width() {
      return viewer.canvas.width;
    },
    get height() {
      return viewer.canvas.height;
    },
  };

  const core = {
    viewport,
    transform: Matrix.IDENTITY,
    translate(dx = 0, dy = 0) {
      if (typeof dx !== "number" || typeof dy !== "number") {
        throw new Error("dx and dy should be numbers.");
      }
      this.transform = new Matrix().translate(dx, dy).append(this.transform);
    },
    rotate(angle = 0, origin = { x: 0, y: 0 }) {
      if (typeof angle !== "number") {
        throw new Error("Angle must be a number (degree)");
      }
      this.transform.append(
        new Matrix()
          .translate(-origin.x, -origin.y)
          .rotate((angle * Math.PI) / 180)
          .translate(origin.x, origin.y)
      );
    },
    scale(factor = 1, origin = { x: 0, y: 0 }) {
      if (factor < 0) {
        throw new Error("Scale factor should be > 0.");
      }
      let clampedFactor = factor;
      const scale = this.getScale();
      if (scale * clampedFactor >= viewer.settings.maxScale) {
        clampedFactor = viewer.settings.maxScale / scale;
      }
      if (scale * clampedFactor <= viewer.settings.minScale) {
        clampedFactor = viewer.settings.minScale / scale;
      }

      this.transform.append(
        new Matrix()
          .translate(-origin.x, -origin.y)
          .scale(clampedFactor, clampedFactor)
          .translate(origin.x, origin.y)
      );
    },
    getTranslate(translateM = this.transform) {
      return { dx: translateM.e, dy: translateM.f };
    },
    getRotate(rotateM = this.transform) {
      return Math.atan2(
        rotateM.b / this.getScale(),
        rotateM.a / this.getScale()
      );
    },
    getScale(scaleM = this.transform) {
      return Math.sqrt(Math.pow(scaleM.a, 2) + Math.pow(scaleM.b, 2));
    },
    resetTranslate() {
      this.setState({ translate: { dx: 0, dy: 0 } });
    },
    resetRotate() {
      this.setState({ rotate: 0 });
    },
    resetScale() {
      this.setState({ scale: 1 });
    },
    setState({
      rotate = this.getRotate(),
      translate = this.getTranslate(),
      scale = this.getScale(),
    } = {}) {
      if (typeof translate !== "object") {
        throw new Error(
          `'translate' argument should be an object, received '${typeof translate}'.`
        );
      }
      if (typeof rotate !== "number") {
        throw new Error(
          `'rotate' argument should be a number, received '${typeof rotate}'.`
        );
      }
      if (typeof scale !== "number") {
        throw new Error(
          `'scale' argument should be a number, received '${typeof scale}'.`
        );
      }
      const { dx = 0, dy = 0 } = translate;

      this.transform = new Matrix()
        .translate(dx, dy)
        .rotate(rotate)
        .scale(scale);
    },
    fitView(quad = {}, ratio = viewer.settings.fitViewRatio) {
      const mat = new Matrix();
      mat.rotate(this.getRotate());
      this.transform = mat;
      const { x, y, width, height } = this.getViewRectFromQuad(quad);
      const quadCenter = {
        x: x + width / 2,
        y: y + height / 2,
      };
      const viewportCenter = {
        x: this.viewport.width / 2,
        y: this.viewport.height / 2,
      };
      const scaleFactor = Math.min(
        this.viewport.width / width,
        this.viewport.height / height
      );
      const translateTarget = {
        x: viewportCenter.x - quadCenter.x,
        y: viewportCenter.y - quadCenter.y,
      };
      this.translate(translateTarget.x, translateTarget.y);
      this.scale(scaleFactor * ratio, this.getTransformedPoint(viewportCenter));
    },
    getTransformedPoint({ x, y }) {
      return this.transform.applyInverse(new Point(x, y));
    },
    getViewPoint({ x, y }) {
      return this.transform.apply(new Point(x, y));
    },
    getViewRectFromQuad(quad = {}) {
      const bounds = new Bounds();
      Object.values(quad)
        .map(this.getViewPoint.bind(this))
        .forEach(point => bounds.addPoint(point));
      return bounds.getRectangle();
    },
  };

  const events = makeEventHandler();

  return new Proxy(
    {
      translate(dx, dy) {
        core.translate(dx, dy);
      },
      rotate(angle, origin) {
        return core.rotate(angle, core.getTransformedPoint(origin));
      },
      scale(factor, origin) {
        return core.scale(factor, core.getTransformedPoint(origin));
      },
      fitView(quad, ratio) {
        return core.fitView(quad, ratio);
      },
    },
    {
      get(target, property) {
        if (["on", "clear", "off", "once"].includes(property)) {
          return events[property];
        } else if (property === "transform") {
          return core.transform;
        } else {
          return (...args) => {
            target[property](...args);
            events.emit("update", core.transform);
          };
        }
      },
    }
  );
}

export default makeTransform2D;
