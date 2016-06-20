/*
 * sphero-websocket Server
 * https://github.com/Babibubebon
 */
"use strict";
var Client = require("./lib/client");
var HttpServer = require("./lib/httpServer");
var WebSocketServer = require("./lib/wsServer");
var PluginManager = require("./lib/pluginManager");
var spheroServer = require("./lib/spheroServer");
var sphero = require("sphero");
var fs = require("fs");

var VirtualPlugin = require("./lib/plugins/virtual");

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

  var pluginManager = new PluginManager(wsServer);
  httpServer.addDirectory(pluginManager);

  pluginManager.add(new VirtualPlugin());

  var client = new Client(wsServer, isTestMode, pluginManager);
  httpServer.addDirectory(client);

  httpServer.on("listen", function() {
    console.log((new Date()) + " Server is listening on port " + config.wsPort);
  });
  httpServer.listen();

  process.on("uncaughtException", function(err) {
    console.error(err);
  });
};

