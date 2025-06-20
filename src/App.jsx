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

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">A carregar...</div>;
  // Redireciona para o dashboard principal se o utilizador não for admin
  return user?.is_admin ? children : <Navigate to="/dashboard" replace />;
};

// "Porteiro" de Licença: Verifica a licença no backend ANTES de permitir o acesso.
const LicenseProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [hasAccess, setHasAccess] = useState(null); // null: a verificar, true: sim, false: não

  useEffect(() => {
    // Só executa a verificação se o utilizador estiver autenticado e o carregamento inicial concluído.
    if (!loading && isAuthenticated) {
      api
        .get("/check-license")
        .then(() => {
          // Se o backend responder com sucesso (200 OK), o acesso é permitido.
          setHasAccess(true);
        })
        .catch(() => {
          // Se o backend responder com um erro (403 Forbidden), o acesso é negado.
          setHasAccess(false);
        });
    }
  }, [loading, isAuthenticated]);

  if (loading || hasAccess === null) {
    return <div className="loading-screen">A verificar licença...</div>;
  }

  // Se o acesso for negado, redireciona para o dashboard com uma mensagem de erro na URL.
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
        path="/admin"
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

      {/* A Calculadora Complexa usa o novo porteiro que verifica a licença no backend */}
      <Route
        path="/calculo-complexo"
        element={
          <LicenseProtectedRoute>
            <ComplexCalPage />
          </LicenseProtectedRoute>
        }
      />

      {/* Rota para qualquer caminho não encontrado */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/historico"
        element={
          <AuthProtectedRoute>
            <HistoryPage />
          </AuthProtectedRoute>
        }
      />
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
