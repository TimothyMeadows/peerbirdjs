
var Peerbird = (function () {
    if (Peer == null || typeof Peer === 'undefined') {
        alert("peerbirdjs requires peerjs be loaded first. Please insure peerjs is loaded.");
        return;
    }

    var peer = null;
    var local = null;

    var debug = this.debug = false;
    var peers = this.peers = [];
    var discoveryTime = this.discoveryTime = 10000;
    var host = this.host = window.location.hostname;
    var port = this.port = window.location.port;

    function KeyValuePair(key, value) {
        this.Key = key;
        this.Value = value;
    }

    KeyValuePair.prototype.change = function (newKey, newValue) {
        this.Key = newKey;

        if (newValue)
            this.Value = newValue;
    }

    function Random() {
        this.Next = function () {
            return 'xxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    }

    var localPeer = "peer-" + new Random().Next();
    function connectPeer(id) {
        if (id == localPeer)
            return;

        var exsisting = peers.find(function (p) {
            return p.Key == id;
        });

        if (typeof exsisting != 'undefined')
            return;

        console.log("connecting to peer " + id);
        var connection = peer.connect(id);
        var connectionId = id;

        connection.on('open', function () {
            console.log("connected to peer " + connectionId);
            connection.on('error', function (err) {
                if (debug)
                    console.log(err);
                else
                    console.log("an error has occured.")
            });

            peers.push(new KeyValuePair(id, connection));
        });
    }

    function discoverPeers() {
        var peerDiscovery = new XMLHttpRequest();
        peerDiscovery.onreadystatechange = function () {
            if (peerDiscovery.readyState == 4 && peerDiscovery.status == 200) {
                var response = peerDiscovery.responseText;
                if (response) {
                    var peerDiscoveryList = JSON.parse(response);
                    for (var i = 0; i <= peerDiscoveryList.length - 1; i++)
                        connectPeer(peerDiscoveryList[i]);
                }
            }
        }

        peerDiscovery.open("GET", window.location + "peerbirds", true);
        peerDiscovery.send(null);
    }

    peer = new Peer(localPeer, { host: host, port: port, path: '/peerbird', key: 'peerbird10' });
    peer.on('open', function (id) {
        if (debug)
            console.log("local peer opened.");

    });

    peer.on('error', function (err) {
        if (debug)
            console.log(err);
        else
            console.log("an error has occured.")
    });

    peer.on('connection', function (connection) {
        connection.on('data', function (packet) {
            if (debug)
                console.log(packet);
        });

        connection.on('close', function () {
            peers.splice(peers.indexOf(connection.peer), 1);
        });
    });

    local = peer.connect(localPeer);
    discoverPeers();
    setInterval(function () { discoverPeers(); }, discoveryTime);
})();