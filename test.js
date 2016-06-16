var argv = require("argv");

var config = require("./config");
var server = require("./server");

var opts = [
  { name: "test", type: "boolean" }
];

var args = argv.option(opts).run();

server(config, args.options.test);

