import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

const simpleFactors = {
  C2: {
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
    baixo_valor_nao_combustivel: 0.5,
    valor_padrao_nao_combustivel: 1.0,
    alto_valor_moderado_combustivel: 2.0,
    valor_excepcional_inflamavel: 3.0,
    valor_excepcional_cultural: 4.0,
  },
  C4: {
    desocupado: 0.5,
    normalmente_ocupado: 1.0,
    dificil_evacuar_panico: 3.0,
  },
  C5: {
    servico_nao_requerido: 1.0,
    servico_requerido: 5.0,
    impacto_ambiental: 10.0,
  },
  Cd: {
    cercada_objetos_altos: 0.25,
    cercada_objetos_iguais_baixos: 0.5,
    isolada: 1.0,
    isolada_topo_colina: 2.0,
  },
};

const dimensionFields = [
  { name: "Ng", label: "Densidade Ng", suffix: "raios/km2/ano", step: "0.1" },
  { name: "L", label: "Comprimento", suffix: "m" },
  { name: "W", label: "Largura", suffix: "m" },
  { name: "H", label: "Altura", suffix: "m" },
];

const selectFields = [
  {
    name: "localizacao",
    label: "Localizacao",
    options: [
      ["isolada", "Isolada"],
      ["isolada_topo_colina", "Isolada no topo de colina"],
      ["cercada_objetos_iguais_baixos", "Cercada por objetos iguais ou baixos"],
      ["cercada_objetos_altos", "Cercada por objetos altos"],
    ],
  },
  {
    name: "estrutura",
    label: "Estrutura",
    options: [
      ["metal", "Metal"],
      ["nao_metalico", "Nao metalico"],
      ["combustivel", "Combustivel"],
    ],
  },
  {
    name: "telhado",
    label: "Telhado",
    options: [
      ["metal", "Metal"],
      ["nao_metalico", "Nao metalico"],
      ["combustivel", "Combustivel"],
    ],
  },
  {
    name: "conteudo",
    label: "Conteudo",
    options: [
      ["baixo_valor_nao_combustivel", "Baixo valor, nao combustivel"],
      ["valor_padrao_nao_combustivel", "Padrao, nao combustivel"],
      ["alto_valor_moderado_combustivel", "Alto valor, moderado combustivel"],
      ["valor_excepcional_inflamavel", "Excepcional, inflamavel ou eletronicos"],
      ["valor_excepcional_cultural", "Excepcional, cultural ou insubstituivel"],
    ],
  },
  {
    name: "ocupacao",
    label: "Ocupacao",
    options: [
      ["desocupado", "Desocupado"],
      ["normalmente_ocupado", "Normalmente ocupado"],
      ["dificil_evacuar_panico", "Dificil evacuacao ou panico"],
    ],
  },
  {
    name: "consequencia",
    label: "Consequencia",
    options: [
      ["servico_nao_requerido", "Servico nao critico"],
      ["servico_requerido", "Servico critico"],
      ["impacto_ambiental", "Impacto ambiental"],
    ],
  },
];

const paidFeatures = [
  {
    title: "Calculo completo",
    text: "Acesso aos parametros detalhados e avaliacao por categorias de risco.",
  },
  {
    title: "Historico dos estudos",
    text: "Consulte calculos anteriores e mantenha seus projetos organizados.",
  },
  {
    title: "Ativacao sob demanda",
    text: "Voce solicita a licenca e recebe acesso liberado para usar a area completa.",
  },
];

export function HomePage() {
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

  const handleChange = (event) => {
    const { name, value, type } = event.target;
    setInputs((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

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

    const Ad = L * W + 6 * H * (L + W) + Math.PI * 9 * H * H;
    const C2 = simpleFactors.C2[`${estrutura}_${telhado}`] || 1.0;
    const C3 = simpleFactors.C3[conteudo] || 1.0;
    const C4 = simpleFactors.C4[ocupacao] || 1.0;
    const C5 = simpleFactors.C5[consequencia] || 1.0;
    const Cd = simpleFactors.Cd[localizacao] || 1.0;
    const C = C2 * C3 * C4 * C5;
    const Nc = (1.5 * 1e-3) / C;
    const Nd = Ng * Ad * Cd * 1e-6;
    const ratio = Nc > 0 ? Nd / Nc : 0;
    const necessitaProtecao = Nd > Nc;

    return {
      Ad: Ad.toFixed(0),
      Nd: Nd.toExponential(2),
      Nc: Nc.toExponential(2),
      C: C.toFixed(2),
      ratio: ratio.toFixed(2),
      ratioPercent: `${Math.min(ratio, 2) * 50}%`,
      necessitaProtecao,
      status: necessitaProtecao ? "Acima do limite" : "Dentro do limite",
      verdict: necessitaProtecao
        ? "Protecao deve ser investigada"
        : "Protecao pode ser opcional",
    };
  }, [inputs]);

  return (
    <div className="home-page">
      <header className="home-nav">
        <Link to="/" className="home-brand" aria-label="Lightning Risk">
          <span className="brand-mark">LR</span>
          <span>Lightning Risk</span>
        </Link>

        <nav className="home-nav-links" aria-label="Navegacao principal">
          <a href="#calculo">Teste gratis</a>
          <a href="#licenca">Licenca</a>
          <Link to="/login">Entrar</Link>
          <Link to="/register" className="nav-button">
            Solicitar acesso
          </Link>
        </nav>
      </header>

      <main>
        <section className="home-hero">
          <div className="hero-copy">
            <p className="eyebrow">Software para analise de risco SPDA</p>
            <h1>Calcule risco de descargas atmosfericas com mais rapidez e seguranca.</h1>
            <p className="hero-subtitle">
              Faca uma triagem gratuita em poucos minutos. Quando precisar do calculo
              completo, voce contrata a licenca e libera a area profissional da plataforma.
            </p>

            <div className="hero-actions">
              <a href="#calculo" className="primary-action">
                Fazer teste gratis
                <span aria-hidden="true">+</span>
              </a>
              <Link to="/register" className="secondary-action">
                Quero uma licenca
              </Link>
            </div>

            <div className="hero-proof">
              <span>Triagem gratuita</span>
              <span>Licenca para calculo completo</span>
              <span>Acesso individual liberado por periodo</span>
            </div>
          </div>

          <aside className="hero-instrument" aria-label="Resumo do produto">
            <div className="instrument-topline">
              <span>TESTE GRATIS</span>
              <span>NBR 5419</span>
            </div>
            <img src="/lightning-risk-visual.svg" alt="" className="instrument-art" />
            <div className="instrument-readout">
              <div>
                <span>
                  <i className="status-dot" aria-hidden="true" />
                  Status
                </span>
                <strong>{result.status}</strong>
              </div>
              <div>
                <span>Razao Nd/Nc</span>
                <strong>{result.ratio}x</strong>
              </div>
            </div>
          </aside>
        </section>

        <section className="signal-strip" aria-label="Diferenciais">
          <div>
            <span>01</span>
            <strong>Teste sem compromisso</strong>
            <p>Veja uma indicacao preliminar antes de contratar a licenca.</p>
          </div>
          <div>
            <span>02</span>
            <strong>Menos retrabalho</strong>
            <p>Troque planilhas dispersas por uma entrada guiada e objetiva.</p>
          </div>
          <div>
            <span>03</span>
            <strong>Licenca direta</strong>
            <p>Contrate comigo e use o calculo completo na sua conta.</p>
          </div>
        </section>

        <section className="calculator-section" id="calculo">
          <div className="section-heading">
            <p className="eyebrow">Teste a ferramenta</p>
            <h2>Comece com uma avaliacao simplificada.</h2>
            <p>
              Informe os dados principais da estrutura e veja uma indicacao inicial.
              Para o estudo completo, solicite sua licenca e acesse a area paga.
            </p>
          </div>

          <div className="calculator-shell">
            <form className="home-calculator" aria-label="Calculo simplificado">
              <div className="form-header">
                <span>Entrada de dados</span>
                <strong>Teste gratis</strong>
              </div>

              <fieldset>
                <legend>Dimensoes e densidade</legend>
                <div className="field-grid field-grid-compact">
                  {dimensionFields.map((field) => (
                    <label key={field.name}>
                      <span>{field.label}</span>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          name={field.name}
                          value={inputs[field.name]}
                          onChange={handleChange}
                          step={field.step || "1"}
                          min="0"
                        />
                        <small>{field.suffix}</small>
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend>Fatores principais</legend>
                <div className="field-grid">
                  {selectFields.map((field) => (
                    <label key={field.name}>
                      <span>{field.label}</span>
                      <select
                        name={field.name}
                        value={inputs[field.name]}
                        onChange={handleChange}
                      >
                        {field.options.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              </fieldset>
            </form>

            <aside
              className={`result-panel ${
                result.necessitaProtecao ? "result-alert" : "result-ok"
              }`}
            >
              <span className="result-kicker">Resultado preliminar</span>
              <h3>{result.verdict}</h3>
              <p>
                {result.necessitaProtecao
                  ? "A ameaca anual estimada ficou acima da frequencia toleravel. A proxima etapa e detalhar os riscos na analise completa."
                  : "A ameaca anual estimada ficou abaixo da frequencia toleravel neste recorte simplificado."}
              </p>

              <div className="metric-list">
                <div>
                  <span>Area de coleta</span>
                  <strong>{result.Ad} m2</strong>
                </div>
                <div>
                  <span>Nd</span>
                  <strong>{result.Nd}</strong>
                </div>
                <div>
                  <span>Nc</span>
                  <strong>{result.Nc}</strong>
                </div>
                <div>
                  <span>Coeficiente C</span>
                  <strong>{result.C}</strong>
                </div>
              </div>

              <div className="locked-preview">
                <span>Com licenca ativa</span>
                <p>Calculo completo, riscos por categoria e historico dos estudos.</p>
              </div>

              <div className="risk-meter" aria-label={`Razao Nd por Nc: ${result.ratio}`}>
                <div className="risk-meter-top">
                  <span>Nd/Nc</span>
                  <strong>{result.ratio}x</strong>
                </div>
                <div className="risk-meter-track">
                  <span style={{ width: result.ratioPercent }} />
                </div>
              </div>

              <Link to="/register" className="result-cta">
                Solicitar acesso completo
              </Link>
            </aside>
          </div>
        </section>

        <section className="license-section" id="licenca">
          <div className="license-copy">
            <p className="eyebrow">Licenca comercial</p>
            <h2>A area completa e liberada para quem contrata a licenca.</h2>
            <p>
              A parte gratuita serve para demonstrar valor. A analise completa fica
              disponivel mediante pagamento e liberacao de acesso na sua conta.
            </p>
            <Link to="/register" className="license-main-cta">
              Solicitar liberacao
            </Link>
          </div>

          <div className="license-grid">
            {paidFeatures.map((feature, index) => (
              <article key={feature.title} style={{ "--index": index }}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="closing-cta">
          <div>
            <p className="eyebrow">Pronto para usar</p>
            <h2>Teste agora. Quando fizer sentido, solicite sua licenca comigo.</h2>
          </div>
          <div className="closing-actions">
            <a href="#calculo" className="primary-action">
              Testar gratis
              <span aria-hidden="true">+</span>
            </a>
            <Link to="/register" className="secondary-light-action">
              Quero acesso completo
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
