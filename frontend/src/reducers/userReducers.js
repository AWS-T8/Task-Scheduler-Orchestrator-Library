import {
  USER_LOGIN_FAIL,
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT_FAIL,
  USER_LOGOUT_SUCCESS,
  USER_REGISTER_FAIL,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
} from "../constants/userConstants";

// const initialLoginState = {
//   user: {},
//   error: null,
//   isLoggedIn: false,
//   inProgress: false,
// };

export const userLoginReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
      return {
        user: {},
        inProgress: true,
        isLoggedIn: false,
        error: null,
      };
    case USER_LOGIN_SUCCESS:
      return {
        user: action.payload,
        isLoggedIn: true,
        inProgress: false,
        error: null,
      };
    case USER_LOGIN_FAIL:
      return {
        user: {},
        isLoggedIn: false,
        inProgress: false,
        error: action.error,
      };
    case USER_LOGOUT_SUCCESS:
      return {
        ...state,
        user: {},
        isLoggedIn: false,
        inProgress: false,
        error: null,
      };
    case USER_LOGOUT_FAIL:
      return {
        ...state,
        isLoggedIn: true,
        inProgress: true,
        error: action.error,
      };
    default:
      return state;
  }
};

export const userRegisterReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_REGISTER_REQUEST:
      return {
        isLoggedIn: false,
        inProgress: true,
        error: null,
      };
    case USER_REGISTER_SUCCESS:
      return {
        ...state,
        isLoggedIn: false,
        inProgress: false,
        error: null,
      };
    case USER_REGISTER_FAIL:
      return {
        ...state,
        isLoggedIn: false,
        inProgress: false,
        error: action.error,
      };
    default:
      return state;
  }
};
