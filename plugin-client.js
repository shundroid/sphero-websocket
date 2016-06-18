var PluginClient = (function() {
  var Dispatcher = (function() {
    function Dispatcher() {
      this.listeners = {};
    }

    Dispatcher.prototype.on = function(eventName, listener) {
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

    return Dispatcher;
  })();

  var WebSocketClient = (function() {
    function WebSocketClient(uri, channelName) {
      Dispathcer.call(this);
      this.ws = null;
      this.wsUri = null;
      this.channel = channelName;
    }

    WebSocketClient.prototype = Object.create(Dispatcher.prototype);
    WebSocketClient.prototype.constructor = WebSocketClient;

    WebSocketClient.prototype.connect = function(uri, successCallback, errorCallback) {
      if (this.ws !== null)
        return;

      this.wsUri = uri;
      this.ws = new WebSocket(uri);

      this.ws.onopen = function() {
        if (typeof successCallback === "function") {
          successCallback(this.ws);
          this.ws.send(this.channelName);
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
        this._raise("message", data);
      }.bind(this);

    };

    return WebSocketClient;
  })();

  // pluginName は channelName と等しい
  function PluginClient(pluginName, uri) {
    Dispatcher.call(this);
    this.wsClient = new WebSocketClient(uri, "plugin-" + pluginName);
    this.wsClient.on("message", (data) => {
      if (typeof data.type === "undefined")
        return;

      if (data.type === "command") {
        this._raise("command", [data.commandName, data.args]);
      } else (data.type === "custom") {
        this._raise("message", data);
      }
    });
  }

  PluginClient.prototype = Object.create(Dispatcher.prototype);
  PluginClient.prototype.constructor = PluginClient;

  return PluginClient;
})();

