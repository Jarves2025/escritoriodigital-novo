// A variável 'supabase' é inicializada no arquivo supabaseConfig.js
// e já deve estar disponível globalmente ou ser importada.

// --- GERENCIAMENTO DE SESSÃO E AUTENTICAÇÃO ---

/**
 * Adiciona os listeners de eventos e verifica a sessão do usuário
 * assim que o conteúdo da página for carregado.
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const logoutButton = document.getElementById('nav-logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    checkUserSession();
});

/**
 * Verifica se há um usuário logado na sessão do Supabase.
 * Se houver, carrega o dashboard. Caso contrário, mostra a tela de login.
 */
async function checkUserSession() {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        console.log("Sessão ativa encontrada. Carregando aplicação...");
        await loadUserProfileAndShowDashboard(session.user);
    } else {
        console.log("Nenhuma sessão ativa. Exibindo tela de login.");
        showLoginScreen();
    }
}

/**
 * Lida com o evento de submit do formulário de login.
 * @param {Event} event O objeto do evento do formulário.
 */
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const loginBtn = document.getElementById("loginBtn");

    if (!email || !senha) {
        mostrarToast("Por favor, preencha o email e a senha.", "error");
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Entrando...";

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
    });

    if (error) {
        mostrarToast("Email ou senha inválidos.", "error");
        console.error('Erro no login:', error.message);
        loginBtn.disabled = false;
        loginBtn.textContent = "Entrar";
        return;
    }

    if (data.user) {
        console.log("Login realizado com sucesso!");
        await loadUserProfileAndShowDashboard(data.user);
    }
}

/**
 * Lida com o clique no botão de logout.
 * @param {Event} event O objeto do evento do clique.
 */
async function handleLogout(event) {
    event.preventDefault();
    console.log("Realizando logout...");

    const { error } = await supabase.auth.signOut();

    if (error) {
        mostrarToast("Erro ao sair. Tente novamente.", "error");
        console.error('Erro no logout:', error.message);
        return;
    }

    showLoginScreen();
}

/**
 * Busca o perfil do usuário e exibe o painel principal da aplicação.
 * @param {Object} user O objeto do usuário retornado pelo Supabase Auth.
 */
async function loadUserProfileAndShowDashboard(user) {
    // Supondo que sua tabela de perfis se chama 'usuarios'
    const { data: perfilUsuario, error } = await supabase
        .from('usuarios')
        .select('perfil')
        .eq('id', user.id)
        .single();

    if (error) {
        mostrarToast("Erro ao carregar os dados do usuário.", "error");
        console.error("Erro ao buscar perfil:", error.message);
    }

    showMainScreen();

    if (perfilUsuario && perfilUsuario.perfil === "admin") {
        document.getElementById("nav-gestaoagenda").style.display = "block";
    } else {
        document.getElementById("nav-gestaoagenda").style.display = "none";
    }

    showDashboard(); // Função definida em dashboard.js
}


// --- FUNÇÕES DE CONTROLE DA INTERFACE (UI) ---

/**
 * Exibe a tela de login e esconde a tela principal.
 */
function showLoginScreen() {
    document.getElementById("loginContainer").style.display = "flex";
    document.getElementById("mainContainer").style.display = "none";

    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.reset();

    const loginBtn = document.getElementById("loginBtn");
    if(loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = "Entrar";
    }
}

/**
 * Exibe a tela principal e esconde a tela de login.
 */
function showMainScreen() {
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("mainContainer").style.display = "flex";
}
