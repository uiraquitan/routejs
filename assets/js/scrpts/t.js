// ./scrpts/t.js
export default function t() {
    const teste = document.querySelectorAll("#teste");
    
    if (teste) {
        console.log(teste);
    } else {
        console.error("Elemento #teste ainda não existe na página!");
    }
}