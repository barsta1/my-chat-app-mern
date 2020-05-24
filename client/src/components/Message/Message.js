import React, { useState, useEffect, memo } from "react";
import PropTypes from 'prop-types';
import ReactEmoji from "react-emoji";
import "./Message.scss";
import { CLIENT_ACTIONS } from "../../utils/constants"
import DeleteIcon from "@material-ui/icons/Delete";
import HighlightOffOutlinedIcon from "@material-ui/icons/HighlightOffOutlined"
import { Typography, Box, Card, Button, CardContent } from "@material-ui/core";
import { useSpring, animated } from "react-spring";
import cx from "classnames";
import SpringModal from "../SpringModal/SpringModal";

const CONFIRMATION_MESSAGE = "Are you sure you wish to delete this message?"
/* Time left before the user won"t be able to delete the message anymore */
const MESSAGE_DISABLE_TIME = 600000;

const Message = (props) => {
  const [iconVisible, setIconVisible] = useState(false);
  const [iconDisabled, setIconDisabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { socket, name, text } = props;
  const { user, id, time, deleted } = props.message;

  const animateUserMessage = useSpring({
    from: { opacity: 0, transform: "translateX(20px)" },
    to: { opacity: 1, transform: "translateX(0px)" },
    config: { tension: 350, friction: 34 }
  })

  const animateOtherMessage = useSpring({
    from: { opacity: 0, transform: "translateX(-20px)" },
    opacity: 1, transform: "translateY(0)"
  })

  useEffect(() => {
    setTimeout(() => {
      setIconDisabled(true)
      setIconVisible(false)
    }, MESSAGE_DISABLE_TIME)
  }, [])

  const getClassNames = (user) => {
    return {
      textClass: cx("message", user === name ? "userMessage" : "otherMessage", { "deleted": deleted }),
      containerClass: cx("messageContainer",
        user === name ? "alignEnd" : "alignStart",
        user === name ? "containerEnd" : "containerStart",
        {
          "disabled": user === name && iconDisabled,
          "active": (user === name && !deleted) && !iconDisabled,
          "clicked": iconVisible && !iconDisabled && user === name
        }),
      userNameClass: `${user !== name && "userName"}`
    }
  }

  const renderCard = () => (
    <Card className="cardModal">
      <HighlightOffOutlinedIcon onClick={() => setShowModal(false)} className="leaveIconModal" />
      <CardContent className="cardContent">
        <Typography align="center">{CONFIRMATION_MESSAGE}</Typography>
        <Box className="buttonContainer" display="flex" justify-content="center">
          <Button
            onClick={deleteMessage}
            className="leaveButton space-right"
            variant="contained"
            startIcon={<DeleteIcon />}>
            <span>Delete it!</span>
          </Button>
          <Button onClick={() => setShowModal(false)} className="space-left" variant="contained" >
            <span>No, don't do this!</span>
          </Button>
        </Box>
      </CardContent>
    </Card>
  )

  const renderModal = () => (<SpringModal showModal={showModal} renderCard={renderCard} />)

  const deleteMessage = () => {
    setShowModal(false)
    socket.emit(CLIENT_ACTIONS.DELETE_MESSAGE, id)
  }

  const renderDeleteIcon = () => {
    if (user === name) {
      const classNames = cx("deleteIcon", iconVisible && !iconDisabled ? "iconVisible" : "iconHidden");
      return <DeleteIcon onClick={() => setShowModal(true)} className={classNames} />
    }
  }

  const renderMessage = () => {
    const { textClass, userNameClass, containerClass } = getClassNames(user);
    return (
      <animated.div className="Message" style={user === name ? animateUserMessage : animateOtherMessage}>
        {renderModal()}
        <Box className={containerClass}>
          {user === name && <span className="timeSpan">{time}</span>}
          <span onClick={() => !deleted && setIconVisible(!iconVisible)} className={textClass}>
            {ReactEmoji.emojify(text)}
            {renderDeleteIcon()}
          </span>
          {user !== name && <span className="timeSpan">{time}</span>}
        </Box>
        <span className={userNameClass}>{user !== name && user}</span>
      </animated.div>
    )
  }

  return (renderMessage());
}

Message.propTypes = {
  message: PropTypes.shape({
    deleted: PropTypes.bool,
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    user: PropTypes.string.isRequired,
  }),
  name: PropTypes.string.isRequired,
  socket: PropTypes.object,
  text: PropTypes.string.isRequired
};

export default memo(Message);