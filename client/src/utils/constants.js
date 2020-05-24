export const HOST_URL = "https://my-chat-app-mern.herokuapp.com/";

export const BLUE_COLOR = "#0033FF";

export const SERVER_ACTIONS = {
  DELETE_MESSAGE: "delete",
  MESSAGE: "message",
  GET_USERS: "show",
  LEAVE: "leave",
}

export const CLIENT_ACTIONS = {
  DELETE_MESSAGE: "deleteMessage",
  DISCONNECT: "disconnect",
  JOIN: "join",
  LEAVE: "leave",
  SEND_MESSAGE: "sendMessage",
  GET_USERS: "showUsers",
}

export const ERROR_TEXTS = {
  NAME_ERROR_TEXT: 'Please fill the "Name" field',
  ROOM_ERROR_TEXT: 'Please fill the "Room" field',
  NAME_TOO_LONG_ERROR_TEXT: "Please type shorter name",
  ROOM_TOO_LONG_ERROR_TEXT: "Please type shorter room name",
  DUPLICATE_NAME_ERROR_TEXT: 'The given "name" is already taken'
}

export const DIMENSIONS = {
  MAX_INPUT_LENGTH: 25,
  LOADER_HEIGHT: 100,
  LOADER_WIDTH: 100
}


