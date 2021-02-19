import Camera from "./camera/camera.js";
import Ticker from "./ticker/ticker.js";
import Settings from "./settings/settings.js";
import Context from "./gl/main.js";

/** @type { HTMLCanvasElement } */
const canvas = document.getElementById("canvas");

const viewer = {
  canvas,
  ticker: Ticker.make(),
  settings: Settings.make(),
  picker: {
    pick() {},
  },
};

const camera = Camera.make(viewer);

viewer.camera = camera;

const gl = canvas.getContext("webgl2");
if (!gl) {
  throw new Error(
    "Need WebGL 2 context to run properly. Please consider using a compatible browser."
  );
}

viewer.gl = gl;

const context = Context.make(gl);

viewer.ticker.addOnce("render", () => context.drawScene());

viewer.camera.on("update", transform => context.drawScene(transform));

viewer.ticker.start();
