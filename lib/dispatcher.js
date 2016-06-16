function Dispatcher() {
  this.listeners = {};
}

Dispatcher.prototype.on = function(eventName, listener) {
  if (typeof listener !== "function") {
    throw new Error("listenerが関数ではありませんでした。");
  }
  if (typeof this.listeners[eventName] === "undefined") {
    this.listeners[eventName] = [];
  }
  this.listeners[eventName].push(listener);
};

Dispatcher.prototype._raise = function(eventName, args) {
  if (typeof this.listeners[eventName] !== "undefined") {
    this.listeners[eventName].forEach(listener => {
      if (typeof args === "undefined") {
        listener();
      } else {
        listener.apply(this, args);
      }
    });
  }
};

module.exports = Dispatcher;

