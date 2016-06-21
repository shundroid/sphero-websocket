var VirtualPlugin = require("sphero-ws-virtual-plugin");
module.exports = {
    wsPort: 8080,
    allowedOrigin: "*",
    sphero: [
        {name: "Rin", port: "COM3"}
    ],
    plugins: [
      new VirtualPlugin()
    ]
};
