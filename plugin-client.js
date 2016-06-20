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
    function WebSocketClient(connectionName) {
      EventEmitter.call(this);
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

      this.ws.onopen = () => {
        if (typeof successCallback === "function") {
          this.ws.send(JSON.stringify({
            connectionName: this.connectionName
          }));
          successCallback(this.ws);
        }
      };

      this.ws.onclose = () => {
        this.ws = null;
      };

      this.ws.onmessage = (message) => {
        try {
          var data = JSON.parse(message.data);
        } catch (error) {
          console.log(error);
          return;
        }
        this.emit("message", [data.content, data.ID]);
      };

    };

    return WebSocketClient;
  })();

  function PluginClient(pluginName) {
    EventEmitter.call(this);
    var uri = "ws://" + location.host;

    this.wsClient = new WebSocketClient("plugin-" + pluginName);
    this.wsClient.on("message", (content, mesId) => {
      if (typeof content.type === "undefined")
        return;

      if (content.type === "command") {
        this.emit("command", [content.command, content.arguments]);
      } else if (content.type === "custom") {
        this.emit("message", [content, mesId]);
      }
    });
    this.wsClient.connect(uri, function() {
      console.log("connected");
    }, function() {
      console.log("connecting error");
    });
  }

  PluginClient.prototype = Object.create(EventEmitter.prototype);
  PluginClient.prototype.constructor = PluginClient;

  return PluginClient;
})();

