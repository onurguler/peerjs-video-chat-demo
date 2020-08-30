const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server starting on port ${PORT}`);
});
