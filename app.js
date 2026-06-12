window.onRouteLoad = null;

// SUA FUNÇÃO ORIGINAL COMPLETA E INTACTA
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
            }
        } catch (error) {
            console.error(`Erro ao incluir componente: ${file}`, error);
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
            scriptNovo.setAttribute(attr.name, attr.value);
        });
        
        scriptNovo.setAttribute("data-page-script", "true");

        if (scriptAntigo.src) {
            try {
                const response = await fetch(scriptAntigo.src);
                if (response.ok) {
                    scriptNovo.innerHTML = await response.text();
                }
            } catch (err) {
                console.error(`Erro ao carregar script: ${scriptAntigo.src}`, err);
            }
        } else {
            scriptNovo.innerHTML = scriptAntigo.innerHTML;
        }

        document.head.appendChild(scriptNovo);
    }
}

// Variável de controle para evitar o loop infinito de eventos
let executandoCargaSPA = false;

// Gerenciador de Carga de Rotas mantendo o seu fluxo original
async function loadRoute(path) {
    const app = document.getElementById("app");
    
    // Puxa do objeto global que o router.js vai expor
    const mapaRotas = window.routes || {};
    const file = mapaRotas[path] || mapaRotas["/"];
    
    if (!file) {
        console.error(`Nenhuma rota definida para: ${path}`);
        return;
    }
    
    try {
        executandoCargaSPA = true; // Ativa a trava antes de carregar

        const response = await fetch(file);
        if (!response.ok) throw new Error(`Arquivo não encontrado: ${file}`);
        const html = await response.text();

        // 1. Injeta o HTML puro da página
        app.innerHTML = html;
        
        // 2. O seu include original rodando perfeitamente
        await include();

        // 3. Executa os scripts que vierem na página (com ou sem module)
        await executarScriptsDoConteudo(app);

        // 4. 🔥 O TRUQUE CORRIGIDO: Dispara o evento para o script do aluno, 
        // mas a trava 'executandoCargaSPA' impede o app.js de reiniciar o ciclo.
        document.dispatchEvent(new Event("DOMContentLoaded"));

        // 5. Atualiza o Histórico de navegação (PushState)
        if (window.location.pathname !== path) {
            history.pushState({}, "", path);
        }

        // 6. Dispara o seu gatilho global original caso precise
        if (typeof window.onRouteLoad === "function") {
            window.onRouteLoad();
        }

        // Libera a trava após a execução completa de todas as lógicas
        setTimeout(() => { executandoCargaSPA = false; }, 50);

    } catch (error) {
        executandoCargaSPA = false;
        console.error(`Erro crítico ao carregar rota: ${file}`, error);
    }
}

// Captura cliques de links com o atributo data-link
document.addEventListener("DOMContentLoaded", () => {
    // 🔥 Se o evento foi disparado pelo próprio mecanismo interno do SPA, ignora para não gerar o loop
    if (executandoCargaSPA) return;

    // 🔥 O SEU INCLUDE ESTILO PHP: Injeta o router.js em tempo de execução
    const scriptRouter = document.createElement("script");
    scriptRouter.src = "./router.js"; 
    
    // Só dispara o motor e os escutadores quando o arquivo externo for totalmente lido
    scriptRouter.onload = () => {
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