import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";
import notify from "./Notification";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const userLogin = useSelector((state) => state.userLogin);
  return (
    <Route
      {...rest}
      render={(props) => {
        if (userLogin.isLoggedIn) {
          return <Component {...props} />;
        } else {
          notify("warning", "Please Log In To Continue");
          return (
            <Redirect
              to={{
                pathname: "/signIn",
                state: {
                  from: props.location,
                },
              }}
            />
          );
        }
      }}
    />
  );
};

export default ProtectedRoute;
