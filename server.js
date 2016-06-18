/*
 * sphero-websocket Server
 * https://github.com/Babibubebon
 */
"use strict";
var Client = require("./lib/directories/client");
var HttpServer = require("./lib/httpServer");
var WebSocketServer = require("./lib/wsServer");
var PluginManager = require("./lib/pluginManager");
var spheroServer = require("./lib/spheroServer");
var sphero = require("sphero");
var fs = require("fs");

module.exports = function(config, isTestMode) {
  if (isTestMode) {
    console.log("running test-mode");
  }

  config.sphero.forEach(function(elm) {
    var orb = sphero(elm.port);
    if (!isTestMode)
      orb.connect();
    spheroServer.addOrb(orb, elm.name);
  });

  var httpServer = new HttpServer(config.wsPort);
  var wsServer = new WebSocketServer(httpServer, config.allowedOrigin);

  var client = new Client(wsServer, isTestMode);
  httpServer.addDirectory(client);

  var pluginManager = new PluginManager();
  httpServer.addDirectory(pluginManager);

  httpServer.on("listen", function() {
    console.log((new Date()) + " Server is listening on port " + config.wsPort);
  });
  httpServer.listen();

  process.on("uncaughtException", function(err) {
    console.error(err);
  });
};

