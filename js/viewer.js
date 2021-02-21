import Camera from "./camera/camera.js";
import Ticker from "./ticker/ticker.js";
import Settings from "./settings/settings.js";
import Context from "./gl/context.js";
import Scene from "./scene/scene.js";

const Viewer = {
  /**
   * @param { Object } options
   * @param { HTMLCanvasElement } options.canvas
   */
  make({ canvas, autoStart = true }) {
    const viewer = {
      canvas,
      ticker: Ticker.make(),
      settings: Settings.make(),
      scene: Scene.make(),
      picker: {
        pick() {},
      },
    };

    const camera = Camera.make(viewer);
    viewer.camera = camera;

    const context = Context.make(viewer);
    viewer.context = context;

    viewer.ticker.addOnce("render", () => context.drawScene());

    viewer.camera.on("update", transform => context.drawScene(transform));
    viewer.scene.on("update", ({ positions }) => {
      context.updatePositions(positions);
      context.drawScene(camera.transform);
    });

    if (autoStart) viewer.ticker.start();

    return viewer;
  },
};

export default Viewer;
