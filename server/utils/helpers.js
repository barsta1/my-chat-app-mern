const { SERVER_ACTIONS } = require("./constants");
const axios = require("axios");
const shortid = require("shortid");
const users = [];
const HOST_URL = "https://my-chat-app-mern.herokuapp.com/";

const getTime = () => {
  const date = new Date();
  const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
  const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  return {
    hours,
    minutes
  }
}

const addUser = ({ id, name, room, userId }) => {
  nameToCheck = name.trim().toLowerCase();
  roomToCheck = room.trim().toLowerCase();
  const existingUser = users.find((user) => user.room === roomToCheck && user.name === nameToCheck);

  if (existingUser) return { error: "Username is taken" }
  const user = { id, name, room, userId };
  users.push(user)
  return { user };
}

const deleteUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
}

const getUser = (id) => {
  return users.find(user => user.id === id)
};

const getUsersInRoom = (room) => users.filter(user => user.room === room);

const userLeftHandler = (socket, io) => {
  const user = deleteUser(socket.id);
  console.log(user);
  if (user) {
    io.to(user.room).emit(SERVER_ACTIONS.MESSAGE, { user: "admin", text: `${user.name} has left`, userLeft: true, id: shortid.generate() });
    io.to(user.room).emit(SERVER_ACTIONS.LEAVE, user.name);
  }
  delete (socket.id)
}

const removeUser = userId => {
  try { axios.delete(`${HOST_URL}/users/${userId}`); }
  catch (e) { console.error(e) }
}

module.exports = { addUser, removeUser, getUser, getUsersInRoom, userLeftHandler, getTime };