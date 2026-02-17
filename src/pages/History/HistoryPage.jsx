import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import "./HistoryPage.css";

export function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/history");
        const parsedHistory = response.data
          .map((item) => {
            try {
              return {
                ...item,
                parameters: JSON.parse(item.parameters),
                result: JSON.parse(item.result),
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
                    <button className="details-button">Ver Detalhes</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
