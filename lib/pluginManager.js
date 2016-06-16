function PluginManager() {
  this.plugins = [];
}

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

module.exports = PluginManager;

