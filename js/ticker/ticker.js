import makeEventHandler from "../events.js";
import makeScheduler from "./scheduler.js";

/**
 * Make a ticker.
 * @param { Function } nextTick
 * @param { Function } now
 *
 * @returns { Ticker }
 */
const Ticker = {
  make(
    nextTick = window.requestAnimationFrame,
    now = performance.now.bind(performance)
  ) {
    if (typeof nextTick !== "function") {
      throw new Error(
        `Ticker - "nextTick" must be a function, get "${typeof nextTick}".`
      );
    }
    if (typeof now !== "function") {
      throw new Error(
        `Ticker - "now" must be a function, get "${typeof now}".`
      );
    }
    const events = makeEventHandler();
    let running = false;
    let time = null;

    const scheduler = makeScheduler();

    function tick() {
      const t = now();
      const dt = t - time;

      scheduler.run(dt);

      events.emit("tick", dt);
      time = t;
    }

    const run = () => {
      if (running) {
        tick();
        nextTick(run);
      }
    };

    const ticker = {
      start() {
        running = true;
        time = now();
        run();
      },
      stop() {
        running = false;
      },
      get running() {
        return running;
      },
      ...scheduler,
      ...events,
    };

    // Interface overlap
    ticker.clearTasks = scheduler.clear;
    ticker.clearEvents = events.clear;
    ticker.clear = () => {
      console.warn(
        "Ticker - You must precise what do you want to clear : events or tasks."
      );
    };

    return Object.freeze(ticker);
  },
};

export default Ticker;
