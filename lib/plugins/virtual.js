function VirtualPlugin() {
  this.directory = __dirname + "/virtual";
}

VirtualPlugin.prototype.command = function(commandName, args) {
  console.log("receive command! : " + commandName);
}

module.exports = VirtualPlugin;

