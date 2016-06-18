var Directory = require("./directory");
var util = require("util");

function PluginManager() {
  Directory.call(this, "plugin");
  this.plugins = {};
}

util.inherits(PluginManager, Directory);

PluginManager.prototype.add = function(plugin) {
  if (plugin instanceof Array) {
    plugin.forEach(_plugin => {
      this.plugins[_plugin.name] = _plugin;
    });
  } else {
    this.plugins[plugin.name] = plugin;
  }
};

PluginManager.prototype.command = function(commandName, args) {
  Object.keys(this.plugins).forEach(pluginName => {
    plugin.command(commandName, args);
  });
};

PluginManager.prototype.onRequest = function(url) {
  if (url === "plugin-client.js") {
    return {
      fileName: process.cwd() + "/plugin-client.js"
    };
  } else {
    var requestPluginName = url.split("/")[1];
    if (Object.keys(this.plugins).indexOf(requestPluginName) !== -1) {
      return {
        fileName: this.plugins[requestPluginName].directory + "/" + url.split("/")[2]
      };
    }
  }
};

module.exports = PluginManager;

