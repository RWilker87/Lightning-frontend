// src/contexts/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import api from "../services/api.js";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [licenseExpired, setLicenseExpired] = useState(false);

  // Carrega perfil e licença do backend
  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await api.get("/profile");
      setUser(data.user);
      setLicense(data.license);
      setLicenseExpired(!data.license?.active);
      return data;
    } catch {
      logout();
      return null;
    }
  }, []);

  // Ao iniciar, verifica se há token salvo e carrega os dados do utilizador
  useEffect(() => {
    async function loadUserFromStorage() {
      const token = localStorage.getItem("@App:token");
      if (token) {
        await refreshProfile();
      }
      setLoading(false);
    }
    loadUserFromStorage();
  }, [refreshProfile]);

  // Escuta evento de licença expirada disparado pelo interceptor do Axios
  useEffect(() => {
    const handleLicenseExpired = () => setLicenseExpired(true);
    window.addEventListener("license-expired", handleLicenseExpired);
    return () => window.removeEventListener("license-expired", handleLicenseExpired);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/login", { email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem("@App:token", token);

      // Busca perfil completo (com licença) após login
      const profileData = await refreshProfile();
      return profileData?.user || userData;
    } catch {
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("@App:token");
    setUser(null);
    setLicense(null);
    setLicenseExpired(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        license,
        licenseExpired,
        login,
        logout,
        loading,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
