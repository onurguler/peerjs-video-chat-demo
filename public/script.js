const socket = io('/');
const myPeer = new Peer(undefined, {
  host: '/',
  port: 3001
});
const peers = {};

const videoGrid = document.getElementById('video-grid');

const myVideo = document.createElement('video');
myVideo.muted = true;

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream);

  myPeer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    });
  });

  socket.on('user-connected', userId => {
    console.log('User connected: ' + userId);
    connectToNewUser(userId, stream);
  });
});

// Screen sharing
async function startCapture(displayMediaOptions) {
  let stream = null;

  try {
    stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    window.localStream = stream;
    addVideoStream(myVideo, stream);
    myPeer.on('call', call => {
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on('user-connected', userId => {
      console.log('User connected: ' + userId);

      // @FIXME: Without this settimeout, call.on('stream') now running
      setTimeout(() => {
        connectToNewUser(userId, stream);
      }, 10000);
    });
  } catch (err) {
    console.error("Error: " + err);
  }
  return stream;
}

// startCapture({ video: true, audio: true });

socket.on('user-disconnected', userId => {
  console.log('User disconnected: ' + userId);
  if (peers[userId]) peers[userId].close();
});

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');

  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });

  call.on('close', () => {
    video.remove();
  });

  peers[userId] = call;
}
