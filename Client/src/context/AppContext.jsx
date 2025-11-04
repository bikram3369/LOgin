import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);

  axios.defaults.withCredentials = true;

  const getAuthState = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/is-auth`, {});
      if (data.success) {
        setIsLoggedin(true);
        console.log("User is authenticated", data);
        getUserData();
      } else {
        setIsLoggedin(false);
      }
    } catch (error) {
      console.error("Error fetching auth state:", error);
      setIsLoggedin(false);
    }
  };

  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`);
      if (data.success) {
        setUserData(data.userData);
        console.log("User Data fetched:", data.userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    getAuthState();

    // 👇 Recheck after redirect (helps with Google login)
    window.addEventListener("focus", getAuthState);
    return () => window.removeEventListener("focus", getAuthState);
  }, []);

  useEffect(() => {
    if (userData) console.log("User Data updated:", userData);
  }, [userData]);

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
