var Directory = require("./directory");
var util = require("util");
var spheroServer = require("./spheroServer");

function Client(webSocketServer, isTestMode, pluginManager) {
  Directory.call(this, "client");

  this.connection = webSocketServer.getConnection("sphero");
  this.connection.on("connection", (connection, key) => {
    spheroServer.addClient(key);
    this.connection.on("message", (data, mesId) => {
      var command = data.command;
      var client = spheroServer.getClient(key);
      var orb = spheroServer.getClientsOrb(key);

      if (!client || !Array.isArray(data.arguments)) {
        return;
      }

      if (command.substr(0, 1) === "_") {
        // internal command
        switch (command) {
          case "_list":
            this.connection.send(key, mesId, spheroServer.getList());
            break;
          case "_use":
            if (data.arguments.length === 1) {
              spheroServer.setClientsOrb(key, data.arguments[0]);
            }
            break;
        }
        console.log(command + "(" + data.arguments + ")");
      } else if (command in orb) {
        pluginManager.command(command, data.arguments);
        // Sphero"s command
        if (!isTestMode) {
          orb[command].apply(orb, data.arguments);
        }
        console.log(client.linkedOrb.name + "." + command + "(" + data.arguments.join(",") + ")");
      } else {
        // invalid command
        console.error("invalid command: " + command);
      }
    });
  });
}

util.inherits(Client, Directory);

Client.prototype.onRequest = function(url) {
  return {
    fileName: process.cwd() + "/client/" + url
  };
};

module.exports = Client;

