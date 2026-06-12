document.addEventListener("DOMContentLoaded", function () {
    // CÁLCULO DINÂMICO DE IDADE EM JAVASCRIPT
    function calcularIdade(dataNascimento) {
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();
        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }
        return idade;
    }

    const containerIdade = document.getElementById("exibir-idade");
    if (containerIdade && containerIdade.getAttribute("data-ativo") === "sim") {
        const minhaDataNascimento = "1994-06-15"; // Ajuste seu ano-mês-dia aqui
        document.getElementById("idade-calculada").innerText = calcularIdade(minhaDataNascimento);
    } else if (containerIdade) {
        containerIdade.style.display = "none";
    }

    // Lógica dos Dropdowns Laterais
    document.querySelectorAll('.menu-trigger').forEach(button => {
        button.addEventListener('click', () => {
            const currentGroup = button.parentElement;
            document.querySelectorAll('.menu-group').forEach(group => {
                if (group !== currentGroup) group.classList.remove('active');
            });
            currentGroup.classList.toggle('active');
        });
    });

    // Alternância de Abas
    const subLinks = document.querySelectorAll('.sub-menu li a');
    const sections = document.querySelectorAll('main section');
    const sidebar = document.getElementById('sidebar');

    subLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            subLinks.forEach(l => l.classList.remove('active-link'));
            link.classList.add('active-link');

            const targetId = link.getAttribute('href');
            sections.forEach(section => section.classList.remove('active-section'));

            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.classList.add('active-section');
                document.getElementById('mainContent').scrollTop = 0;
            }

            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    // 4. ALTERNAR MENU MOBILE (Com checagem de segurança para evitar o Uncaught TypeError)
    const btnMenu = document.getElementById('btnMenu');
    if (btnMenu && sidebar) {
        btnMenu.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
});