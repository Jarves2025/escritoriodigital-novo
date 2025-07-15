var supabase = window._supabase;

// Função de login (exemplo: tabela "usuarios" com campos "email" e "senha")
async function login(event) {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!email || !senha) {
        mostrarToast("Preencha o email e a senha!", "error");
        return false;
    }

    // Busca usuário correspondente no Supabase
    let { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('senha', senha);

    if (error) {
        mostrarToast("Erro ao acessar banco de dados!", "error");
        return false;
    }
    if (!data || !data.length) {
        mostrarToast("Usuário ou senha inválidos!", "error");
        return false;
    }

    // Autenticado — pode gravar na session/localStorage se quiser (apenas nome/id/perfil)
    const usuario = data[0];
    window.usuarioLogado = usuario; // ou use localStorage/sessionStorage conforme preferir

    // Exemplo: exibe menus conforme perfil (se houver)
    if (usuario.perfil === "admin") {
        document.getElementById("nav-gestaoagenda").style.display = "";
        document.getElementById("nav-clientes").style.display = "";
        // ...outros menus...
    }
    // Esconde tela de login e mostra dashboard
    document.getElementById("loginContainer").style.display = "none";
    showDashboard();
    return false;
}

// Função de logout
function logout() {
    window.usuarioLogado = null;
    // Limpa campos e volta tela de login
    document.getElementById("loginContainer").style.display = "";
    document.getElementById("content").innerHTML = "";
}

// Função opcional para checar se está logado ao abrir a página
function checarLogin() {
    if (!window.usuarioLogado) {
        document.getElementById("loginContainer").style.display = "";
        document.getElementById("content").innerHTML = "";
    } else {
        document.getElementById("loginContainer").style.display = "none";
        showDashboard();
    }
}
