# 🚀 Mini SPA Router + Include (JavaScript Puro)

![GitHub repo size](https://img.shields.io/github/repo-size/SEU_USUARIO/SEU_REPO)
![GitHub last commit](https://img.shields.io/github/last-commit/SEU_USUARIO/SEU_REPO)
![GitHub license](https://img.shields.io/github/license/SEU_USUARIO/SEU_REPO)
![Status](https://img.shields.io/badge/status-active-success)
![JavaScript](https://img.shields.io/badge/javascript-vanilla-yellow)

---

## 📌 Sobre o projeto

Este projeto é um **mini framework SPA (Single Page Application)** corporativo e modular feito em **JavaScript puro (Vanilla)**, operando de forma 100% client-side e sem dependências externas.

Ele simula arquiteturas robustas de roteamento e componentização do ecossistema moderno de desenvolvimento:

- **📦 Modularidade Isolada (`router.js`):** Arquivo de configuração de rotas completamente separado do motor principal (`app.js`).
- **🔁 Inclusão Dinâmica (Estilo PHP):** O motor injeta arquivos de scripts externos dinamicamente no DOM sob demanda, prevenindo vazamento de memória e duplicação de escopos.
- **🛡️ Tratamento de Erros Robusto (Anti-Broken URL):** Se uma rota não for encontrada ou falhar, o histórico e a barra de endereços do navegador **permanecem intactos**, exibindo uma view customizada com os logs técnicos na interface.
- **🧩 Componentização de HTML (`include`):** Carregamento assíncrono de fragments e parciais via `fetch` de forma automatizada.
- **⚡ Injeção Inteligente de Scripts:** Lê, clona atributos e executa tags `<script>` (tanto blocos comuns quanto `type="module"`) de páginas assíncronas no cabeçalho.

---

## 📁 Estrutura do projeto

```text
/index.html
/app.js          <- Motor Core do Framework SPA
/router.js       <- Arquivo de Configuração das Rotas (Módulo Separado)
/erro-404.html   <- View Customizada de Fallback para Erros Globais

/assets/
│
├── components/
│   ├── header.html
│   ├── footer.html
│   └── card.html
│
└── pages/
    ├── home.html
    ├── sobre.html
    └── contato.html