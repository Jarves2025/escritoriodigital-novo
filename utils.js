// utils.js

/**
 * Exibe uma notificação (toast) na tela de forma não-bloqueante.
 * A mensagem desaparece automaticamente após um tempo.
 * @param {string} mensagem O texto a ser exibido.
 * @param {string} [tipo='info'] O tipo de toast ('success', 'error', 'info'). Afeta a cor.
 * @param {number} [duracao=4000] Duração em milissegundos para o toast ficar visível.
 */
function mostrarToast(mensagem, tipo = 'info', duracao = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) {
        console.error('Elemento #toastContainer não encontrado no DOM. Usando alert como fallback.');
        alert(mensagem);
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensagem;

    container.appendChild(toast);

    // Adiciona uma classe para a animação de entrada
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Define um tempo para remover o toast
    setTimeout(() => {
        toast.classList.remove('show');
        // Espera a animação de saída terminar antes de remover o elemento do DOM
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, duracao);
}

/**
 * Aplica uma máscara de CPF (###.###.###-##) a uma string.
 * Deve ser usada no evento 'oninput' de um campo de texto.
 * Exemplo no HTML: oninput="this.value = mascaraCPF(this.value)"
 * @param {string} valor O valor atual do campo.
 * @returns {string} O valor com a máscara aplicada.
 */
function mascaraCPF(valor) {
    if (!valor) return "";
    return valor
        .replace(/\D/g, "") // Remove tudo o que não é dígito
        .replace(/(\d{3})(\d)/, "$1.$2") // Coloca um ponto entre o terceiro e o quarto dígitos
        .replace(/(\d{3})(\d)/, "$1.$2") // Coloca um ponto entre o sexto e o sétimo dígitos
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // Coloca um hífen antes dos dois últimos dígitos
}

/**
 * Aplica uma máscara de telefone ((##) #####-####) a uma string.
 * Deve ser usada no evento 'oninput' de um campo de texto.
 * Exemplo no HTML: oninput="this.value = mascaraTelefone(this.value)"
 * @param {string} valor O valor atual do campo.
 * @returns {string} O valor com a máscara aplicada.
 */
function mascaraTelefone(valor) {
    if (!valor) return "";
    return valor
        .replace(/\D/g, "") // Remove tudo o que não é dígito
        .replace(/^(\d{2})(\d)/g, "($1) $2") // Coloca parênteses em volta dos dois primeiros dígitos
        .replace(/(\d{5})(\d)/, "$1-$2"); // Coloca hífen depois do quinto dígito
}

/**
 * Destaca o item de navegação ativo na barra lateral.
 * @param {string} navId O ID do elemento de navegação a ser ativado (ex: 'nav-dashboard').
 */
function setActiveNav(navId) {
    document.querySelectorAll("nav.sidebar a").forEach(link => link.classList.remove("active"));

    const activeLink = document.getElementById(navId);
    if (activeLink) {
        activeLink.classList.add("active");
    }
}

/**
 * Formata uma data do formato ISO (AAAA-MM-DD) para o formato brasileiro (DD/MM/AAAA).
 * @param {string} dataISO A data em formato ISO.
 * @returns {string} A data formatada ou uma string vazia se a entrada for inválida.
 */
function formatarDataISO(dataISO) {
    if (!dataISO || !/^\d{4}-\d{2}-\d{2}$/.test(dataISO)) {
        return '';
    }
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}
