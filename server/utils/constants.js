const SERVER_ACTIONS = {
  CONNECT: "connect",
  DELETE_MESSAGE: "delete",
  GET_USERS: "show",
  LEAVE: "leave",
  MESSAGE: "message",
}

const CLIENT_ACTIONS = {
  DELETE_MESSAGE: "deleteMessage",
  DISCONNECT: "disconnect",
  GET_USERS: "showUsers",
  JOIN: "join",
  LEAVE: "leave",
  SEND_MESSAGE: "sendMessage",
}

module.exports = { CLIENT_ACTIONS, SERVER_ACTIONS };