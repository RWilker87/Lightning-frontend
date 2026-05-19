import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { format } from "date-fns";
import "./Dashboard.css";

const IconComplex = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    <path d="M12 12h.01"></path>
    <path d="M12 17h.01"></path>
    <path d="m17 12-.01.01"></path>
    <path d="M7 12h.01"></path>
    <path d="m7 17-.01.01"></path>
  </svg>
);

const IconSimple = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m13 2-3 14-3-7-7 3 14-3-7-7z"></path>
  </svg>
);

const IconHistory = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

function LicenseStatusCard({ license }) {
  if (!license) {
    return (
      <div className="license-card license-inactive">
        <div className="license-icon">⏳</div>
        <div className="license-info">
          <h3>Licença inativa</h3>
          <p>Sua conta foi criada, mas a licença ainda não foi ativada. Entre em contato com o administrador.</p>
        </div>
      </div>
    );
  }

  if (!license.active) {
    return (
      <div className="license-card license-expired">
        <div className="license-icon">❌</div>
        <div className="license-info">
          <h3>Licença expirada</h3>
          <p>Sua licença expirou. Aguardando renovação pelo administrador.</p>
        </div>
      </div>
    );
  }

  const validDate = new Date(license.validUntil);
  return (
    <div className="license-card license-active">
      <div className="license-icon">✅</div>
      <div className="license-info">
        <h3>Licença ativa</h3>
        <p>Válida até: <strong>{format(validDate, "dd/MM/yyyy")}</strong></p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user, logout, license } = useAuth();
  const [searchParams] = useSearchParams();
  const licenseError = searchParams.get("license_error") === "true";

  const hasActiveLicense = license && license.active;

  return (
    <div className="dashboard-page">
      <header className="dash-nav">
        <Link to="/" className="dash-brand" aria-label="Lightning Risk">
          <span className="brand-mark">LR</span>
          <span>Lightning Risk</span>
        </Link>
        <div className="dash-user-controls">
          <span className="welcome-user">Olá, {user?.name}</span>
          {user?.is_admin && (
            <Link to="/admin/dashboard" className="nav-action">
              Administração
            </Link>
          )}
          <button className="nav-action-outline" onClick={logout}>
            Sair
          </button>
        </div>
      </header>

      <main className="dash-container">
        <div className="dash-header">
          <h2>Seu Painel</h2>
          <p>Selecione a ferramenta de análise desejada ou verifique seu status.</p>
        </div>

        {licenseError && (
          <div className="alert-box error">
            Acesso negado. A funcionalidade de Análise Completa requer uma licença ativa.
          </div>
        )}

        <LicenseStatusCard license={license} />

        <div className="options-grid">
          <Link
            to={hasActiveLicense ? "/calculo-complexo" : "#"}
            className={`option-card ${!hasActiveLicense ? "disabled" : ""}`}
            onClick={(e) => !hasActiveLicense && e.preventDefault()}
          >
            <div className="card-top">
              <span className="card-number">01</span>
              {!hasActiveLicense && <span className="lock-icon" aria-label="Bloqueado">🔒</span>}
            </div>
            <div className="card-icon"><IconComplex /></div>
            <h3>Cálculo Completo</h3>
            <p>Realize um estudo detalhado conforme a norma ABNT NBR 5419.</p>
            {!hasActiveLicense && (
              <div className="license-tag">Requer licença ativa</div>
            )}
          </Link>

          <Link to="/calculo-simples" className="option-card">
            <div className="card-top">
              <span className="card-number">02</span>
            </div>
            <div className="card-icon"><IconSimple /></div>
            <h3>Cálculo Simplificado</h3>
            <p>Faça uma estimativa rápida de risco baseada em parâmetros essenciais.</p>
          </Link>

          <Link to="/historico" className="option-card">
            <div className="card-top">
              <span className="card-number">03</span>
            </div>
            <div className="card-icon"><IconHistory /></div>
            <h3>Histórico</h3>
            <p>Acesse e consulte todos os cálculos realizados anteriormente na sua conta.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
