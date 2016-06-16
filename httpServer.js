var http = require("http");
var mime = require("mime");
var fs = require("fs");
var Dispatcher = require("./dispatcher");

function HttpServer(port, wsAllowedOrigin) {
  Dispatcher.call(this);
  this.port = port;
  this.httpServer = http.createServer((request, response) => {
    if (request.url === "/") {
      response.writeHead(200);
      response.write("This is Sphero WebSocket Server.");
      response.end();
    } else {
      try {
        var requestDirectoryName = request.url.substring(1).split("/")[0];
        if (Object.keys(this.directories).indexOf(requestDirectoryName) === -1) {
          throw new Error("directoryは存在しませんでした。");
        }
        var insideUrl = request.url.substring(1).split("/")[1];
        var responseDetail = this.directories[requestDirectoryName](insideUrl);
        response.writeHead(200, {
          "Content-Type": mime.lookup(responseDetail.fileName)
        });
        fs.readFile(responseDetail.fileName, "utf-8", function(err, data) {
          if (err) {
            throw err;
          }
          response.write(data);
          response.end();
        });
      } catch (error) {
        response.writeHead(500);
        response.write("サーバー側でエラーが発生しました。");
        response.end();
        console.log(error);
      }
    }
  });
  this.wsAllowedOrigin = wsAllowedOrigin;
  this.directories = {};
}

HttpServer.prototype = Object.create(Dispatcher.prototype);
HttpServer.prototype.constructor = HttpServer;

HttpServer.prototype.listen = function() {
  this.httpServer.listen(this.port, () => {
    this._raise("listen");
  });
};

HttpServer.prototype.addDirectory = function(directory) {
  if (typeof this.directories[directory.directoryName] !== "undefined") {
    throw new Error("ディレクトリ " + directory.directoryName + " は既に存在しているため、追加できませんでした。");
  }
  this.directories[directory.directoryName] = directory.onRequest;
};

module.exports = HttpServer;

