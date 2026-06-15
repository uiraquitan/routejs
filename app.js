window.onRouteLoad = null;

// SUA FUNÇÃO ORIGINAL COMPLETA E INTACTA (Com tratamento de erro interno)
async function include() {
    const elements = document.querySelectorAll('[include]');
    for (const el of elements) {
        const file = el.getAttribute('include');
        try {
            const response = await fetch(file);
            if (response.ok) {
                const html = await response.text();
                el.innerHTML = html;
                el.removeAttribute('include'); // Evita loops em re-renderizações
            } else {
                console.error(`[SPA Framework] Falha no include. Status: ${response.status} para o arquivo: ${file}`);
            }
        } catch (error) {
            console.error(`[SPA Framework] Erro de rede ou permissão ao incluir componente: ${file}`, error);
        }
    }
}

// Motor que lê tanto module quanto script comum e injeta no head
async function executarScriptsDoConteudo(container) {
    // Remove scripts da página anterior para não duplicar eventos na memória
    document.querySelectorAll("head script[data-page-script]").forEach(el => el.remove());

    const scripts = Array.from(container.querySelectorAll("script"));

    for (const scriptAntigo of scripts) {
        const scriptNovo = document.createElement("script");

        // Clona os atributos originais (src, type, defer, etc.)
        Array.from(scriptAntigo.attributes).forEach(attr => {
            try {
                scriptNovo.setAttribute(attr.name, attr.value);
            } catch (attrError) {
                console.error(`[SPA Framework] Erro ao clonar atributo do script: ${attr.name}`, attrError);
            }
        });

        scriptNovo.setAttribute("data-page-script", "true");

        if (scriptAntigo.src) {
            try {
                const response = await fetch(scriptAntigo.src);
                if (response.ok) {
                    scriptNovo.innerHTML = await response.text();
                } else {
                    console.error(`[SPA Framework] Script externo retornou status ${response.status}: ${scriptAntigo.src}`);
                }
            } catch (err) {
                console.error(`[SPA Framework] Erro crítico ao carregar/ler script externo: ${scriptAntigo.src}`, err);
            }
        } else {
            scriptNovo.innerHTML = scriptAntigo.innerHTML;
        }

        try {
            document.head.appendChild(scriptNovo);
        } catch (appendError) {
            console.error(`[SPA Framework] Erro ao injetar script no HEAD da página.`, appendError);
        }
    }
}

// Variável de controle para evitar o loop infinito de eventos
let executandoCargaSPA = false;

// Função auxiliar interna para renderizar a página de erro sem alterar a URL
async function renderizarPaginaErro(mensagem, appContainer) {
    const file404 = "./assets/pages/erro-404.html";
    try {
        // 🔥 CORREÇÃO: Ativa a trava antes de renderizar o 404 para o DOMContentLoaded não reiniciar o ciclo
        executandoCargaSPA = true;

        const response = await fetch(file404);
        if (!response.ok) throw new Error(`HTTP ${response.status} - Arquivo ${file404} não pôde ser lido.`);

        const html = await response.text();
        appContainer.innerHTML = html;

        // Injeta a string do erro diretamente no elemento reservado do 404
        const txtErro = document.getElementById("string-erro-spa");
        if (txtErro) {
            txtErro.innerText = message;
        }

        // Processa os componentes internos e scripts da própria página de erro
        await include();
        await executarScriptsDoConteudo(appContainer);

        // Dispara o evento sabendo que a trava 'executandoCargaSPA' vai segurar o loop externo
        document.dispatchEvent(new Event("DOMContentLoaded"));

    } catch (e) {
        console.error(`[SPA Framework] Erro crítico ao tentar renderizar a página de fallback 404:`, e);
        // Fallback do fallback caso o arquivo erro-404.html também suma da pasta
        appContainer.innerHTML = `<div style="padding:20px;color:#ef4444;font-family:sans-serif;"><h2>Erro Crítico</h2><p>${mensagem}</p></div>`;
    } finally {
        // Libera o roteador após processar tudo com segurança
        setTimeout(() => { executandoCargaSPA = false; }, 50);
    }
}

// Gerenciador de Carga de Rotas centralizado
async function loadRoute(path) {
    const app = document.getElementById("app");
    if (!app) {
        console.error("[SPA Framework] Elemento container '#app' não foi encontrado no DOM.");
        return;
    }
    // CORRIGIDO: Se o Live Server carregar apontando para o arquivo index.html, força a rota "/"
    if (path === "/index.html") {
        path = "/";
    }
    const mapaRotas = window.routes;

    // TRATAMENTO 1: Objeto de rotas global não inicializado
    if (!mapaRotas) {
        const msg = "O mapa de mapeamento 'window.routes' não foi carregado pelo router.js.";
        console.error(`[SPA Framework] Erro Crítico: ${msg}`);
        await renderizarPaginaErro(msg, app);
        return;
    }

    const file = mapaRotas[path];

    // TRATAMENTO 2: Rota inexistente (Interrompe o fluxo e chama o 404 na tela)
    if (!file) {
        const msg = `A rota '${path}' não está mapeada no seu arquivo de configurações.`;
        console.error(`[SPA Framework] Rota não encontrada: ${msg}`);
        await renderizarPaginaErro(msg, app);
        return;
    }

    try {
        executandoCargaSPA = true; // Ativa a trava de ciclo antes de carregar rota válida

        const response = await fetch(file);

        // TRATAMENTO 3: Arquivo mapeado existe no router.js mas foi deletado da pasta física
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} - O arquivo físico '${file}' está ausente ou inacessível no servidor.`);
        }

        const html = await response.text();

        // 1. Injeta o HTML válido
        app.innerHTML = html;

        // 2. Executa os sub-includes do componente
        await include();

        // 3. Executa os scripts vinculados
        await executarScriptsDoConteudo(app);

        // 4. Dispara ciclo de vida global
        document.dispatchEvent(new Event("DOMContentLoaded"));

        // 5. Atualiza o Histórico de navegação apenas se a rota foi resolvida com sucesso
        if (window.location.pathname !== path) {
            history.pushState({}, "", path);
        }

        // 6. Gatilho global customizado
        if (typeof window.onRouteLoad === "function") {
            try {
                window.onRouteLoad();
            } catch (hookError) {
                console.error("[SPA Framework] Erro lançado dentro de window.onRouteLoad():", hookError);
            }
        }

        setTimeout(() => { executandoCargaSPA = false; }, 50);

    } catch (error) {
        console.error(`[SPA Framework] Falha no fluxo de processamento da rota:`, error);
        // Exibe o erro de renderização/infraestrutura na tela do usuário
        await renderizarPaginaErro(error.message || error, app);
    }
}

// Captura cliques de links com o atributo data-link
document.addEventListener("DOMContentLoaded", () => {
    // Se a trava estiver ligada (vinda do motor ou do renderizador de erro), ignora o disparo
    if (executandoCargaSPA) return;

    // PHP-Like Include automatizado
    const scriptRouter = document.createElement("script");
    scriptRouter.src = "./assets/router.js";

    scriptRouter.onerror = (err) => {
        const msg = "Falha catastrófica de carregamento: O arquivo físico './router.js' não foi encontrado na pasta.";
        console.error(`[SPA Framework] ${msg}`, err);
        const app = document.getElementById("app");
        if (app) renderizarPaginaErro(msg, app);
    };

    scriptRouter.onload = () => {
        // Roda a verificação inicial baseada na URL atual da barra
        loadRoute(window.location.pathname);

        document.body.addEventListener("click", e => {
            const link = e.target.closest("[data-link]");
            if (link) {
                e.preventDefault();
                const path = link.getAttribute('href');
                loadRoute(path);
            }
        });

        window.addEventListener("popstate", () => {
            loadRoute(window.location.pathname);
        });
    };

    document.head.appendChild(scriptRouter);
});