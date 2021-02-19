import makeEventHandler from "../../events.js";

/**
 * Make an HTMLElement Handler for user interactions.
 * Emits events:
 * - "click", payload: { position, keys }
 * - "right-click", payload: { position, keys }
 * - "move", payload: { position, keys }
 * - "drag", payload: { dx, dy, keys }
 * - "scroll", payload: { position, dx, dy, keys }
 * - "exit", no payload, when the mouse leave `el`.
 *
 * @param { HTMLElement } el
 * @param { boolean } [preventDefault=true]
 *
 * @returns {{destroy: function} & EventHandler }
 */
function makeHTMLElementUIHandler(el, preventDefault = true) {
  if (!(el instanceof HTMLElement)) {
    throw new Error(
      `HTML element UI handler requires an HTMLELEMENT, get ${el}`
    );
  }

  const events = makeEventHandler();

  const state = {
    dragging: false,
    rightClick: false,
  };

  const eventListerners = [];

  function addEventListener(htmlElement, eventName, handler) {
    const handlerWrapper = e => {
      if (preventDefault) {
        e.preventDefault();
      }
      return handler(e);
    };
    eventListerners.push({ htmlElement, eventName, handler: handlerWrapper });
    el.addEventListener(eventName, handlerWrapper);
  }

  addEventListener(el, "mousedown", () => {
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", onMouseUp);
  });

  eventListerners.push(
    {
      el: document,
      eventName: "mousemove",
      handler: onDrag,
    },
    {
      el: document,
      eventName: "mouseup",
      handler: onMouseUp,
    }
  );

  function onDrag(e) {
    if (e.movementX === 0 && e.movementY === 0) return;
    state.dragging = true;
    document.body.style.cursor = "move";
    events.emit("drag", {
      dx: e.movementX * window.devicePixelRatio,
      dy: e.movementY * window.devicePixelRatio,
      keys: keys(e),
    });
  }

  function onMouseUp(e) {
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", onMouseUp);
    document.body.style.cursor = null;
    if (!state.dragging) {
      events.emit(state.rightClick ? "right-click" : "click", {
        position: position(e),
        keys: keys(e),
      });
    }
    state.dragging = false;
    state.rightClick = false;
  }

  addEventListener(el, "wheel", e => {
    events.emit("scroll", {
      position: position(e),
      dx: e.deltaX,
      dy: e.deltaY,
      keys: keys(e),
    });
  });

  addEventListener(el, "contextmenu", () => {
    state.rightClick = true;
  });

  addEventListener(el, "mousemove", e => {
    if (!state.dragging) {
      events.emit("move", { position: position(e), keys: keys(e) });
    }
  });

  addEventListener(el, "mouseleave", () => events.emit("exit"));

  return {
    ...events,
    destroy() {
      eventListerners.forEach(({ htmlElement, eventName, handler }) => {
        htmlElement.removeEventListener(eventName, handler);
      });
    },
  };
}

function keys(event = {}) {
  return {
    ctrl: event.ctrlKey,
    alt: event.altKey,
    shift: event.shiftKey,
    meta: event.metaKey,
  };
}

function position(event = {}) {
  return {
    x: Math.max(event.offsetX, 0) * window.devicePixelRatio,
    y: Math.max(event.offsetY, 0) * window.devicePixelRatio,
  };
}

export default makeHTMLElementUIHandler;
