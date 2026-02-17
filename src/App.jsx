// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import api from "./services/api.js";

// Importando todas as nossas páginas
import { LoginPage } from "./pages/Login/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage/RegisterPage.jsx";
import { DashboardPage } from "./pages/dashboard/Dashboard.jsx";
import { ComplexCalPage } from "./pages/complexCal/ComplexCal.jsx";
import { SimpleCalPage } from "./pages/simpleCal/SimpleCal.jsx";
import { AdminPage } from "./pages/AdminPage/AdminPage.jsx";
import { HistoryPage } from "./pages/History/HistoryPage.jsx";

// "Porteiro" Padrão: Verifica apenas se o utilizador está logado.
const AuthProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="loading-screen">A carregar aplicação...</div>;
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// "Porteiro" de Admin: Verifica se o utilizador é admin.
const AdminProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-screen">A carregar...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return user?.is_admin ? children : <Navigate to="/dashboard" replace />;
};

// "Porteiro" de Licença: Verifica a licença no backend ANTES de permitir o acesso.
const LicenseProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [hasAccess, setHasAccess] = useState(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      api
        .get("/check-license")
        .then(() => {
          setHasAccess(true);
        })
        .catch(() => {
          setHasAccess(false);
        });
    }
  }, [loading, isAuthenticated]);

  if (loading || hasAccess === null) {
    return <div className="loading-screen">A verificar licença...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return hasAccess ? (
    children
  ) : (
    <Navigate to="/dashboard?license_error=true" replace />
  );
};

// Componente que define as rotas da aplicação
function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rotas Privadas/Protegidas */}
      <Route
        path="/dashboard"
        element={
          <AuthProtectedRoute>
            <DashboardPage />
          </AuthProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminPage />
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/calculo-simples"
        element={
          <AuthProtectedRoute>
            <SimpleCalPage />
          </AuthProtectedRoute>
        }
      />

      {/* A Calculadora Complexa usa o porteiro que verifica a licença no backend */}
      <Route
        path="/calculo-complexo"
        element={
          <LicenseProtectedRoute>
            <ComplexCalPage />
          </LicenseProtectedRoute>
        }
      />

      <Route
        path="/historico"
        element={
          <AuthProtectedRoute>
            <HistoryPage />
          </AuthProtectedRoute>
        }
      />

      {/* Rota catch-all DEVE ser a última */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// Componente principal que envolve tudo
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
