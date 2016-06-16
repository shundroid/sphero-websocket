var Directory = require("./directory");

function Client() {
  Directory.call(this, "client");
}

Client.prototype = Object.create(Directory.prototype);
Client.prototype.constructor = Client;

Client.prototype.onRequest = function(url) {
  return {
    fileName: __dirname + "/client/" + url
  };
};

module.exports = Client;

