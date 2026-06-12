// sw.js
const CACHE_NAME = 'spa-cache-v1';

self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(clients.claim());
});

// Intercepta as requisições do navegador
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    // Se for uma navegação de página (digitar na URL ou F5) e não for um arquivo físico (.js, .css, .html)
    if (e.request.mode === 'navigate' && !url.pathname.includes('.')) {
        // Redireciona internamente para o index.html sem alterar a URL visível
        e.respondWith(fetch('/index.html'));
    }
});