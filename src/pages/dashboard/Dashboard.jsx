// src/pages/dashboard/Dashboard.jsx
import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { format } from "date-fns";
import "./Dashboard.css";

// Ícones como componentes SVG para melhor qualidade e controlo
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

// Card de status da licença
function LicenseStatusCard({ license }) {
  if (!license) {
    return (
      <div className="license-card license-inactive">
        <div className="license-card-icon">⏳</div>
        <div className="license-card-info">
          <h3>Licença Inativa</h3>
          <p>Aguardando aprovação do administrador.</p>
          <p className="license-subtitle">
            Sua conta foi criada, mas a licença ainda não foi ativada. Entre em contato com o administrador.
          </p>
        </div>
      </div>
    );
  }

  if (!license.active) {
    return (
      <div className="license-card license-expired">
        <div className="license-card-icon">❌</div>
        <div className="license-card-info">
          <h3>Licença Expirada</h3>
          <p>Sua licença expirou. Aguardando renovação pelo administrador.</p>
        </div>
      </div>
    );
  }

  const validDate = new Date(license.validUntil);
  return (
    <div className="license-card license-active">
      <div className="license-card-icon">✅</div>
      <div className="license-card-info">
        <h3>Licença Ativa</h3>
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
    <div className="hub-container">
      <header className="hub-header">
        <h1>Painel Principal</h1>
        <div className="header-user-controls">
          {user?.is_admin && (
            <Link to="/admin/dashboard" className="admin-link">
              Painel de Administração
            </Link>
          )}
          <span className="welcome-user">Olá, {user?.name}!</span>
          <button className="logout-button" onClick={logout}>
            Sair
          </button>
        </div>
      </header>

      <main className="hub-main">
        {/* Card de Status da Licença */}
        <LicenseStatusCard license={license} />

        {licenseError && (
          <div className="license-error-box">
            Acesso negado. A funcionalidade de Análise Completa requer uma
            licença ativa.
          </div>
        )}

        <h2 className="hub-title">Selecione uma Ferramenta de Análise</h2>

        <div className="options-container">
          <Link
            to={hasActiveLicense ? "/calculo-complexo" : "#"}
            className={`option-card card-complex ${!hasActiveLicense ? "disabled" : ""}`}
            onClick={(e) => !hasActiveLicense && e.preventDefault()}
          >
            {!hasActiveLicense && <div className="lock-icon">🔒</div>}
            <div className="option-card-icon">
              <IconComplex />
            </div>
            <h3>Análise de Risco Completa</h3>
            <p>
              Realize um cálculo detalhado conforme a norma ABNT NBR 5419, com
              todos os parâmetros.
            </p>
            {!hasActiveLicense && (
              <span className="license-required-tag">Requer Licença Ativa</span>
            )}
          </Link>

          <Link to="/calculo-simples" className="option-card card-simple">
            <div className="option-card-icon">
              <IconSimple />
            </div>
            <h3>Cálculo Simplificado</h3>
            <p>
              Uma ferramenta rápida para estimativas de risco com base em
              parâmetros essenciais.
            </p>
          </Link>

          <Link to="/historico" className="option-card card-history">
            <div className="option-card-icon">
              <IconHistory />
            </div>
            <h3>Histórico de Análises</h3>
            <p>
              Reveja e consulte todos os cálculos de risco que já foram
              realizados na sua conta.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
