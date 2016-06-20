var http = require("http");
var mime = require("mime");
var fs = require("fs");
var EventEmitter = require("events").EventEmitter;
var util = require("util");

function HttpServer(port, wsAllowedOrigin) {
  EventEmitter.call(this);
  this.port = port;
  this.httpServer = http.createServer((request, response) => {
    if (request.url === "/") {
      response.writeHead(200);
      response.write("This is Sphero WebSocket Server.");
      response.end();
    } else {
      try {
        var url = request.url.substring(request.url.length - 1) === "/" ?
          request.url + "index.html" : request.url;
        var requestDirectoryName = url.substring(1).split("/")[0];
        if (Object.keys(this.directories).indexOf(requestDirectoryName) === -1) {
          throw new Error("directoryは存在しませんでした。");
        }
        var insideUrl = url.substring(("/" + requestDirectoryName + "/").length);
        var responseDetail = this.directories[requestDirectoryName](insideUrl);
        if (typeof responseDetail.error !== "undefined") {
          response.writeHead(responseDetail.error);
          response.write("Error: " + responseDetail.error);
          response.end();
          return;
        }
        response.writeHead(200, {
          "Content-Type": mime.lookup(responseDetail.fileName)
        });
        fs.readFile(responseDetail.fileName, function(err, data) {
          if (err) {
            throw err;
          }
          response.end(data);
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

util.inherits(HttpServer, EventEmitter);

HttpServer.prototype.listen = function() {
  this.httpServer.listen(this.port, () => {
    this.emit("listen");
  });
};

HttpServer.prototype.addDirectory = function(directory) {
  if (typeof this.directories[directory.directoryName] !== "undefined") {
    throw new Error("ディレクトリ " + directory.directoryName + " は既に存在しているため、追加できませんでした。");
  }
  this.directories[directory.directoryName] = function(url) {
    // そのまま関数を入れないのは、スコープを変更しないようにするため。
    return directory.onRequest(url);
  };
};

module.exports = HttpServer;

