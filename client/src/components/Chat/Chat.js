import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import PropTypes from 'prop-types';
import queryString from "query-string";
import io from "socket.io-client";
import ChatBar from "../ChatBar/ChatBar";
import { TextField, Grid, Paper } from "@material-ui/core";
import "./Chat.scss";
import Message from "../Message/Message";
import { CLIENT_ACTIONS, SERVER_ACTIONS } from "../../utils/constants"

let socket;

const Chat = (props) => {
  const { location, history } = props;
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [userId, setUserId] = useState("");
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState([])
  const messagesEndRef = useRef();
  const timerRef = useRef();
  const ENDPOINT = "https://my-chat-app-mern.herokuapp.com/";
  const WAIT_TIME = 10;
  const MESSAGE_DELETED_TEXT = "This message was deleted";
  const scrollToBottom = () => { messagesEndRef.current.scrollIntoView({ behavior: "smooth" }) };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const { name, room, userId } = queryString.parse(location.search);
    setName(name);
    setRoom(room);
    setUserId(userId);
    socket = io(ENDPOINT)
    socket.emit(CLIENT_ACTIONS.JOIN, { name, room, userId });
    socket.emit(CLIENT_ACTIONS.GET_USERS, room)
    return () => {
      socket.emit(CLIENT_ACTIONS.DISCONNECT, {}, () => history.push("/", { error: false }));
      socket.off();
    }
  }, [ENDPOINT, location.search, history]);

  const delayedSetMessages = (newMessages) => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setMessages(newMessages);
    }, WAIT_TIME)
  }

  const bulkMessages = useCallback((socketMessage, bulkingArray) => {
    if (socketMessage) {
      bulkingArray.push(socketMessage)
      delayedSetMessages([...messages, ...bulkingArray])
    }
  }, [messages])

  useEffect(() => {
    const bulkingArray = [];
    socket.on(SERVER_ACTIONS.MESSAGE, (message) => {
      bulkMessages(message, bulkingArray)
    })
  }, [messages, bulkMessages])

  useEffect(() => {
    socket.on(SERVER_ACTIONS.DELETE_MESSAGE, (id) => {
      if (id) {
        const newMessages = messages.map(message => {
          if (message.id === id) {
            message.text = MESSAGE_DELETED_TEXT;
            return { ...message, deleted: true };
          }
          return message;
        })
        delayedSetMessages(newMessages);
      }
    })
  }, [messages])

  const sendMessage = (e) => {
    e.preventDefault();
    socket.emit(CLIENT_ACTIONS.SEND_MESSAGE, message, () => setMessage(""))
  }

  const handleEnterPress = (e) => {
    if (e.key === "Enter" && message.trim() !== "") {
      setMessage("")
      sendMessage(e)
    }
  }

  const renderTextField = () => (
    <TextField
      onChange={e => setMessage(e.target.value)}
      className="input"
      value={message}
      onKeyPress={e => handleEnterPress(e)}
      variant="outlined"
      size="small" />
  );

  const memoizedMessages = useMemo(() => (
    messages.map(message => {
      return (<Message key={message.id} socket={socket} message={message} name={name} text={message.text} />)
    })
  ), [messages, name])

  const renderMessages = () => {
    return (
      <div className="scrollContainer messagesContainer" >
        {memoizedMessages}
        <div ref={messagesEndRef} />
      </div >
    )
  };

  return (
    <Grid className="chat fullScreen" container direction="column" justify="center" alignItems="center">
      <Paper className="paperStyles" elevation={5}>
        <ChatBar userId={userId} room={room} history={history} socket={socket} />
        {renderMessages()}
        {renderTextField()}
      </Paper>
    </Grid>
  );
}

Chat.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.object
}

export default Chat;