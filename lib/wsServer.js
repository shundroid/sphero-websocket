var _WebSocketServer = require("websocket").server;
var Dispatcher = require("./dispatcher");

function WebSocketServer(httpServerInstance, allowedOrigin, connectionManager) {
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
    this.addConnection(connection, request);
    console.log((new Date()) + " Connection from " + request.remoteAddress + " accepted");
    this._raise("request", [connection, request.key]);
  });
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

WebSocketServer.prototype.addConnection = function(connection, request) {
  var connectionName = null;
  connection.on("message", (message) => {
    console.log("client: " + request.key);
    console.log(message.utf8Data);
    if (message.type === "utf8") {
      try {
        var data = JSON.parse(message.utf8Data);
      } catch (error) {
        throw new Error("invalid JSON format");
      }
      if (typeof data.connectionName === "undefined") {
        if (connectionName !== null)
          this._raise("message-" + connectionName, [data, request.key]);
      } else {
        connectionName = data.connectionName;
        this._raise("connection-" + connectionName, [connection, request.key]);
      }
    }
  });
  connection.on("close", function(reasonCode, description) {
    console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
  });
};

module.exports = WebSocketServer;

