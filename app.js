// ==========================
// INCLUDE (tipo PHP include)
// ==========================
async function include() {

    const elements = document.querySelectorAll('[include]');

    for (const el of elements) {

        const file = el.getAttribute('include');

        const html = await fetch(file).then(r => r.text());

        el.innerHTML = html;
    }
}

// ==========================
// ROUTER (troca de páginas)
// ==========================
const routes = {
    "/": "./assets/pages/home.html",
    "/sobre": "./assets/pages/sobre.html",
    "/contato": "./assets/pages/contato.html"
};

async function loadRoute(path) {

    const app = document.getElementById("app");

    const file = routes[path] || routes["/"];

    const html = await fetch(file).then(r => r.text());

    app.innerHTML = html;

    await include(); // 🔥 ISSO AQUI ESTAVA FALTANDO

    history.pushState({}, "", path);
}

// ==========================
// LINKS SPA
// ==========================
document.addEventListener("click", (e) => {

    const link = e.target.closest("[data-link]");

    if (!link) return;

    e.preventDefault();

    loadRoute(link.getAttribute("href"));
});

// ==========================
// BACK BUTTON
// ==========================
window.addEventListener("popstate", () => {
    loadRoute(location.pathname);
});

// ==========================
// START APP
// ==========================
document.addEventListener("DOMContentLoaded", () => {

    loadRoute(location.pathname === "/" ? "/" : location.pathname);

});