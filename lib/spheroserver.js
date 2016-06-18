var spheroServer = module.exports = {
    orbs: {},
    clients: {}
};

spheroServer.addOrb = function(orb, name) {
    if (name == null)
        name = "Sphero_" + (Object.keys(this.orbs).length + 1);
    this.orbs[name] = {
        name: name,
        instance: orb,
        lock: false
    };
};

spheroServer.getOrb = function(name) {
    if (name == null)
        return this.orbs;
    if (name in this.orbs)
        return this.orbs[name];
    return false;
};

spheroServer.addClient = function(key) {
    this.clients[key] = {
        linkedOrb: this.orbs[Object.keys(this.orbs)[0]]
    };
};

spheroServer.isCommand = function(command) {

}

spheroServer.getClient = function(key) {
    if (key == null)
        return this.clients;
    if (key in this.clients)
        return this.clients[key];
    return false;
};

spheroServer.getClientsOrb = function(key) {
    if (key in this.clients)
        return this.getClient(key).linkedOrb.instance;
    return false;
};

// new method
spheroServer.getLinkedOrb = function(key) {
  if (key in this.clients)
    return this.getClient(key).linkedOrb;
};

spheroServer.setClientsOrb = function(key, name) {
    if (key in this.clients && name in this.orbs) {
        this.clients[key].linkedOrb = this.getOrb(name);
        return true;
    } else {
        return false;
    }
};

spheroServer.getList = function() {
  return Object.keys(this.getOrb());
};

