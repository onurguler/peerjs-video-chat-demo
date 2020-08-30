const socket = io('/');
const myPeer = new Peer(undefined, {
  host: '/',
  port: 3001
});

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

  socket.on('user-connected', userId => {
    console.log('User connected: ' + userId);
  });
});

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}
