require('dotenv').config();
const cors = require('cors');
const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const shortid = require("shortid");
const mongoose = require('mongoose');
const uri = process.env.ATLAS_URI
const bodyParser = require("body-parser");

const { CLIENT_ACTIONS, SERVER_ACTIONS } = require("./utils/constants");

const { addUser, removeUser, getUser, getUsersInRoom, userLeftHandler, getTime } = require("./utils/helpers")

const PORT = process.env.PORT || 5000;

const router = require("./router");
const app = express();
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MogoDB connection established")
})

const usersRouter = require('./routes/users');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/users', usersRouter)

const server = http.createServer(app);
const io = socketio(server);

io.on(SERVER_ACTIONS.CONNECT, (socket) => {

  socket.on(CLIENT_ACTIONS.JOIN, ({ name, room, userId }) => {
    const { user } = addUser({ id: socket.id, name, room, userId })
    const { hours, minutes } = getTime();
    socket.emit(SERVER_ACTIONS.MESSAGE, {
      id: shortid.generate(),
      user: "admin",
      text: `${user.name}, welcome to the room "${room}"!`,
      time: `${hours}:${minutes}`
    })
    socket.broadcast.to(user.room).emit(SERVER_ACTIONS.MESSAGE,
      {
        id: shortid.generate(),
        user: "admin",
        text: `${user.name} has joined!`,
        time: `${hours}:${minutes}`
      })
    socket.join(user.room)
  })

  socket.on(CLIENT_ACTIONS.SEND_MESSAGE, (message, callback) => {
    const { hours, minutes } = getTime();
    const user = getUser(socket.id);
    io.to(user.room).emit(SERVER_ACTIONS.MESSAGE,
      {
        id: shortid.generate(),
        user: user.name,
        text: message,
        time: `${hours}:${minutes}`
      });
    callback()
  })

  socket.on(CLIENT_ACTIONS.DISCONNECT, async () => {
    const user = getUser(socket.id);
    console.log(user)
    await removeUser(user.userId)
    userLeftHandler(socket, io);
  })

  socket.on(CLIENT_ACTIONS.LEAVE, async () => {
    const user = getUser(socket.id);
    console.log(user)
    await removeUser(user.userId)
    userLeftHandler(socket, io);
  })

  socket.on(CLIENT_ACTIONS.DELETE_MESSAGE, (id) => {
    const user = getUser(socket.id)
    io.to(user.room).emit(SERVER_ACTIONS.DELETE_MESSAGE, id);
  })

  socket.on(CLIENT_ACTIONS.GET_USERS, (room) => {
    const users = getUsersInRoom(room)
    io.to(room).emit(SERVER_ACTIONS.GET_USERS, users);
  })
})

app.use(router);

server.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
})