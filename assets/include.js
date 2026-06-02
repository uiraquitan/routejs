async function include() {

    const elements = document.querySelectorAll('[include]');

    for (const el of elements) {

        let file = el.getAttribute('include');

        // pega base do site automaticamente
        const base = window.location.origin + '/';
        console.log(base)
        const url = base + file.replace(/^\/+/, '');

        try {

            const response = await fetch(url);

            if (!response.ok) {
                console.error("Falha ao carregar:", url);
                continue;
            }

            el.innerHTML = await response.text();

        } catch (err) {
            console.error("Erro include:", url, err);
        }
    }
}