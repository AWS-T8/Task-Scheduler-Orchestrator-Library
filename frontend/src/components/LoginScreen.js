import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, register } from "../actions/userActions";
import Loader from "react-loader-spinner";
import { Redirect } from "react-router-dom";
import notify from "./Helpers/Notification";

const LoginScreen = (history) => {
  const dispatch = useDispatch();
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");

  const userLogin = useSelector((state) => state.userLogin);

  if (userLogin.isLoggedIn) {
    return <Redirect to="/" />;
  }

  const onRegisterHandler = (e) => {
    e.preventDefault();
    if (username && password) {
      dispatch(register(username, password));
    } else {
      notify("warning", "Please Fill All Fields");
    }
  };

  const onLoginHandler = (e) => {
    e.preventDefault();
    if (username && password) {
      dispatch(login(username, password));
    } else {
      notify("warning", "Please Fill All Fields");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <svg
            className="mx-auto h-12 w-auto"
            xmlns="http://www.w3.org/2000/svg"
            width="35"
            height="35"
            viewBox="0 0 24 24"
          >
            <path d="M17 3v-2c0-.552.447-1 1-1s1 .448 1 1v2c0 .552-.447 1-1 1s-1-.448-1-1zm-12 1c.553 0 1-.448 1-1v-2c0-.552-.447-1-1-1-.553 0-1 .448-1 1v2c0 .552.447 1 1 1zm13 13v-3h-1v4h3v-1h-2zm-5 .5c0 2.481 2.019 4.5 4.5 4.5s4.5-2.019 4.5-4.5-2.019-4.5-4.5-4.5-4.5 2.019-4.5 4.5zm11 0c0 3.59-2.91 6.5-6.5 6.5s-6.5-2.91-6.5-6.5 2.91-6.5 6.5-6.5 6.5 2.91 6.5 6.5zm-14.237 3.5h-7.763v-13h19v1.763c.727.33 1.399.757 2 1.268v-9.031h-3v1c0 1.316-1.278 2.339-2.658 1.894-.831-.268-1.342-1.111-1.342-1.984v-.91h-9v1c0 1.316-1.278 2.339-2.658 1.894-.831-.268-1.342-1.111-1.342-1.984v-.91h-3v21h11.031c-.511-.601-.938-1.273-1.268-2z" />
          </svg>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600"></p>
        </div>
        <form>
          <div className="mt-4">
            <div className="flex flex-col question">
              <label className="mb-2 mt-2 py-1 px-1 w-full font-semibold text-lg">
                Username
              </label>
              <input
                type="textarea"
                name="username_name"
                id="username_name"
                className="w-full py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                placeholder="Enter your username"
                required
                value={username}
                onChange={(e) => {
                  setusername(e.target.value);
                }}
              ></input>
              <label className="mb-2 mt-2 py-1 px-1 w-full font-semibold text-500 text-lg">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                className="w-full py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setpassword(e.target.value);
                }}
                required
              ></input>
            </div>
          </div>
          <div className="flex justify-end mt-10 pt-8 border-t-4">
            {userLogin.inProgress ? (
              <div className="mr-4">
                <Loader type="Puff" color="#00BFFF" height={50} width={50} />
              </div>
            ) : null}
            <button
              disabled={userLogin.inProgress}
              onClick={onLoginHandler}
              className="disabled:opacity-50 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
            >
              Login
            </button>
            <button
              disabled={userLogin.inProgress}
              onClick={onRegisterHandler}
              className="disabled:opacity-50 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
