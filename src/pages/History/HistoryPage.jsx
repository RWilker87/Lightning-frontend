import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import { format } from "date-fns";
import "./HistoryPage.css";

// Labels legíveis para os parâmetros do cálculo
const parameterLabels = {
  Ng: "Densidade de Raios (Ng)",
  L: "Comprimento (L) m",
  W: "Largura (W) m",
  H: "Altura (H) m",
  cd_localizacao: "Localização (Cd)",
  spda_classe: "Classe SPDA",
  tem_linha_energia: "Possui Linha de Energia",
  Le_energia: "Comp. Linha Energia (m)",
  ci_energia: "Instalação Energia",
  ct_energia: "Tipo Energia",
  ce_energia: "Ambiente Energia",
  tem_linha_sinal: "Possui Linha de Sinal",
  Ls_sinal: "Comp. Linha Sinal (m)",
  ci_sinal: "Instalação Sinal",
  ct_sinal: "Tipo Sinal",
  ce_sinal: "Ambiente Sinal",
  pta_medida: "Proteção Choque (Estrutura)",
  ptu_medida: "Proteção Choque (Linha)",
  pspd_nivel: "Nível DPS",
  ks3_fiacao: "Fiação Interna",
  rf_risco: "Risco de Incêndio",
  hz_perigo: "Perigo Especial",
  rt_piso: "Tipo de Piso",
  rp_incendio: "Proteção Incêndio",
};

// Formata o valor para exibição amigável
function formatValue(key, value) {
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (value === null || value === undefined) return "—";
  return String(value);
}

// Modal de detalhes do cálculo
function DetailModal({ item, onClose }) {
  if (!item) return null;

  const params = item.parameters;
  const analysis = item.result?.analysis;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Detalhes do Cálculo</h2>
          <span className="modal-date">
            {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm")}
          </span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>

        {/* Parâmetros de Entrada */}
        <section className="modal-section">
          <h3>Parâmetros de Entrada</h3>
          <div className="detail-grid">
            {Object.entries(params).map(([key, value]) => {
              const label = parameterLabels[key] || key;
              return (
                <div className="detail-item" key={key}>
                  <span className="detail-label">{label}</span>
                  <span className="detail-value">{formatValue(key, value)}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Resultados da Análise */}
        {analysis && (
          <section className="modal-section">
            <h3>Resultados da Análise de Risco</h3>
            <div className="risk-grid">
              {["R1", "R2", "R3", "R4"].map((rKey) => {
                const r = analysis[rKey];
                if (!r) return null;
                return (
                  <div
                    className={`risk-card ${r.necessita_protecao ? "risk-card-danger" : "risk-card-safe"}`}
                    key={rKey}
                  >
                    <div className="risk-card-header">
                      <span className="risk-card-label">{rKey}</span>
                      <span className={`risk-card-badge ${r.necessita_protecao ? "badge-danger" : "badge-safe"}`}>
                        {r.necessita_protecao ? "Proteção Requerida" : "Risco Tolerável"}
                      </span>
                    </div>
                    <div className="risk-card-value">{r.risco}</div>
                    <div className="risk-card-sublabel">
                      {rKey === "R1" && "Perda de Vidas"}
                      {rKey === "R2" && "Perda de Serviços"}
                      {rKey === "R3" && "Perda de Patrimônio Cultural"}
                      {rKey === "R4" && "Perda Econômica"}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/history");
        const parsedHistory = response.data
          .map((item) => {
            try {
              return {
                ...item,
                parameters: typeof item.parameters === "string" ? JSON.parse(item.parameters) : item.parameters,
                result: typeof item.result === "string" ? JSON.parse(item.result) : item.result,
              };
            } catch {
              console.warn(`Registro de histórico com ID ${item.id} possui dados corrompidos e foi ignorado.`);
              return null;
            }
          })
          .filter(Boolean);
        setHistory(parsedHistory);
      } catch (err) {
        setError("Falha ao carregar o histórico.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading)
    return <div className="history-container">A carregar histórico...</div>;
  if (error) return <div className="history-container error-box">{error}</div>;

  return (
    <div className="history-container">
      <header className="history-header">
        <h1>Histórico de Cálculos</h1>
        <Link to="/dashboard" className="back-button">
          ← Voltar ao Painel
        </Link>
      </header>

      {history.length === 0 ? (
        <p className="no-history-message">Ainda não realizou nenhum cálculo.</p>
      ) : (
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Dimensões (LxWxH)</th>
                <th>Densidade (Ng)</th>
                <th>R1 (Vidas)</th>
                <th>R2 (Serviços)</th>
                <th>R3 (Cultural)</th>
                <th>R4 (Económico)</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>
                    {format(new Date(item.created_at), "dd/MM/yyyy HH:mm")}
                  </td>
                  <td>{`${item.parameters.L} x ${item.parameters.W} x ${item.parameters.H} m`}</td>
                  <td>{item.parameters.Ng}</td>
                  <td
                    className={
                      item.result.analysis.R1.necessita_protecao
                        ? "risk-high"
                        : "risk-low"
                    }
                  >
                    {item.result.finalRisks.R1}
                  </td>
                  <td
                    className={
                      item.result.analysis.R2.necessita_protecao
                        ? "risk-high"
                        : "risk-low"
                    }
                  >
                    {item.result.finalRisks.R2}
                  </td>
                  <td
                    className={
                      item.result.analysis.R3.necessita_protecao
                        ? "risk-high"
                        : "risk-low"
                    }
                  >
                    {item.result.finalRisks.R3}
                  </td>
                  <td
                    className={
                      item.result.analysis.R4.necessita_protecao
                        ? "risk-high"
                        : "risk-low"
                    }
                  >
                    {item.result.finalRisks.R4}
                  </td>
                  <td>
                    <button
                      className="details-button"
                      onClick={() => setSelectedItem(item)}
                    >
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
