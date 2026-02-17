// src/pages/Login/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./LoginPage.css";
import { useAuth } from "../../contexts/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor, preencha e-mail e senha.");
      return;
    }

    setIsLoading(true);
    const userData = await login(email, password);
    setIsLoading(false);

    if (userData) {
      // Redireciona com base no papel do utilizador
      if (userData.is_admin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } else {
      setError("E-mail ou senha inválidos.");
    }
  };

  return (
    <div className="container">
      <div className="left-panel">
        <h2>Olá!</h2>
        <p>
          Ainda não tem uma conta?
          <br />
          Cadastre-se agora para começar!
        </p>
        <Link to="/register">
          <button className="transparent-btn">SIGN UP</button>
        </Link>
      </div>

      <div className="right-panel">
        <form className="form-box" onSubmit={handleLogin}>
          <h2>Entrar</h2>
          <span>Use seu e-mail e senha para acessar:</span>

          <input
            className="inputEmail"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="inputPassword"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="signup-btn" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
