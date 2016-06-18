var Directory = require("../directory");
var util = require("util");

function Client() {
  Directory.call(this, "client");
}

util.inherits(Client, Directory);

Client.prototype.onRequest = function(url) {
  return {
    fileName: process.cwd() + "/client/" + url
  };
};

module.exports = Client;

