var EventEmitter = require("events").EventEmitter;
var util = require("util");

// なぜ生のconnectionを使わず、ラップして使うか
// server.js では、connection.on などのメソッドを使うが、
// それだとconnectionを取得してからでなければ使えないため、
// connection.on はconnectionを取得していなくてもできるようにするため。
// -> コンストラクタとsetConnectionで分けている理由にもなる。

function ConnectionList() {
  EventEmitter.call(this);
  this.connections = {};
}

util.inherits(ConnectionList, EventEmitter);

ConnectionList.prototype.addConnection = function(connection, key) {
  this.connections[key] = {
    rawConnection: connection,
    key: key
  };

  connection.on("message", (message) => {
    if (message.type === "utf8") {
      try {
        var data = JSON.parse(message.utf8Data);
      } catch (error) {
        throw new Error("invalid JSON format");
      }
      this.emit("message", data);
    }
  });

  connection.on("close", function(reasonCode, description) {
    this.emit("close", reasonCode, description);
  });

  this.emit("connection", connection, key);
};

module.exports = ConnectionList;

