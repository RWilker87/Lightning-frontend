// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import "../RegisterPage/RegisterPage.css";

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    try {
      await api.post("/users", { name, email, password });

      setSuccess(
        "Cadastro realizado com sucesso! Redirecionando para o login..."
      );

      // Redireciona para a página de login após 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.error || "Ocorreu um erro ao realizar o cadastro."
      );
    }
  };

  return (
    <form onSubmit={handleRegister} className="register-container">
      <h2>Criar Conta</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <input
        type="text"
        placeholder="Seu nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input"
      />
      <input
        type="email"
        placeholder="Seu e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input"
      />
      <input
        type="password"
        placeholder="Sua senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input"
      />
      <button type="submit" className="register-button">
        Cadastrar
      </button>
      <div className="login-link">
        <Link to="/login">Já tem uma conta? Faça login</Link>
      </div>
    </form>
  );
}
