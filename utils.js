// utils.js

// ---- VARIÁVEIS GLOBAIS AUXILIARES ----
let currentPage = '';

// ---- TOAST SIMPLES ----
function mostrarToast(mensagem, tipo = "info") {
    // Exemplo simples usando alert, mas você pode customizar para seu toast visual
    alert(mensagem);
    // Ou substitua por sua lógica de toast HTML personalizada
}

// ---- MÁSCARAS ----
function mascaraCPF(valor) {
    valor = valor.replace(/\D/g, "");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return valor;
}
function mascaraTelefone(valor) {
    valor = valor.replace(/\D/g, "");
    valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
    valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
    return valor;
}

// ---- MENU ATIVO ----
function setActiveNav(navId) {
    document.querySelectorAll("nav a").forEach(el => el.classList.remove("active"));
    let el = document.getElementById(navId);
    if (el) el.classList.add("active");
}

// ---- FORMATA DATA ----
function formatarDataISO(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

// ---- VOLTA PARA DASHBOARD (caso precise) ----
function voltarDashboard() {
    showDashboard();
}
