var _WebSocketServer = require("websocket").server;
var EventEmitter = require("events").EventEmitter;
var util = require("util");
var Connection = require("./connection");

function WebSocketServer(httpServerInstance, allowedOrigin, connectionManager) {
  EventEmitter.call(this);
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
    this.addConnection(connection, request.key);
    console.log((new Date()) + " Connection from " + request.remoteAddress + " accepted");
    this.emit("request", connection, request.key);
  });
  this.connections = {};
}

util.inherits(WebSocketServer, EventEmitter);

WebSocketServer.prototype.originIsAllowed = function(origin) {
  if (this.wsAllowedOrigin == null || this.wsAllowedOrigin === "*")
    return true;
  if (this.wsAllowedOrigin === origin)
    return true;
  if (Array.isArray(this.wsAllowedOrigin) && this.wsAllowedOrigin.indexOf(origin) >= 0)
    return true;
  return false;
};

WebSocketServer.prototype.addConnection = function(connection, key) {
  var connectionName = null;
  connection.on("message", (message) => {
    if (message.type === "utf8") {
      try {
        var data = JSON.parse(message.utf8Data);
      } catch (error) {
        throw new Error("invalid JSON format");
      }
      console.log("client: " + key);
      if (typeof data.connectionName === "undefined") {
        if (connectionName !== null)
          this.emit("message-" + connectionName, [data, key]);
      } else {
        if (typeof this.connections[data.connectionName] === "undefined") {
          this.connections[data.connectionName] = new Connection();
        }
        this.connections[data.connectionName].setConnection(connection, key);
        console.log("connection " + data.connectionName + " is ready.");
      }
    }
  });
  connection.on("close", function(reasonCode, description) {
    console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
  });
};

WebSocketServer.prototype.getConnection = function(connectionName) {
  if (typeof this.connections[connectionName] === "undefined") {
    this.connections[connectionName] = new Connection();
  }
  return this.connections[connectionName];
};

module.exports = WebSocketServer;

