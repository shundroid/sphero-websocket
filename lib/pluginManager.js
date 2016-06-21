var Directory = require("./directory");
var util = require("util");
var path = require("path");

function PluginManager(wsServer) {
  this.wsServer = wsServer;
  Directory.call(this, "plugin");
  this.plugins = {};
}

util.inherits(PluginManager, Directory);

PluginManager.prototype.add = function(plugin) {
  if (plugin instanceof Array) {
    plugin.forEach(_plugin => {
      this.add(_plugin);
    });
  } else {
    this.plugins[plugin.name] = {
      plugin: plugin,
      connection: this.wsServer.getConnection("plugin-" + plugin.name)
    };
  }
};

PluginManager.prototype.command = function(commandName, args) {
  Object.keys(this.plugins).forEach(pluginName => {
    this.plugins[pluginName].plugin.command(commandName, args);

    var mesID = (new Date()).getTime().toString() + Math.floor(Math.random() * 1000);
    this.plugins[pluginName].connection.sendAll(mesID, {
      type: "command",
      command: commandName,
      arguments: args
    });
  });
};

PluginManager.prototype.onRequest = function(url) {
  if (url === "plugin-client.js") {
    return {
      fileName: path.resolve(__dirname, "../plugin-client.js")
    };
  } else {
    var requestPluginName = url.split("/")[0];
    if (Object.keys(this.plugins).indexOf(requestPluginName) !== -1) {
      return {
        fileName: this.plugins[requestPluginName].plugin.directory + "/" + url.split("/")[1]
      };
    } else {
      return {
        error: 404
      };
    }
  }
};

module.exports = PluginManager;

