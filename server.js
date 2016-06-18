/*
 * sphero-websocket Server
 * https://github.com/Babibubebon
 */
"use strict";
var Client = require("./lib/directories/client");
var HttpServer = require("./lib/httpServer");
var WebSocketServer = require("./lib/wsServer");
var PluginManager = require("./lib/pluginManager");
var sphero = require("sphero");
var spheroServer = require("./lib/spheroServer");
var fs = require("fs");

module.exports = function(config, isTestMode) {
  if (isTestMode) {
    console.log("running test-mode");
  }

  config.sphero.forEach(function(elm) {
    console.log("hoge");
    var orb = sphero(elm.port);
    if (!isTestMode)
      orb.connect();
    spheroServer.addOrb(orb, elm.name);
  });

  var httpServer = new HttpServer(config.wsPort);
  var client = new Client();
  httpServer.addDirectory(client);
  httpServer.on("listen", function() {
    console.log((new Date()) + " Server is listening on port " + config.wsPort);
  });
  httpServer.listen();

  var wsServer = new WebSocketServer(httpServer, config.allowedOrigin);
  var spheroConnectionList = wsServer.getConnection("sphero");
  spheroConnectionList.on("connection", function(connection, key) {
    spheroServer.addClient(key, connection);
    spheroConnectionList.on("message", function(data) {
      var command = data.command;
      var client = spheroServer.getClient(key);
      var orb = spheroServer.getClientsOrb(key);

      if (!client || !Array.isArray(data.arguments)) {
        return;
      }

      if (command.substr(0, 1) === "_") {
        // internal command
        switch (command) {
          case "_list":
            spheroConnectionList.send(key, { ID: data.mesID, content: spheroServer.getList() });
            break;
          case "_use":
            if (data.arguments.length === 1) {
              spheroServer.setClientsOrb(key, data.arguments[0]);
            }
            break;
        }
        console.log(command + "(" + data.arguments + ")");
      } else if (command in orb) {
        // Sphero"s command
        if (!isTestMode) {
          orb[command].apply(orb, data.arguments);
        }
        console.log(client.linkedOrb.name + "." + command + "(" + data.arguments.join(",") + ")");
      } else {
        // invalid command
        console.error("invalid command: " + command);
      }
    });
  });

  process.on("uncaughtException", function(err) {
    console.error(err);
  });

  var pluginManager = new PluginManager();
  httpServer.addDirectory(pluginManager);
};

