import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { TextField, Button, Grid } from "@material-ui/core";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { BLUE_COLOR, ERROR_TEXTS, DIMENSIONS } from "../../utils/constants";
import { getUsers, addUser } from "../../utils/helpers";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";
import _ from "lodash";
import shortid from "shortid";
import "./Join.scss";

Storage.prototype.setObj = function (key, obj) {
  return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getObj = function (key) {
  return JSON.parse(this.getItem(key))
}
const { NAME_ERROR_TEXT, ROOM_ERROR_TEXT, NAME_TOO_LONG_ERROR_TEXT, ROOM_TOO_LONG_ERROR_TEXT,
  DUPLICATE_NAME_ERROR_TEXT } = ERROR_TEXTS;
const { MAX_INPUT_LENGTH, LOADER_HEIGHT, LOADER_WIDTH } = DIMENSIONS;

const theme = createMuiTheme({
  palette: {
    primary: {
      main: BLUE_COLOR,
    },
  },
});

const Join = (props) => {
  const { history } = props;
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [nameError, setNameError] = useState(false);
  const [roomError, setRoomError] = useState(false);
  const [duplicateNameError, setDuplicateNameError] = useState(false);
  const [users, setUsers] = useState();
  const [promiseResolved, setPromiseResolved] = useState(true);
  const [nameInputTooLongError, setNameInputTooLongError] = useState(false);
  const [roomInputTooLongError, setRoomInputTooLongError] = useState(false);

  useEffect(() => {
    (async function () {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers)
    })()
  }, [])

  const getNameErrorText = () => {
    if (duplicateNameError) return DUPLICATE_NAME_ERROR_TEXT;
    if (nameInputTooLongError) return NAME_TOO_LONG_ERROR_TEXT;
    return NAME_ERROR_TEXT;
  }

  const getRoomErrorText = () => {
    if (roomInputTooLongError) return ROOM_TOO_LONG_ERROR_TEXT;
    return ROOM_ERROR_TEXT;
  }

  const getNameError = () => {
    if (duplicateNameError) return duplicateNameError;
    if (nameInputTooLongError) return nameInputTooLongError;
    return nameError;
  }

  const getRoomError = () => {
    if (roomInputTooLongError) return roomInputTooLongError;
    return roomError;
  }

  const checkUserInLocalStorage = () => {
    let userInLocalStorage = false;
    Object.keys(localStorage).forEach((key) => {
      const { storageName, storageRoom } = localStorage.getObj(key);
      if (name === storageName && room === storageRoom) userInLocalStorage = true;
    });
    return userInLocalStorage;
  }

  const redirect = async () => {
    const userId = shortid.generate();
    const userInDatabase = checkUserInDatabase();
    const userInLocalStorage = checkUserInLocalStorage();
    if (name === ""
      || room === ""
      || userInDatabase
      || userInLocalStorage
      || roomInputTooLongError
      || nameInputTooLongError) return;
    await addUser({ name, room, userId }, setPromiseResolved);
    const record = { storageName: name, storageRoom: room };
    localStorage.setObj(String(userId), record);
    history.push(`/chat?name=${name}&room=${room}&userId=${userId}`);
  }

  const getAssociatedUsers = () => {
    if (users && users.length > 0) {
      return users.map((user) => {
        return { name: user.name, room: user.room }
      })
    }
  }

  const checkUserInDatabase = () => {
    const newUserObj = { name, room };
    const allUsers = getAssociatedUsers()
    let containsDuplicate = false;
    if (allUsers) allUsers.forEach((user) => { if (_.isEqual(user, newUserObj)) containsDuplicate = true; })
    return containsDuplicate;
  }

  const validateField = (fieldValue, setError) => {
    fieldValue === "" && setError(true);
    fieldValue !== "" && setError(false);
  }

  const validateDuplicate = () => {
    const userInDatabase = checkUserInDatabase();
    const userInLocalStorage = checkUserInLocalStorage();
    (userInDatabase || userInLocalStorage) && setDuplicateNameError(true)
  }

  const validateForm = () => {
    validateField(name, setNameError);
    validateField(room, setRoomError);
    validateDuplicate();
  }

  const handleRoomInput = (e) => {
    const { value } = e.target;
    setRoom(value)
    if (value !== "") setRoomError(false)
    if (value.length > MAX_INPUT_LENGTH) setRoomInputTooLongError(true);
    else setRoomInputTooLongError(false);
  }

  const handleNameInput = (e) => {
    const { value } = e.target;
    setName(value)
    if (duplicateNameError) setDuplicateNameError(false);
    if (value !== "") setNameError(false)
    if (value.length > MAX_INPUT_LENGTH) setNameInputTooLongError(true);
    else setNameInputTooLongError(false);
  }

  const handleEnterPress = (e) => {
    if (e.key === "Enter") validateForm();
    const userInDatabase = checkUserInDatabase();
    const userInLocalStorage = checkUserInLocalStorage();
    if (e.key === "Enter" && name.trim() !== "" && room.trim() !== "" && !userInDatabase && !userInLocalStorage) redirect()
  }

  const handleClick = (e) => {
    validateForm(e)
    redirect()
  }

  const renderTextField = (error, errorText, label, handleInput) => (
    <Grid item>
      <TextField
        onKeyPress={e => handleEnterPress(e)}
        onChange={(e) => handleInput(e)}
        className="inputWidth"
        variant="outlined"
        size="small"
        error={error}
        helperText={error && errorText}
        label={label}
        autoFocus={label === "Name"} />
    </Grid>
  )

  const renderButton = () => (
    <ThemeProvider theme={theme}>
      <Button
        onClick={e => handleClick(e)}
        className="joinButton"
        variant="contained"
        color="primary">
        <span>Sign in</span>
      </Button>
    </ThemeProvider>
  )

  const renderLoader = () => {
    if (!promiseResolved) {
      return (
        <Loader
          type="Puff"
          color={BLUE_COLOR}
          height={LOADER_HEIGHT}
          width={LOADER_WIDTH}
        />
      )
    }
  }

  const renderForm = () => {
    if (promiseResolved) {
      return (
        <>
          <form noValidate autoComplete="off">
            <Grid className="bgWhite" spacing={1} container direction="column">
              {renderTextField(getNameError(), getNameErrorText(), "Name", handleNameInput)}
              {renderTextField(getRoomError(), getRoomErrorText(), "Room", handleRoomInput)}
            </Grid>
          </form>
          {renderButton()}
        </>
      )
    }
  }

  return (
    <div>
      <Grid className="join fullScreen" container direction="column" justify="center" alignItems="center">
        {promiseResolved && <h1>Join</h1>}
        {renderLoader()}
        {renderForm()}
      </Grid>
    </div>
  );
}

Join.propTypes = {
  history: PropTypes.object.isRequired
};

export default Join;