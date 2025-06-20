// src/pages/complexCal/ComplexCal.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import api from "../../services/api.js";
import "./ComplexCal.css";
import { format, differenceInDays, formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";

// Estado inicial completo, com todos os parâmetros necessários para o cálculo
const initialState = {
  Ng: 8.0,
  L: 15,
  W: 20,
  H: 6,
  cd_localizacao: "isolada",
  spda_classe: "III",
  tem_linha_energia: true,
  Le_energia: 100,
  ci_energia: "aerea",
  ct_energia: "bt_sinal",
  ce_energia: "suburbano",
  deltaL_e: 500,
  tem_linha_sinal: false,
  Ls_sinal: 100,
  ci_sinal: "aerea",
  ct_sinal: "bt_sinal",
  ce_sinal: "suburbano",
  deltaL_t: 500,
  pta_medida: "nenhuma",
  ptu_medida: "nenhuma",
  pspd_nivel: "nenhum_dps",
  ks3_fiacao: "nao_blindado_sem_cuidado",
  rt_piso: "agricultura_concreto",
  rp_incendio: "nenhuma",
  rf_risco: "incendio_normal",
  hz_perigo: "nenhum",
  pessoas_interior: 5,
  pessoas_exterior: 0,
  tempo_exterior_pessoas: 0,
  patrimonio_cultural: false,
  contem_animais: false,
  tipo_estrutura_d2: "outros",
  valor_animais: 0,
  valor_predio: 100000,
  valor_conteudo: 50000,
  valor_sistemas: 20000,
  get valor_total() {
    return (
      this.valor_predio +
      this.valor_conteudo +
      this.valor_sistemas +
      this.valor_animais
    );
  },
};

export function ComplexCalPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialState);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [location, setLocation] = useState("São Paulo, Brasil");
  const [isFetchingNg, setIsFetchingNg] = useState(false);
  const [ngInfo, setNgInfo] = useState("");

  useEffect(() => {
    handleFetchNg();
  }, []);
  const LicenseStatus = () => {
    const { license } = useAuth();

    if (!license) {
      return (
        <div className="license-status license-expired">
          Licença não encontrada
        </div>
      );
    }

    const validUntil = new Date(license.validUntil);
    const today = new Date();
    const daysRemaining = differenceInDays(validUntil, today);

    let statusClass = "ok";
    let statusText;

    if (daysRemaining < 0) {
      statusClass = "expired";
      statusText = "Licença Expirada";
    } else {
      statusText = `Licença expira em ${formatDistanceToNowStrict(validUntil, {
        locale: ptBR,
        addSuffix: true,
        unit: "day",
      })}`;
      if (daysRemaining <= 7) {
        statusClass = "warning";
      }
    }

    return (
      <div className={`license-status license-${statusClass}`}>
        <span className="license-icon"></span>
        {statusText}
      </div>
    );
  };

  const handleFetchNg = async () => {
    if (!location) {
      setError("Por favor, insira uma localidade.");
      return;
    }
    setIsFetchingNg(true);
    setNgInfo("");
    setError("");
    try {
      const response = await api.get(`/lightning-density?location=${location}`);
      setFormData((prev) => ({ ...prev, Ng: response.data.Ng }));
      setNgInfo(response.data.message);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Não foi possível buscar a densidade.";
      setError(errorMessage);
      setNgInfo(errorMessage);
    } finally {
      setIsFetchingNg(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue =
      type === "checkbox"
        ? checked
        : type === "number"
        ? parseFloat(value) || ""
        : value;
    setFormData((prev) => ({ ...prev, [name]: inputValue }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setResult(null);
    try {
      const payload = { ...formData, valor_total: formData.valor_total };
      const response = await api.post("/calculations", payload);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Ocorreu um erro ao calcular.");
    } finally {
      setIsLoading(false);
    }
  };

  // Componente para renderizar cada linha de resultado
  const ResultRow = ({ label, analysis }) => (
    <div className="result-item">
      <div className="result-info">
        <span className="result-label">{label}:</span>
        <span className="result-value">{analysis.risco}</span>
      </div>
      <span
        className={`result-status ${
          analysis.necessita_protecao ? "status-required" : "status-ok"
        }`}
      >
        {analysis.necessita_protecao ? "Proteção Requerida" : "Risco Tolerável"}
      </span>
    </div>
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Análise de Risco Completa (NBR 5419)</h1>
        <LicenseStatus />
        <Link to="/dashboard" className="back-button">
          ← Voltar ao Painel
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="calculation-form">
        <fieldset className="form-fieldset">
          <legend className="form-legend">0. Densidade de Raios (Ng)</legend>
          <div className="ng-manual-group">
            <label className="form-label" htmlFor="ng-input">
              Densidade de descargas atmosféricas para a terra (raios/km²/ano)
            </label>
            <input
              id="ng-input"
              type="number"
              className="form-input"
              name="Ng"
              value={formData.Ng}
              onChange={handleChange}
              step="0.1"
              required
            />
            <a
              href="http://www.inpe.br/webelat/homepage/"
              target="_blank"
              rel="noopener noreferrer"
              className="ng-search-link"
            >
              Não sabe o valor? Pesquise aqui no mapa de densidade do INPE/ELAT
              ↗
            </a>
          </div>
        </fieldset>
        <fieldset className="form-fieldset">
          <legend className="form-legend">1. Dados da Estrutura</legend>
          <div className="form-grid">
            <div className="input-group">
              <label className="form-label">Comprimento (L) m</label>
              <input
                className="form-input"
                type="number"
                name="L"
                value={formData.L}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label className="form-label">Largura (W) m</label>
              <input
                className="form-input"
                type="number"
                name="W"
                value={formData.W}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label className="form-label">Altura (H) m</label>
              <input
                className="form-input"
                type="number"
                name="H"
                value={formData.H}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label className="form-label">Localização (Cd)</label>
              <select
                className="form-select"
                name="cd_localizacao"
                value={formData.cd_localizacao}
                onChange={handleChange}
              >
                <option value="cercada_objetos_altos">
                  Cercada por objetos mais altos
                </option>
                <option value="cercada_objetos_iguais_baixos">
                  Cercada por altura similar ou mais baixas
                </option>
                <option value="isolada">Isolada</option>
                <option value="isolada_topo_colina">
                  Isolada no topo de uma colina
                </option>
              </select>
            </div>
            <div className="input-group">
              <label className="form-label">Proteção SPDA (Pb)</label>
              <select
                className="form-select"
                name="spda_classe"
                value={formData.spda_classe}
                onChange={handleChange}
              >
                <option value="sem_spda">Sem SPDA</option>
                <option value="I">Classe I</option>
                <option value="II">Classe II</option>
                <option value="III">Classe III</option>
                <option value="IV">Classe IV</option>
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="form-fieldset">
          <legend className="form-legend">2. Linhas de Energia e Sinal</legend>
          <div className="form-grid-2col">
            <div className="line-section">
              <div className="input-group-checkbox">
                <input
                  type="checkbox"
                  id="tem_linha_energia"
                  name="tem_linha_energia"
                  checked={formData.tem_linha_energia}
                  onChange={handleChange}
                />
                <label htmlFor="tem_linha_energia">
                  Possui Linha de Energia?
                </label>
              </div>
              {formData.tem_linha_energia && (
                <>
                  <div className="input-group">
                    <label className="form-label">
                      Comprimento Linha Energia (m)
                    </label>
                    <input
                      className="form-input"
                      type="number"
                      name="Le_energia"
                      value={formData.Le_energia}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="input-group">
                    <label className="form-label">Instalação (Ci)</label>
                    <select
                      className="form-select"
                      name="ci_energia"
                      value={formData.ci_energia}
                      onChange={handleChange}
                    >
                      <option value="aerea">Aérea</option>
                      <option value="enterrada">Enterrada</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="form-label">Tipo (Ct)</label>
                    <select
                      className="form-select"
                      name="ct_energia"
                      value={formData.ct_energia}
                      onChange={handleChange}
                    >
                      <option value="bt_sinal">Baixa Tensão</option>
                      <option value="at_com_transformador">
                        Alta Tensão (c/ Transf.)
                      </option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="form-label">Ambiente (Ce)</label>
                    <select
                      className="form-select"
                      name="ce_energia"
                      value={formData.ce_energia}
                      onChange={handleChange}
                    >
                      <option value="rural">Rural</option>
                      <option value="suburbano">Suburbano</option>
                      <option value="urbano">Urbano</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="line-section">
              <div className="input-group-checkbox">
                <input
                  type="checkbox"
                  id="tem_linha_sinal"
                  name="tem_linha_sinal"
                  checked={formData.tem_linha_sinal}
                  onChange={handleChange}
                />
                <label htmlFor="tem_linha_sinal">Possui Linha de Sinal?</label>
              </div>
              {formData.tem_linha_sinal && (
                <>
                  <div className="input-group">
                    <label className="form-label">
                      Comprimento Linha Sinal (m)
                    </label>
                    <input
                      className="form-input"
                      type="number"
                      name="Ls_sinal"
                      value={formData.Ls_sinal}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="input-group">
                    <label className="form-label">Instalação (Ci)</label>
                    <select
                      className="form-select"
                      name="ci_sinal"
                      value={formData.ci_sinal}
                      onChange={handleChange}
                    >
                      <option value="aerea">Aérea</option>
                      <option value="enterrada">Enterrada</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="form-label">Tipo (Ct)</label>
                    <select
                      className="form-select"
                      name="ct_sinal"
                      value={formData.ct_sinal}
                      onChange={handleChange}
                    >
                      <option value="bt_sinal">Sinal</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="form-label">Ambiente (Ce)</label>
                    <select
                      className="form-select"
                      name="ce_sinal"
                      value={formData.ce_sinal}
                      onChange={handleChange}
                    >
                      <option value="rural">Rural</option>
                      <option value="suburbano">Suburbano</option>
                      <option value="urbano">Urbano</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset className="form-fieldset">
          <legend className="form-legend">
            3. Fatores de Perda e Proteções
          </legend>
          <div className="form-grid">
            <div className="input-group">
              <label className="form-label">Proteção Choque (Estrutura)</label>
              <select
                className="form-select"
                name="pta_medida"
                value={formData.pta_medida}
                onChange={handleChange}
              >
                <option value="nenhuma">Nenhuma</option>
                <option value="avisos_alerta">Avisos de Alerta</option>
                <option value="isolacao_eletrica_3mm">
                  Isolação Elétrica (3mm)
                </option>
                <option value="restricoes_fisicas">Restrições Físicas</option>
              </select>
            </div>
            <div className="input-group">
              <label className="form-label">Proteção Choque (Linha)</label>
              <select
                className="form-select"
                name="ptu_medida"
                value={formData.ptu_medida}
                onChange={handleChange}
              >
                <option value="nenhuma">Nenhuma</option>
                <option value="avisos_alerta">Avisos de Alerta</option>
                <option value="isolacao_eletrica">Isolação Elétrica</option>
              </select>
            </div>
            <div className="input-group">
              <label className="form-label">Nível de Proteção DPS</label>
              <select
                className="form-select"
                name="pspd_nivel"
                value={formData.pspd_nivel}
                onChange={handleChange}
              >
                <option value="nenhum_dps">Nenhum DPS</option>
                <option value="III_IV">Nível III-IV</option>
                <option value="II">Nível II</option>
                <option value="I">Nível I</option>
              </select>
            </div>
            <div className="input-group">
              <label className="form-label">Fiação Interna</label>
              <select
                className="form-select"
                name="ks3_fiacao"
                value={formData.ks3_fiacao}
                onChange={handleChange}
              >
                <option value="nao_blindado_sem_cuidado">
                  Não Blindado s/ Cuidado
                </option>
                <option value="nao_blindado_evitando_lacos">
                  Não Blindado c/ Cuidado
                </option>
                <option value="blindado_ou_eletrodutos">
                  Blindado/Eletrodutos
                </option>
              </select>
            </div>
            <div className="input-group">
              <label className="form-label">Risco de Incêndio</label>
              <select
                className="form-select"
                name="rf_risco"
                value={formData.rf_risco}
                onChange={handleChange}
              >
                <option value="incendio_baixo">Baixo</option>
                <option value="incendio_normal">Normal</option>
                <option value="incendio_alto">Alto</option>
                <option value="explosao_zonas_2_22">Explosão Z2/22</option>
              </select>
            </div>
            <div className="input-group">
              <label className="form-label">Perigo Especial (Pânico)</label>
              <select
                className="form-select"
                name="hz_perigo"
                value={formData.hz_perigo}
                onChange={handleChange}
              >
                <option value="nenhum">Nenhum</option>
                <option value="panico_baixo">Baixo</option>
                <option value="panico_medio">Médio</option>
                <option value="panico_alto">Alto</option>
              </select>
            </div>
          </div>
        </fieldset>

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? "A calcular..." : "Analisar Risco"}
        </button>
      </form>

      {error && (
        <div className="error-box">
          <strong>Erro:</strong> {error}
        </div>
      )}

      {result && (
        <div className="result-container">
          <div className="result-box">
            <h2 className="result-title">Análise de Risco Concluída</h2>
            <div className="result-grid">
              <ResultRow label="R1 (Vidas)" analysis={result.analysis.R1} />
              <ResultRow label="R2 (Serviços)" analysis={result.analysis.R2} />
              <ResultRow label="R3 (Cultural)" analysis={result.analysis.R3} />
              <ResultRow label="R4 (Económico)" analysis={result.analysis.R4} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
