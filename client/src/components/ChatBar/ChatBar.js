import React, { useState, useEffect, useRef, memo } from "react";
import PropTypes from 'prop-types';
import "./ChatBar.scss"
import { AppBar, Toolbar, Typography, Box, Card, Button, Tooltip, Avatar, Chip, CardContent } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import Zoom from '@material-ui/core/Zoom';
import HighlightOffOutlinedIcon from "@material-ui/icons/HighlightOffOutlined"
import SpringModal from "../SpringModal/SpringModal";
import { CLIENT_ACTIONS, SERVER_ACTIONS, BLUE_COLOR } from "../../utils/constants";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  customTooltip: {
    backgroundColor: 'rgba(210,0,0,0.95)',
    position: "relative",
    top: "10px"
  },
  customUsersTooltip: {
    backgroundColor: 'rgba(124,252,0,0.95)',
    position: "relative",
    top: "10px"
  }
}));

const theme = createMuiTheme({
  palette: {
    primary: {
      main: BLUE_COLOR,
    },
  },
});

const ChatBar = ({ room, history, socket, userId }) => {
  const [showModal, setShowLeaveModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [users, setUsers] = useState([]);
  const timerRef = useRef();
  const classes = useStyles();
  const MODAL_MESSAGE = "Are you sure, you want to leave the room?";
  const USERS_TEXT = "Active users";
  const WAIT_TIME = 10;

  window.onbeforeunload = () => {
    localStorage.removeItem(String(userId));
  };

  useEffect(() => {
    if (redirect) history.push("/");
  }, [redirect, history])

  useEffect(() => {
    if (socket) {
      const usersToAdd = [];
      socket.on(SERVER_ACTIONS.GET_USERS, (usersFromSocket) => {
        usersFromSocket.forEach(({ name }) => {
          if (usersToAdd.indexOf(name) === -1) {
            usersToAdd.push(name)
          }
        })
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setUsers(usersToAdd), WAIT_TIME)
      })
    }
  })

  useEffect(() => {
    if (socket) {
      let usersUpdated = [...users];
      socket.on(SERVER_ACTIONS.LEAVE, (usernameFromSocket) => {
        if (userId) {
          usersUpdated = users.filter(user => user !== usernameFromSocket)
        }
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setUsers(usersUpdated), WAIT_TIME)
      })
    }
  })

  const leaveRoom = () => {
    localStorage.removeItem(String(userId))
    socket.emit(CLIENT_ACTIONS.LEAVE);
    socket.off();
    setRedirect(true)
  }

  const renderCard = () => (
    <Card className="cardModal">
      <HighlightOffOutlinedIcon onClick={() => setShowLeaveModal(false)} className="leaveIconModal" />
      <CardContent className="cardContent">
        <Typography align="center">
          {MODAL_MESSAGE}
        </Typography>
        <Box className="buttonContainer" display="flex" justifyContent="center">
          <Button onClick={leaveRoom} className="leaveButton space-right" variant="contained" >Yes</Button>
          <Button onClick={() => setShowLeaveModal(false)} className="space-left" variant="contained" >No</Button>
        </Box>
      </CardContent>
    </Card>
  )

  const renderChips = () => {
    return users.map(user => (
      <ThemeProvider key={user} theme={theme}>
        <Chip
          className="userChip"
          variant="outlined"
          color="primary"
          avatar={<Avatar>{user.slice(0, 1).toUpperCase()}</Avatar>}
          label={user}
        />
      </ThemeProvider>
    ))
  }

  const renderUsersCard = () => (
    <Card className="cardModal">
      <HighlightOffOutlinedIcon onClick={() => setShowUsersModal(false)} className="leaveIconModal" />
      <CardContent className="cardContent">
        <Typography align="center">
          {USERS_TEXT}
        </Typography>
        <Box className="usersCard">
          {renderChips()}
        </Box>
      </CardContent>
    </Card>
  )

  const renderUsersModal = () => (<SpringModal showModal={showUsersModal} renderCard={renderUsersCard} />)

  const renderModal = () => (<SpringModal showModal={showModal} renderCard={renderCard} />);

  const renderLeaveIcon = () => (
    <Tooltip
      classes={{ tooltip: classes.customTooltip }}
      TransitionComponent={Zoom}
      title="Leave room"
      placement="top">
      <HighlightOffOutlinedIcon onClick={() => setShowLeaveModal(true)} className="leaveIcon" />
    </Tooltip>
  )

  const renderRoomInfo = () => (
    <Tooltip
      TransitionComponent={Zoom}
      title="Show active users"
      placement="top"
      classes={{ tooltip: classes.customUsersTooltip }}>
      <Box display="flex">
        <div className="activeDotContainer">
          <div className="activeDot" />
        </div>
        <Typography edge="right" variant="h6">
          <span>{room}</span>
        </Typography>
      </Box>
    </Tooltip>
  )

  const renderAppBar = () => (
    <AppBar className="appBar" position="static">
      <Toolbar>
        <Box width="100%" display="flex" justifyContent="space-between">
          <div className="roomName" onClick={() => setShowUsersModal(true)}>
            {renderRoomInfo()}
          </div>
          {renderLeaveIcon()}
        </Box>
      </Toolbar>
    </AppBar>
  )

  return (
    <div className="chatBar">
      {renderUsersModal()}
      {renderModal()}
      {renderAppBar()}
    </div>
  );
}

ChatBar.propTypes = {
  history: PropTypes.object.isRequired,
  room: PropTypes.string.isRequired,
  socket: PropTypes.object,
  userId: PropTypes.string.isRequired
}

export default memo(ChatBar);