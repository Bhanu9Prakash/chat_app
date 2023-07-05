// imports required modules
require('dotenv').config();
const express = require('express');
const http = require('http');
const Path = require('path');

// creates an instance of express
const app = express();
const {Server} = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(Path.join(__dirname, 'public')));

// handle routes
app.get('/', (req, res) => {
  res.render('index');
});

app.post("/chat", (req, res) => {
  const username = req.body.username;
  const room = req.body.room;
  res.render("chat", { username: username, room: room });
});

io.on('connection', (socket) => {
  let username_connection, room_connection;
  socket.on("join room", ({username, room}) => {
    socket.join(room);
    username_connection = username;
    room_connection = room;
    // emit event to other users in the room
    socket.broadcast.to(room).emit("message", {message: `${username} has joined the chat`, username: "Server"});
  });

  socket.on("chat message", ({message, username, room}) => {
    io.to(room).emit("message", {message: message, username: username});
  });

  socket.on("disconnect", () => {
    socket.to(room_connection).emit("message", {message: `${username_connection} has left the chat`, username: "Server"});
  }); 

});


// sets the port to listen on
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});



