// src/pages/simpleCal/SimpleCal.jsx
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "./SimpleCal.css";

// Fatores para o cálculo simplificado, baseados nas tabelas do PDF (Seção L.5)
const simpleFactors = {
  C2: {
    // Tabela L.5.1.2(a)
    metal_metal: 0.5,
    metal_nao_metalico: 1.0,
    metal_combustivel: 2.0,
    nao_metalico_metal: 1.0,
    nao_metalico_nao_metalico: 1.0,
    nao_metalico_combustivel: 2.5,
    combustivel_metal: 2.0,
    combustivel_nao_metalico: 2.5,
    combustivel_combustivel: 3.0,
  },
  C3: {
    // Tabela L.5.1.2(b)
    baixo_valor_nao_combustivel: 0.5,
    valor_padrao_nao_combustivel: 1.0,
    alto_valor_moderado_combustivel: 2.0,
    valor_excepcional_inflamavel: 3.0,
    valor_excepcional_cultural: 4.0,
  },
  C4: {
    // Tabela L.5.1.2(c)
    desocupado: 0.5,
    normalmente_ocupado: 1.0,
    dificil_evacuar_panico: 3.0,
  },
  C5: {
    // Tabela L.5.1.2(d)
    servico_nao_requerido: 1.0,
    servico_requerido: 5.0,
    impacto_ambiental: 10.0,
  },
  Cd: {
    // Tabela L.4.2
    cercada_objetos_altos: 0.25,
    cercada_objetos_iguais_baixos: 0.5,
    isolada: 1.0,
    isolada_topo_colina: 2.0,
  },
};

export function SimpleCalPage() {
  const [inputs, setInputs] = useState({
    Ng: 8.0,
    L: 20,
    W: 15,
    H: 10,
    estrutura: "nao_metalico",
    telhado: "nao_metalico",
    conteudo: "valor_padrao_nao_combustivel",
    ocupacao: "normalmente_ocupado",
    consequencia: "servico_nao_requerido",
    localizacao: "isolada",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  // useMemo para calcular os resultados apenas quando os inputs mudam
  const result = useMemo(() => {
    const {
      L,
      W,
      H,
      Ng,
      estrutura,
      telhado,
      conteudo,
      ocupacao,
      consequencia,
      localizacao,
    } = inputs;

    // Fórmula L.4.1.1 para a Área de Coleta (Ad)
    const Ad = L * W + 6 * H * (L + W) + Math.PI * 9 * H * H;

    // Fatores C
    const C2_key = `${estrutura}_${telhado}`;
    const C2 = simpleFactors.C2[C2_key] || 1.0;
    const C3 = simpleFactors.C3[conteudo] || 1.0;
    const C4 = simpleFactors.C4[ocupacao] || 1.0;
    const C5 = simpleFactors.C5[consequencia] || 1.0;
    const Cd = simpleFactors.Cd[localizacao] || 1.0;

    // Coeficiente Combinado C (Fórmula L.5.1.1)
    const C = C2 * C3 * C4 * C5;

    // Frequência Tolerável de Raios (Nc) (Fórmula L.5.1.1)
    const Nc = (1.5 * 1e-3) / C;

    // Ameaça Anual de Ocorrência (Nd) (Fórmula L.3)
    const Nd = Ng * Ad * Cd * 1e-6;

    const necessitaProtecao = Nd > Nc;

    return {
      Ad: Ad.toFixed(2),
      Nd: Nd.toExponential(2),
      C: C.toFixed(2),
      Nc: Nc.toExponential(2),
      necessitaProtecao,
      mensagem: necessitaProtecao
        ? "Proteção contra descargas atmosféricas é recomendada."
        : "Proteção contra descargas atmosféricas pode ser opcional.",
    };
  }, [inputs]);

  return (
    <div className="simple-calc-container">
      <header className="simple-calc-header">
        <h1>Avaliação de Risco Simplificada</h1>
        <Link to="/dashboard" className="back-button">
          ← Voltar ao Painel
        </Link>
      </header>

      <div className="simple-calc-content">
        <div className="simple-calc-form">
          <h2>Parâmetros de Entrada</h2>

          <div className="input-grid">
            {/* Parâmetros da Estrutura */}
            <div className="input-group">
              <label>Densidade de Raios (Ng)</label>
              <input
                type="number"
                name="Ng"
                value={inputs.Ng}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>Comprimento (L) m</label>
              <input
                type="number"
                name="L"
                value={inputs.L}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>Largura (W) m</label>
              <input
                type="number"
                name="W"
                value={inputs.W}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>Altura (H) m</label>
              <input
                type="number"
                name="H"
                value={inputs.H}
                onChange={handleChange}
              />
            </div>

            {/* Coeficientes */}
            <div className="input-group">
              <label>Localização (Cd)</label>
              <select
                name="localizacao"
                value={inputs.localizacao}
                onChange={handleChange}
              >
                <option value="isolada">Isolada</option>
                <option value="isolada_topo_colina">
                  Isolada no topo de colina
                </option>
                <option value="cercada_objetos_iguais_baixos">
                  Cercada por objetos iguais/baixos
                </option>
                <option value="cercada_objetos_altos">
                  Cercada por objetos altos
                </option>
              </select>
            </div>
            <div className="input-group">
              <label>Tipo de Estrutura (C2)</label>
              <select
                name="estrutura"
                value={inputs.estrutura}
                onChange={handleChange}
              >
                <option value="metal">Metal</option>
                <option value="nao_metalico">Não Metálico</option>
                <option value="combustivel">Combustível</option>
              </select>
            </div>
            <div className="input-group">
              <label>Tipo de Telhado (C2)</label>
              <select
                name="telhado"
                value={inputs.telhado}
                onChange={handleChange}
              >
                <option value="metal">Metal</option>
                <option value="nao_metalico">Não Metálico</option>
                <option value="combustivel">Combustível</option>
              </select>
            </div>
            <div className="input-group">
              <label>Conteúdo da Estrutura (C3)</label>
              <select
                name="conteudo"
                value={inputs.conteudo}
                onChange={handleChange}
              >
                <option value="baixo_valor_nao_combustivel">
                  Baixo Valor, Não Combustível
                </option>
                <option value="valor_padrao_nao_combustivel">
                  Padrão, Não Combustível
                </option>
                <option value="alto_valor_moderado_combustivel">
                  Alto Valor, Moderado Combustível
                </option>
                <option value="valor_excepcional_inflamavel">
                  Excepcional, Inflamável/Eletrônicos
                </option>
                <option value="valor_excepcional_cultural">
                  Excepcional, Cultural/Insubstituível
                </option>
              </select>
            </div>
            <div className="input-group">
              <label>Ocupação (C4)</label>
              <select
                name="ocupacao"
                value={inputs.ocupacao}
                onChange={handleChange}
              >
                <option value="desocupado">Desocupado</option>
                <option value="normalmente_ocupado">Normalmente Ocupado</option>
                <option value="dificil_evacuar_panico">
                  Difícil Evacuação ou Pânico
                </option>
              </select>
            </div>
            <div className="input-group">
              <label>Consequência da Descarga (C5)</label>
              <select
                name="consequencia"
                value={inputs.consequencia}
                onChange={handleChange}
              >
                <option value="servico_nao_requerido">
                  Serviço não crítico, sem impacto ambiental
                </option>
                <option value="servico_requerido">Serviço crítico</option>
                <option value="impacto_ambiental">Impacto Ambiental</option>
              </select>
            </div>
          </div>
        </div>

        <div className="simple-calc-results">
          <h2>Resultados da Análise</h2>
          <div className="result-summary">
            <div className="result-item">
              <span>Ameaça Anual de Ocorrência (Nd):</span>
              <span className="result-value">{result.Nd}</span>
            </div>
            <div className="result-item">
              <span>Frequência Tolerável (Nc):</span>
              <span className="result-value">{result.Nc}</span>
            </div>
          </div>
          <div
            className={`final-verdict ${result.necessitaProtecao ? "verdict-required" : "verdict-ok"
              }`}
          >
            <p>Se Nd &gt; Nc, a proteção é recomendada.</p>
            <h3>{result.mensagem}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
