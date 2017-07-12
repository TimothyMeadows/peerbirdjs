var express = require('express')
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;
var fs = require('fs');

var peers = [];
app.set('port', process.env.PORT || 3000);

var indexPage = fs.readFileSync("./index.html");
var examplePage = fs.readFileSync("./example.html");

app.get('/', function (req, res, next) {
   res.end(indexPage);
});

app.get('/example', function (req, res, next) {
   res.end(examplePage);
});

var server = ExpressPeerServer(app.listen(app.get('port')), {
   debug: false,
   key: "peerbird10",
   allow_discovery: false
});

app.use('/peerbird', server);

server.on('connection', function (id) {
   var index = peers.indexOf(id);
   if (index == -1)
      peers.push(id);
});

server.on('disconnect', function (id) {
   var index = peers.indexOf(id);
   if (index != -1)
      peers.splice(index, 1);
});

app.get('/peerbirds', function (req, res, next) {
   return res.json(peers);
});