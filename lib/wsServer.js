var _WebSocketServer = require("websocket").server;
var Dispatcher = require("./dispatcher");

function WebSocketServer(httpServerInstance, allowedOrigin) {
  Dispatcher.call(this);
  var self = this;
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
      this._raise("message", [message]);
    });
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
}

module.exports = WebSocketServer;

