import {
  USER_LOGIN_FAIL,
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,
  USER_LOGOUT_SUCCESS,
} from "../constants/userConstants";
import env from "react-dotenv";
import notify from "../components/Helpers/Notification";

export const logout = () => async (dispatch) => {
  try {
    dispatch({
      type: USER_LOGOUT_SUCCESS,
    });
    notify("success", "Logout Success!");
  } catch (error) {
    notify("error", "Something Went Wrong!");
    dispatch({
      type: USER_LOGIN_FAIL,
      error: error.message,
    });
  }
};

export const login = (username, password) => async (dispatch) => {
  try {
    dispatch({
      type: USER_LOGIN_REQUEST,
    });

    const url = `${env.BACKEND_URL}/user/login`;
    const data = {
      username: username,
      password: password,
    };

    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
    fetch(url, config).then(async (res) => {
      console.log(res.status);
      if (res.status === 200) {
        const result = await res.json();
        const token = result["accessToken"];
        console.log(token);
        dispatch({
          type: USER_LOGIN_SUCCESS,
          payload: {
            username: username,
            password: password,
            token: token,
          },
        });
        // Have to change the storage
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        notify("success", "Login Success!");
      } else {
        dispatch({
          type: USER_LOGIN_FAIL,
          error: res.status,
        });
        if (res.status === 400) {
          notify("warning", "Invalid Username!");
        } else if (res.status === 403) {
          notify("warning", "Invalid Password!");
        } else {
          notify("error", "Something Went Wrong!");
        }
      }
    });
  } catch (error) {
    notify("error", "Something Went Wrong!");
    dispatch({
      type: USER_LOGIN_FAIL,
      error: error.message,
    });
  }
};

export const register = (username, password) => async (dispatch) => {
  try {
    dispatch({
      type: USER_REGISTER_REQUEST,
    });

    const url = `${env.BACKEND_URL}/user/register`;
    const data = {
      username: username,
      password: password,
    };

    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
    fetch(url, config).then(async (res) => {
      console.log(res.status);
      if (res.status === 201) {
        dispatch({
          type: USER_REGISTER_SUCCESS,
          payload: "Success",
        });
        notify("success", "User Registered!");
      } else {
        dispatch({
          type: USER_REGISTER_FAIL,
        });
        if (res.status === 409) {
          notify("warning", "Username Already Exists!");
        } else {
          notify("error", "Something Went Wrong!");
        }
      }
    });
  } catch (error) {
    notify("error", "Something Went Wrong!");
    dispatch({
      type: USER_REGISTER_FAIL,
    });
  }
};
