// src/contexts/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api.js";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserFromStorage() {
      const token = localStorage.getItem("@App:token");
      if (token) {
        api.defaults.headers.Authorization = `Bearer ${token}`;
        try {
          const { data } = await api.get("/profile");
          setUser(data.user);
          setLicense(data.license); // Guarda a licença, mesmo que seja nula (expirada)
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    }
    loadUserFromStorage();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/login", { email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem("@App:token", token);
      api.defaults.headers.Authorization = `Bearer ${token}`;

      const profileResponse = await api.get("/profile");
      setUser(profileResponse.data.user);
      setLicense(profileResponse.data.license);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("@App:token");
    api.defaults.headers.Authorization = undefined;
    setUser(null);
    setLicense(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!user, user, license, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
