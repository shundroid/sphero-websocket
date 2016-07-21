var spheroWebSocket = require("./server");
var config = require("./config");
var spheroServer = spheroWebSocket(config, true).spheroServer;

spheroServer.events.on("addClient", function(key, client) {
  client.on("arriveCustomMessage", function(name, data, mesId) {
    switch (name) {
      case "getList":
        client.sendCustomMessage("list", spheroServer.getList(), mesId);
        break;
      case "use":
        client.setLinkedOrb(spheroServer.getOrb(data));
        break;
    }
  });
});

