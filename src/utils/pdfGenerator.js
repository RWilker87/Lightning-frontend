// src/utils/pdfGenerator.js

const parameterLabels = {
  Ng: "Densidade de Raios (Ng)",
  L: "Comprimento (L)",
  W: "Largura (W)",
  H: "Altura (H)",
  cd_localizacao: "Localização (Cd)",
  spda_classe: "Classe SPDA",
  tem_linha_energia: "Possui Linha de Energia",
  Le_energia: "Comprimento Linha Energia",
  ci_energia: "Tipo Instalação (Energia)",
  ct_energia: "Tipo de Cabo (Energia)",
  ce_energia: "Fator de Tela (Energia)",
  tem_linha_sinal: "Possui Linha de Sinal",
  Ls_sinal: "Comprimento Linha Sinal",
  ci_sinal: "Tipo Instalação (Sinal)",
  ct_sinal: "Tipo de Cabo (Sinal)",
  ce_sinal: "Fator de Tela (Sinal)",
  pta_medida: "Medida Choque (Pessoas)",
  ptu_medida: "Proteção Choque (Linha)",
  pspd_nivel: "Nível Proteção DPS",
  ks3_fiacao: "Fiação Interna",
  rt_piso: "Tipo de Piso",
  rp_incendio: "Proteção de Incêndio",
  rf_risco: "Risco de Incêndio",
  hz_perigo: "Perigo Especial",
  pessoas_interior: "Pessoas no Interior",
  pessoas_exterior: "Pessoas no Exterior",
  tempo_exterior_pessoas: "Permanência Exterior (h/ano)",
  patrimonio_cultural: "Patrimônio Cultural",
  contem_animais: "Contém Animais",
  tipo_estrutura_d2: "Tipo de Estrutura",
  valor_animais: "Valor Animais (R$)",
  valor_predio: "Valor Prédio (R$)",
  valor_conteudo: "Valor Conteúdo (R$)",
  valor_sistemas: "Valor Sistemas (R$)",
  valor_total: "Valor Total da Estrutura (R$)"
};

const valueLabels = {
  cd_localizacao: {
    isolada: "Isolada",
    isolada_topo_colina: "Isolada no topo de colina",
    cercada_objetos_iguais_baixos: "Cercada por objetos iguais/baixos",
    cercada_objetos_altos: "Cercada por objetos altos"
  },
  spda_classe: {
    I: "Classe I",
    II: "Classe II",
    III: "Classe III",
    IV: "Classe IV"
  },
  ci_energia: { aerea: "Aérea", enterrada: "Enterrada" },
  ci_sinal: { aerea: "Aérea", enterrada: "Enterrada" },
  ct_energia: {
    bt_sinal: "Baixa Tensão / Sinal",
    alta_tensao: "Alta Tensão"
  },
  ct_sinal: {
    bt_sinal: "Baixa Tensão / Sinal",
    alta_tensao: "Alta Tensão"
  },
  ce_energia: {
    suburbano: "Suburbano",
    urbano: "Urbano",
    industrial: "Industrial",
    rural: "Rural"
  },
  ce_sinal: {
    suburbano: "Suburbano",
    urbano: "Urbano",
    industrial: "Industrial",
    rural: "Rural"
  },
  pta_medida: {
    nenhuma: "Nenhuma",
    avisos_alerta: "Avisos de Alerta",
    isolacao_eletrica_3mm: "Isolação Elétrica (3mm)",
    restricoes_fisicas: "Restrições Físicas"
  },
  ptu_medida: {
    nenhuma: "Nenhuma",
    avisos_alerta: "Avisos de Alerta",
    isolacao_eletrica: "Isolação Elétrica"
  },
  pspd_nivel: {
    nenhum_dps: "Nenhum DPS",
    III_IV: "Nível III-IV",
    II: "Nível II",
    I: "Nível I"
  },
  ks3_fiacao: {
    nao_blindado_sem_cuidado: "Não Blindado s/ Cuidado",
    nao_blindado_evitando_lacos: "Não Blindado c/ Cuidado",
    blindado_ou_eletrodutos: "Blindado/Eletrodutos"
  },
  rt_piso: {
    agricultura_concreto: "Grama/Asfalto/Madeira",
    concreto: "Concreto/Pedra",
    madeira: "Madeira Seca"
  },
  rp_incendio: {
    nenhuma: "Nenhuma",
    extintores: "Extintores portáteis",
    hidrantes: "Hidrantes e mangotinhos",
    automatico: "Sistemas automáticos (Sprinklers)"
  },
  rf_risco: {
    incendio_baixo: "Baixo",
    incendio_normal: "Normal",
    incendio_alto: "Alto",
    explosao_zonas_2_22: "Explosão Zonas 2/22"
  },
  hz_perigo: {
    nenhum: "Nenhum",
    panico_baixo: "Baixo",
    panico_medio: "Médio",
    panico_alto: "Alto"
  }
};

function formatValue(key, value) {
  if (value === true || value === "true") return "Sim";
  if (value === false || value === "false") return "Não";
  if (value === null || value === undefined || value === "") return "—";

  if (valueLabels[key] && valueLabels[key][value]) {
    return valueLabels[key][value];
  }

  if (typeof value === "number") {
    if (key.startsWith("valor_") || key === "valor_total") {
      return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    }
    return String(value);
  }

  return String(value);
}

export function downloadCalculationPDF(calculationData, userName = "Responsável Técnico") {
  const params = calculationData.parameters || {};
  const analysis = calculationData.result?.analysis || {};
  const createdAt = calculationData.created_at ? new Date(calculationData.created_at) : new Date();
  const formattedDate = createdAt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.width = "0px";
  iframe.style.height = "0px";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatório Técnico SPDA - ${formattedDate}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:wght@400;500;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

        :root {
          --ink: #111614;
          --paper: #f6f3ed;
          --paper-strong: #fffdfa;
          --line: rgba(17, 22, 20, 0.12);
          --line-strong: rgba(17, 22, 20, 0.22);
          --accent-dark: #71510f;
          --danger: #b94b3f;
          --ok: #28735f;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Inter', sans-serif;
          color: var(--ink);
          background: #fff;
          padding: 20px;
          line-height: 1.4;
          font-size: 11px;
        }

        /* Paginação de A4 */
        .page {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          background: #fff;
        }

        /* Branding e Header */
        .header {
          border-bottom: 2px solid var(--ink);
          padding-bottom: 15px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .brand-logo {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: 20px;
          letter-spacing: -0.03em;
          text-transform: uppercase;
        }

        .brand-logo span {
          background: var(--ink);
          color: #fff;
          padding: 2px 6px;
          margin-right: 4px;
        }

        .header-title {
          text-align: right;
        }

        .header-title h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent-dark);
        }

        .header-title p {
          font-size: 10px;
          color: #666;
        }

        /* Meta Grid */
        .meta-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          background: var(--paper);
          padding: 12px 18px;
          border: 1px solid var(--line-strong);
          margin-bottom: 20px;
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .meta-item span {
          font-size: 9px;
          text-transform: uppercase;
          font-weight: 700;
          color: #555;
          letter-spacing: 0.02em;
        }

        .meta-item strong {
          font-size: 11px;
          font-weight: 800;
          color: var(--ink);
        }

        /* Seções */
        .section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--accent-dark);
          margin-bottom: 10px;
          border-bottom: 1px solid var(--line-strong);
          padding-bottom: 4px;
        }

        .parameters-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 25px;
        }

        .param-table {
          width: 100%;
          border-collapse: collapse;
        }

        .param-table tr {
          border-bottom: 1px solid var(--line);
        }

        .param-table tr:last-child {
          border-bottom: none;
        }

        .param-table td {
          padding: 6px 4px;
          font-size: 10px;
          vertical-align: middle;
        }

        .param-table td:first-child {
          font-weight: 700;
          color: #333;
          width: 60%;
        }

        .param-table td:last-child {
          text-align: right;
          font-weight: 500;
          color: var(--ink);
        }

        /* Bloco de Resultados */
        .results-section {
          margin-top: 15px;
          margin-bottom: 25px;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .risk-card {
          border: 1px solid var(--line-strong);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: var(--paper-strong);
        }

        .risk-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .risk-card-label {
          font-weight: 800;
          font-size: 11px;
        }

        .risk-badge {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 2px 6px;
          border: 1px solid currentColor;
        }

        .risk-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 16px;
          font-weight: 700;
          color: var(--ink);
        }

        .risk-card-desc {
          font-size: 10px;
          color: #555;
          margin-top: -4px;
        }

        .risk-card-safe {
          border-left: 4px solid var(--ok);
        }

        .risk-card-safe .risk-badge {
          background: rgba(40, 115, 95, 0.05);
          color: var(--ok);
        }

        .risk-card-danger {
          border-left: 4px solid var(--danger);
        }

        .risk-card-danger .risk-badge {
          background: rgba(185, 75, 63, 0.05);
          color: var(--danger);
        }

        /* Disclaimer de Responsabilidade */
        .disclaimer-block {
          border: 1px solid var(--line-strong);
          padding: 12px;
          font-size: 9px;
          color: #666;
          background: var(--paper-strong);
          margin-top: 25px;
          line-height: 1.5;
        }

        .disclaimer-block strong {
          color: var(--ink);
        }

        /* Assinatura */
        .signature-area {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .signature-line {
          width: 250px;
          border-top: 1px solid var(--ink);
          text-align: center;
          padding-top: 5px;
          font-size: 10px;
          font-weight: 700;
        }

        .signature-line span {
          display: block;
          font-weight: 400;
          color: #555;
          font-size: 9px;
          margin-top: 2px;
        }

        /* Regras de Impressão nativa */
        @media print {
          body {
            padding: 0;
            background: #fff;
          }
          .page {
            max-width: 100%;
          }
          .disclaimer-block, .risk-card {
            box-shadow: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- Cabeçalho -->
        <header class="header">
          <div class="brand-logo">
            <span>LR</span> Lightning Risk
          </div>
          <div class="header-title">
            <h1>Relatório Técnico de Riscos SPDA</h1>
            <p>Análise de Risco conforme ABNT NBR 5419</p>
          </div>
        </header>

        <!-- Metadados -->
        <section class="meta-grid">
          <div class="meta-item">
            <span>Data de Cálculo</span>
            <strong>${formattedDate}</strong>
          </div>
          <div class="meta-item">
            <span>Responsável Técnico</span>
            <strong>${userName}</strong>
          </div>
          <div class="meta-item">
            <span>Escopo Técnico</span>
            <strong>Cálculo Completo (NBR 5419)</strong>
          </div>
        </section>

        <!-- Parâmetros de Entrada -->
        <section class="section-title">Parâmetros Estruturais & Ambientais</section>
        <div class="parameters-grid">
          <div>
            <table class="param-table">
              <tbody>
                <tr>
                  <td>Densidade de Raios (Ng)</td>
                  <td>${formatValue("Ng", params.Ng)} raios/km²/ano</td>
                </tr>
                <tr>
                  <td>Comprimento (L)</td>
                  <td>${formatValue("L", params.L)} m</td>
                </tr>
                <tr>
                  <td>Largura (W)</td>
                  <td>${formatValue("W", params.W)} m</td>
                </tr>
                <tr>
                  <td>Altura (H)</td>
                  <td>${formatValue("H", params.H)} m</td>
                </tr>
                <tr>
                  <td>Localização (Cd)</td>
                  <td>${formatValue("cd_localizacao", params.cd_localizacao)}</td>
                </tr>
                <tr>
                  <td>Classe SPDA</td>
                  <td>${formatValue("spda_classe", params.spda_classe)}</td>
                </tr>
                <tr>
                  <td>Risco de Incêndio</td>
                  <td>${formatValue("rf_risco", params.rf_risco)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <table class="param-table">
              <tbody>
                <tr>
                  <td>Proteção de Incêndio</td>
                  <td>${formatValue("rp_incendio", params.rp_incendio)}</td>
                </tr>
                <tr>
                  <td>Perigo Especial (Pânico)</td>
                  <td>${formatValue("hz_perigo", params.hz_perigo)}</td>
                </tr>
                <tr>
                  <td>Tipo de Piso</td>
                  <td>${formatValue("rt_piso", params.rt_piso)}</td>
                </tr>
                <tr>
                  <td>Nível DPS</td>
                  <td>${formatValue("pspd_nivel", params.pspd_nivel)}</td>
                </tr>
                <tr>
                  <td>Fiação Interna</td>
                  <td>${formatValue("ks3_fiacao", params.ks3_fiacao)}</td>
                </tr>
                <tr>
                  <td>Patrimônio Cultural</td>
                  <td>${formatValue("patrimonio_cultural", params.patrimonio_cultural)}</td>
                </tr>
                <tr>
                  <td>Valor Total da Estrutura</td>
                  <td>${formatValue("valor_total", params.valor_total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Resultados da Análise -->
        <section class="section-title">Resultados da Análise de Riscos</section>
        <div class="results-section">
          <div class="results-grid">
            <!-- R1 -->
            <div class="risk-card ${analysis.R1?.necessita_protecao ? 'risk-card-danger' : 'risk-card-safe'}">
              <div class="risk-card-header">
                <span class="risk-card-label">R1 - Perda de Vida Humana</span>
                <span class="risk-badge">${analysis.R1?.necessita_protecao ? 'Proteção Requerida' : 'Risco Tolerável'}</span>
              </div>
              <div class="risk-value">${analysis.R1?.risco || '—'}</div>
              <div class="risk-card-desc">Limite tolerável: 1.00e-5 (1 x 10⁻⁵)</div>
            </div>

            <!-- R2 -->
            <div class="risk-card ${analysis.R2?.necessita_protecao ? 'risk-card-danger' : 'risk-card-safe'}">
              <div class="risk-card-header">
                <span class="risk-card-label">R2 - Perda de Serviço Público</span>
                <span class="risk-badge">${analysis.R2?.necessita_protecao ? 'Proteção Requerida' : 'Risco Tolerável'}</span>
              </div>
              <div class="risk-value">${analysis.R2?.risco || '—'}</div>
              <div class="risk-card-desc">Limite tolerável: 1.00e-3 (1 x 10⁻³)</div>
            </div>

            <!-- R3 -->
            <div class="risk-card ${analysis.R3?.necessita_protecao ? 'risk-card-danger' : 'risk-card-safe'}">
              <div class="risk-card-header">
                <span class="risk-card-label">R3 - Perda de Patrimônio Cultural</span>
                <span class="risk-badge">${analysis.R3?.necessita_protecao ? 'Proteção Requerida' : 'Risco Tolerável'}</span>
              </div>
              <div class="risk-value">${analysis.R3?.risco || '—'}</div>
              <div class="risk-card-desc">Limite tolerável: 1.00e-4 (1 x 10⁻⁴)</div>
            </div>

            <!-- R4 -->
            <div class="risk-card ${analysis.R4?.necessita_protecao ? 'risk-card-danger' : 'risk-card-safe'}">
              <div class="risk-card-header">
                <span class="risk-card-label">R4 - Perda de Valor Econômico</span>
                <span class="risk-badge">${analysis.R4?.necessita_protecao ? 'Proteção Requerida' : 'Risco Tolerável'}</span>
              </div>
              <div class="risk-value">${analysis.R4?.risco || '—'}</div>
              <div class="risk-card-desc">Limite tolerável: 1.00e-5 (1 x 10⁻⁵)</div>
            </div>
          </div>
        </div>

        <!-- Termo de responsabilidade técnica -->
        <div class="disclaimer-block">
          <strong>Aviso de Responsabilidade Técnica:</strong> Este relatório foi gerado automaticamente pelo sistema <strong>Lightning Risk</strong> baseado nas diretrizes e equações normativas da <strong>ABNT NBR 5419</strong>. A exatidão deste estudo depende inteiramente da precisão e validação dos dados de entrada fornecidos pelo profissional responsável. O dimensionamento final do sistema de proteção contra descargas atmosféricas (SPDA) deve ser validado por engenheiro devidamente credenciado e com registro ativo no conselho regional (CREA).
        </div>

        <!-- Assinaturas -->
        <footer class="signature-area">
          <div class="signature-line">
            ${userName}
            <span>Engenheiro / Responsável Técnico</span>
          </div>
          <div class="signature-line">
            Responsável pelo Projeto / Cliente
            <span>Validação de Projeto</span>
          </div>
        </footer>
      </div>
    </body>
    </html>
  `;

  doc.open();
  doc.write(htmlContent);
  doc.close();

  iframe.contentWindow.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };
}
