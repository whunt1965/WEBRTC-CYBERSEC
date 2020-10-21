function create_window(){
  var current = window.location.href;
  var url = current + "/room.html?roomtype=create"
  window.open(url, 'newwindow', 'width = 300, height = 250');
}

async function test_camera(){
	const stream = await navigator.mediaDevices.getUserMedia(
      {video: true, audio: true});
  document.querySelector('#localVideo').srcObject = stream;
  localStream = stream;
}

function join_window(){
  roomDialog = new mdc.dialog.MDCDialog(document.querySelector('#room-dialog'));
  joinRoom();

  
}

function joinRoom() {
  //document.querySelector('#createBtn').disabled = true;
  //document.querySelector('#joinBtn').disabled = true;
  var url =
  document.querySelector('#confirmJoinBtn').
      addEventListener('click', async () => {
        roomId = document.querySelector('#room-id').value;
        console.log('Join room: ', roomId);
        document.querySelector(
            '#currentRoom').innerText = `Current room is ${roomId} - You are the callee!`;
        await window.open(window.location.href + "/room.html?roomtype=join&room_id=" + roomId, 'newwindow', 'width = 1000, height = 500');
      }, {once: true});
  roomDialog.open();
}