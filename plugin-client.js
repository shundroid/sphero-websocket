var PluginClient = (function() {
  var EventEmitter = (function() {
    function EventEmitter() {
      this.listeners = {};
    }

    EventEmitter.prototype.on = function(eventName, listener) {
      if (typeof this.listeners[eventName] === "undefined") {
        this.listeners[eventName] = [];
      }
      this.listeners[eventName].push(listener);
    };

    EventEmitter.prototype.emit = function(eventName, args) {
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

    return EventEmitter;
  })();

  var WebSocketClient = (function() {
    function WebSocketClient(uri, connectionName) {
      Dispathcer.call(this);
      this.ws = null;
      this.wsUri = null;
      this.connectionName = connectionName;
    }

    WebSocketClient.prototype = Object.create(EventEmitter.prototype);
    WebSocketClient.prototype.constructor = WebSocketClient;

    WebSocketClient.prototype.connect = function(uri, successCallback, errorCallback) {
      if (this.ws !== null)
        return;

      this.wsUri = uri;
      this.ws = new WebSocket(uri);

      this.ws.onopen = function() {
        if (typeof successCallback === "function") {
          successCallback(this.ws);
          this.ws.send(this.connectionName);
        }
      }.bind(this);

      this.ws.onclose = function() {
        this.ws = null;
      }.bind(this);

      this.ws.onmessage = function(message) {
        try {
          var data = JSON.parse(message.data);
        } catch (error) {
          console.log(error);
          return;
        }
        this.emit("message", data);
      }.bind(this);

    };

    return WebSocketClient;
  })();

  // pluginName は channelName と等しい
  function PluginClient(pluginName, uri) {
    EventEmitter.call(this);
    this.wsClient = new WebSocketClient(uri, "plugin-" + pluginName);
    this.wsClient.on("message", (data) => {
      if (typeof data.type === "undefined")
        return;

      if (data.type === "command") {
        this.emit("command", [data.commandName, data.args]);
      } else (data.type === "custom") {
        this.emit("message", data);
      }
    });
  }

  PluginClient.prototype = Object.create(EventEmitter.prototype);
  PluginClient.prototype.constructor = PluginClient;

  return PluginClient;
})();

