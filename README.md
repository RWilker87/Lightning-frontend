# ⚡ Lightning Risk Analysis — Frontend

Sistema de análise de risco de descargas atmosféricas conforme **ABNT NBR 5419**, com calculadora simplificada e completa.

## 🛠 Tecnologias

- **React 19** + **Vite**
- **React Router DOM v7** — Rotas e navegação SPA
- **Axios** — Comunicação com a API REST
- **date-fns** — Formatação de datas (pt-BR)

## 🚀 Como Rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18+)
- npm (v9+)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/RWilker87/Lightning-frontend.git
cd Lightning-frontend

# Instale as dependências
npm install

# Crie o arquivo de variáveis de ambiente
cp .env.example .env
# Edite .env e configure a URL do backend
```

### Execução

```bash
# Modo de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

## ⚙️ Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_API_URL` | URL base da API backend | `https://lightning-backend-fl6y.onrender.com/` |

## 📁 Estrutura do Projeto

```
src/
├── contexts/          # Context API (AuthContext)
├── pages/             # Páginas da aplicação
│   ├── AdminPage/     # Painel de administração
│   ├── History/       # Histórico de cálculos
│   ├── Login/         # Login
│   ├── RegisterPage/  # Cadastro de usuário
│   ├── complexCal/    # Cálculo complexo (NBR 5419)
│   ├── dashboard/     # Painel principal
│   └── simpleCal/     # Cálculo simplificado
├── services/          # Configuração Axios (api.js)
├── App.jsx            # Rotas e providers
├── main.jsx           # Entry point
├── index.css          # Estilos globais
└── App.css            # Estilos do layout
```

## 🔐 Funcionalidades

- **Autenticação** — Login/Cadastro com JWT
- **Calculadora Simplificada** — Avaliação rápida de risco (gratuita)
- **Calculadora Completa** — Análise detalhada NBR 5419 (requer licença)
- **Histórico** — Registro de todos os cálculos realizados
- **Painel Admin** — Gestão de utilizadores e licenças
- **Controle de Licença** — Verificação real-time no backend antes de acessar funcionalidades premium

## 📝 Notas de Segurança

> O token JWT é atualmente armazenado em `localStorage`. Para ambientes de produção com alto risco, considere migrar para **httpOnly cookies** gerenciados pelo backend para proteção contra ataques XSS.
