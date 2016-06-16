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
    var orb = sphero(elm.port);
    if (!isTestMode)
      orb.connect();
    spheroServer.addOrb(orb, elm.name);
  });

  var pluginManager = new PluginManager();

  var httpServer = new HttpServer(config.wsPort);
  var client = new Client();
  httpServer.addDirectory(client);
  httpServer.on("listen", function() {
    console.log((new Date()) + " Server is listening on port " + config.wsPort);
  });
  httpServer.listen();

  var wsServer = new WebSocketServer(httpServer, config.allowedOrigin);
  wsServer.on("request", function(connection, key) {
    spheroServer.addClient(key, connection);
    wsServer.on("message", function(message) {
      console.log("client: " + key);
      if (message.type === "utf8") {
        try {
          var data = JSON.parse(message.utf8Data);
        } catch (e) {
          console.error("invalid JSON format");
          return;
        }
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
              spheroServer.sendList(key, data.ID);
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
      }
    });
    connection.on("close", function(reasonCode, description) {
      console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
    });
  });

  process.on("uncaughtException", function(err) {
      console.error(err);
  });

};

