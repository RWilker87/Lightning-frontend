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
    <div className="login-page">
      <header className="login-nav">
        <Link to="/" className="login-brand" aria-label="Lightning Risk">
          <span className="brand-mark">LR</span>
          <span>Lightning Risk</span>
        </Link>
      </header>

      <main className="login-container">
        <div className="login-box">
          <h2>Bem-vindo de volta</h2>
          <p>Acesse sua conta para continuar.</p>

          <form onSubmit={handleLogin} aria-label="Formulário de login">
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
                placeholder="Sua senha"
                required
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="login-action" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="login-footer">
            Ainda não tem uma conta? <Link to="/register">Solicitar acesso</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
