var Directory = require("./directory");

function PluginManager() {
  Directory.call(this, "plugin");
  this.plugins = [];
}

PluginManager.prototype = Object.create(Directory.prototype);
PluginManager.prototype.constructor = PluginManager;

PluginManager.prototype.add = function(plugin) {
  if (plugin instanceof Array) {
    Array.prototype.push.apply(this.plugins, plugin);
  }
  this.plugins.push(plugin);
};

PluginManager.prototype.command = function(commandName, args) {
  this.plugins.forEach(plugin => {
    plugin.command(commandName, args);
  });
};

PluginManager.prototype.onRequest = function(url) {
  if (url === "plugin-client.js") {
    return {
      fileName: process.cwd() + "/plugin-client.js"
    };
  }
};

module.exports = PluginManager;

