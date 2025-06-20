// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import "../Login/LoginPage.css";
import { useAuth } from "../../contexts/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    setError("");

    if (!email || !password) {
      setError("Por favor, preencha e-mail e senha.");
      return;
    }

    try {
      const response = await api.post("/login", { email, password });
      const { token, user } = response.data;

      localStorage.setItem("@App:token", token);
      localStorage.setItem("@App:user", JSON.stringify(user));
      api.defaults.headers.authorization = `Bearer ${token}`;
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao fazer login.");
    }
    if (success) {
      navigate("/dashboard");
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

          <button type="submit" className="signup-btn">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
