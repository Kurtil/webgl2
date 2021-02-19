import { makeIdGenerator } from "./utils.js";

function makeEventHandler() {
  const idGenerator = makeIdGenerator();
  const subscriptions = new Map();
  const eventHandlers = new Map();

  return Object.freeze({
    on(eventName, callback) {
      if (typeof callback !== "function") {
        throw new Error(`callback must be a function, get ${typeof callback}`);
      }
      const subscriptionId = idGenerator();
      subscriptions.set(subscriptionId, { eventName, callback });
      if (eventHandlers.has(eventName)) {
        eventHandlers.get(eventName).push(callback);
      } else {
        eventHandlers.set(eventName, [callback]);
      }
      return subscriptionId;
    },
    once(eventName, callback) {
      if (typeof callback !== "function") {
        throw new Error(`callback must be a function, get ${typeof callback}`);
      }
      const subscriptionId = this.on(eventName, (...args) => {
        this.off(subscriptionId);
        callback(...args);
      });
      return subscriptionId;
    },
    off(subscriptionId) {
      const subscription = subscriptions.get(subscriptionId);
      if (subscription) {
        const { eventName, callback } = subscription;
        const handlers = eventHandlers
          .get(eventName)
          .filter(handler => handler !== callback);
        if (handlers.length) {
          eventHandlers.set(eventName, handlers);
        } else {
          eventHandlers.delete(eventName);
        }
        subscriptions.delete(subscriptionId);
      }
    },
    emit(eventName, payload) {
      eventHandlers.get(eventName)?.forEach(handler => handler(payload));
    },
    clear() {
      subscriptions.clear();
      eventHandlers.clear();
    },
  });
}

export default makeEventHandler;
