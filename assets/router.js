export default class Router {

    constructor() {
        this.routes = {};
        this.app = document.getElementById('app');

        window.addEventListener('popstate', () => {
            this.load(location.pathname);
        });
    }

    add(path, file) {
        this.routes[path] = file;
    }

    async load(path) {

        const file = this.routes[path];

        if (!file) {
            this.app.innerHTML = "<h1>404</h1>";
            return;
        }

        const html = await fetch(file).then(r => r.text());

        this.app.innerHTML = html;
    }

    go(path) {
        history.pushState({}, "", path);
        this.load(path);
    }
}