'use strict';

var os = require('os');
var nodeStatic = require('node-static');
var http = require('http');
var socketIO = require('socket.io');
var numClients = 0;

var fileServer = new(nodeStatic.Server)();
var app = http.createServer(function(req, res) {
  fileServer.serve(req, res);
}).listen(8080);

var io = socketIO.listen(app);
io.sockets.on('connection', function(socket) {

  // convenience function to log server messages on the client
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }

  socket.on('message', function(room, message) {
    log('Client said: ', message);
    var nextroom;
    switch(myroom){
      case("A"):{nextroom = "attacker"; break};
      case("attacker"):{nextroom = "attacker"; break};
    }
    // for a real app, would be room-only (not broadcast)
    //socket.broadcast.emit('message', message);
    socket.to().emit('message', message);
  });

  //Modified to set up attack
  socket.on('create or join', function(room) {
    log('Received request to create or join room ' + room);

    // var clientsInRoom = io.sockets.adapter.rooms[room];
    // var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
    // log('Room ' + room + ' now has ' + numClients + ' client(s)');


    if (numClients === 0) {//miTM case
      socket.join("attacker");
      socket.emit('setAttack', room, socket.id);
    }else if(numClients === 1){
      socket.join("A");
      //log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);
    } else if (numClients === 2) {
      //log('Client ID ' + socket.id + ' joined room ' + room);
      //io.sockets.in(room).emit('join', room);
      socket.join("B");
      socket.emit('joined', "B", socket.id);
      //io.sockets.in(room).emit('ready');
    } else { // max two clients plus MiTM
      socket.emit('full', room);
    }
  });

  socket.on('ipaddr', function() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });

  socket.on('bye', function(){
    console.log('received bye');
  });

  // socket.on('readyAttack', function(room){
  //   var clients = [...Object.keys(clientsInRoom.sockets)];
  //   var A = clients[0];
  // });

});
