import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import "./RegisterPage.css";

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/users", { name, email, password });

      setSuccess("Cadastro realizado com sucesso! Redirecionando...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setIsLoading(false);
      setError(
        err.response?.data?.error || "Ocorreu um erro ao realizar o cadastro."
      );
    }
  };

  return (
    <div className="login-page">
      <header className="login-nav">
        <Link to="/" className="login-brand" aria-label="Lightning Risk">
          <span className="brand-mark">LR</span>
          <span>Lightning Risk</span>
        </Link>
      </header>

      <main className="login-container">
        <div className="login-box">
          <h2>Criar Conta</h2>
          <p>Preencha os dados abaixo para solicitar acesso completo.</p>

          <form onSubmit={handleRegister} aria-label="Formulário de cadastro">
            <div className="login-field">
              <label htmlFor="name">Nome completo</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha"
                required
              />
            </div>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <button type="submit" className="login-action" disabled={isLoading || success}>
              {isLoading ? "Processando..." : "Cadastrar"}
            </button>
          </form>

          <div className="login-footer">
            Já tem uma conta? <Link to="/login">Faça login</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
