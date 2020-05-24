import axios from "axios"
import { HOST_URL } from "./constants";

export const getUsers = async () => {
  try {
    const { data } = await axios.get(`${HOST_URL}/users/`);
    return data;
  } catch (e) {
    console.error(e);
  }
}

export const addUser = async (payload, setPromiseResolved) => {
  setPromiseResolved(false);
  try { await axios.post(`${HOST_URL}/users/add`, payload); }
  catch (e) { console.error(e); }
  finally { setPromiseResolved(true); }
}
