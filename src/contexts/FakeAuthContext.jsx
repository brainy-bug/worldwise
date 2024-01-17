/* eslint-disable react/prop-types */
import { useContext, createContext, useReducer } from "react";

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "auth/login":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };

    case "auth/logout":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };

    default:
      return state;
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const FAKE_USER = {
    name: "Jack",
    email: "jack@example.com",
    password: "qwerty",
    avatar: "https://i.pravatar.cc/100?u=zz",
  };

  const login = (email, password) => {

    if (email === FAKE_USER.email && password === FAKE_USER.password) {
      dispatch({
        type: "auth/login",
        payload: FAKE_USER,
      });
    }
  };

  const logout = () => {
    dispatch({
      type: "auth/logout",
    });
  };

  const values = {
    ...state,
    login,
    logout,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export { AuthProvider, useAuth };
