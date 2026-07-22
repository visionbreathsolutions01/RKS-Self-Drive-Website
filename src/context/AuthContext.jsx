// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  getCurrentSessionUser, 
  loginUser, 
  registerUser, 
  logoutUser, 
  getNotificationsForUser,
  markNotificationsAsRead
} from "../services/db";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const activeUser = getCurrentSessionUser();
    if (activeUser) {
      setUser(activeUser);
      loadNotifications(activeUser.uid);
    } else {
      setUser(null);
      setNotifications([]);
      setUnreadCount(0);
    }
    setLoading(false);
  }, []);

  const loadNotifications = async (uid) => {
    try {
      const list = await getNotificationsForUser(uid);
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.read).length);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const userData = await loginUser(email, password);
      setUser(userData);
      loadNotifications(userData.uid);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email, password, name, phone) => {
    setLoading(true);
    try {
      const userData = await registerUser(email, password, name, phone);
      setUser(userData);
      loadNotifications(userData.uid);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const refreshNotifications = async () => {
    if (user) {
      await loadNotifications(user.uid);
    }
  };

  const clearUnreadCount = async () => {
    if (user) {
      await markNotificationsAsRead(user.uid);
      await loadNotifications(user.uid);
    }
  };

  const value = {
    user,
    loading,
    notifications,
    unreadCount,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshNotifications,
    clearUnreadCount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
