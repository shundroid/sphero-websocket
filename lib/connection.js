var EventEmitter = require("events").EventEmitter;
var util = require("util");

// なぜ生のconnectionを使わず、ラップして使うか
// server.js では、connection.on などのメソッドを使うが、
// それだとconnectionを取得してからでなければ使えないため、
// connection.on はconnectionを取得していなくてもできるようにするため。
// -> コンストラクタとsetConnectionで分けている理由にもなる。

function Connection() {
  EventEmitter.call(this);
  this.rawConnection = null;
  this.key = null;
}

util.inherits(Connection, EventEmitter);

Connection.prototype.setConnection = function(connection, key) {
  this.rawConnection = connection;
  this.key = key;

  this.rawConnection.on("message", (message) => {
    if (message.type === "utf8") {
      try {
        var data = JSON.parse(message.utf8Data);
      } catch (error) {
        throw new Error("invalid JSON format");
      }
      this.emit("message", data);
    }
  });

  this.rawConnection.on("close", function(reasonCode, description) {
    this.emit("close", reasonCode, description);
  });

  this.emit("connection", connection);
};

Connection.prototype.hasConnection = function() {
  return this.rawConnection !== null;
};

module.exports = Connection;

