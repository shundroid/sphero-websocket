var _WebSocketServer = require("websocket").server;
var Dispatcher = require("./dispatcher");

function WebSocketServer(httpServerInstance, allowedOrigin) {
  Dispatcher.call(this);
  this.allowedOrigin = allowedOrigin;
  this.wsServer = new _WebSocketServer({
    httpServer: httpServerInstance.httpServer,
    autoAcceptConnections: false
  });
  this.wsServer.on("request", (request) => {
    if (!this.originIsAllowed(request.origin)) {
      console.log((new Date()) + " Connection from origin " + request.origin + " rejected.");
      request.reject();
    }
    var connection = request.accept(null, request.origin);
    connection.on("message", (message) => {
      console.log("client: " + request.key);
      if (message.type === "utf8") {
        try {
          var data = JSON.parse(message.utf8Data);
        } catch (error) {
          throw new Error("invalid JSON format");
        }
        this._raise("message," + data.channel, [data, request.key]);
      }
    });
    connection.on("close", function(reasonCode, description) {
      console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
    });
    console.log((new Date()) + " Connection from " + request.remoteAddress + " accepted");
    this._raise("request", [connection, request.key]);
  });
  this.channels = [];
}

WebSocketServer.prototype = Object.create(Dispatcher.prototype);
WebSocketServer.prototype.constructor = WebSocketServer;

WebSocketServer.prototype.originIsAllowed = function(origin) {
  if (this.wsAllowedOrigin == null || this.wsAllowedOrigin === "*")
    return true;
  if (this.wsAllowedOrigin === origin)
    return true;
  if (Array.isArray(this.wsAllowedOrigin) && this.wsAllowedOrigin.indexOf(origin) >= 0)
    return true;
  return false;
};

WebSocketServer.prototype.on = function(eventName, listener) {
  // addDirectory で使う用に、eventNameに,が含まれていないかをチェックする
  if (eventName.indexOf(",") === -1) {
    Dispatcher.prototype.on.apply(this, [eventName, listener]);
  } else {
    throw new Error("eventNameに,を使うことはできません。");
  }
};

WebSocketServer.prototype.addChannel = function(channelName, messageCallback) {
  if (this.channels.indexOf(channelName) !== -1) {
    throw new Error("追加しようとした channel は、既に存在します。");
  }
  this.channels.push(channelName);
  Dispatcher.prototype.on.apply(this, ["message," + channelName, messageCallback]);
}

module.exports = WebSocketServer;

