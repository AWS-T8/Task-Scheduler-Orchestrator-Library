import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { userLoginReducer, userRegisterReducer } from "./reducers/userReducers";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const reducer = combineReducers({
  userLogin: userLoginReducer,
  userRegister: userRegisterReducer,
});

const state = localStorage.getItem("token")
  ? {
      userLogin: {
        user: {
          username: localStorage.getItem("username"),
          password: localStorage.getItem("password"),
          token: localStorage.getItem("token"),
        },
        error: null,
        isLoggedIn: true,
        inProgress: false,
      },
    }
  : {
      userLogin: {
        user: {},
        error: null,
        isLoggedIn: false,
        inProgress: false,
      },
    };

// const initialState = {
//   userLogin: {
//     user: {},
//     error: null,
//     isLoggedIn: true,
//     inProgress: false,
//   },
// };
const middleware = [thunk];

const store = createStore(
  reducer,
  state,
  composeEnhancers(applyMiddleware(...middleware))
);

export default store;
