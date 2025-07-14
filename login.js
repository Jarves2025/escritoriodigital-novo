let currentUser = null;

function login(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const senha = document.getElementById('senha').value.trim();


    // Lógica simples para exemplo; personalize para seu caso real
    let perfil = "";
    if (email === "gestor@escritorio.com" && senha === "gestor123") perfil = "GESTOR";
    else if (email === "profissional@escritorio.com" && senha === "prof123") perfil = "PROFISSIONAL";
    else if (email === "assistente@escritorio.com" && senha === "assist123") perfil = "ASSISTENTE";
    else {
        mostrarToast('Usuário ou senha inválidos', 'error');
        return false;
    }

    // Salva usuário logado
    currentUser = { email, perfil };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('mainContainer').style.display = 'block';

    // Mostra menu Gestão da Agenda só para gestor
    if (perfil === 'GESTOR') {
        document.getElementById('nav-gestaoagenda').style.display = '';
    } else {
        document.getElementById('nav-gestaoagenda').style.display = 'none';
    }

    showDashboard();
    return false;
}

// Quando recarrega a página (já está logado)
window.onload = function() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('mainContainer').style.display = 'block';
        if (currentUser.perfil === 'GESTOR') {
            document.getElementById('nav-gestaoagenda').style.display = '';
        }
        showDashboard();
    }
}

// Função de logout (exemplo)
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    document.getElementById('mainContainer').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('nav-gestaoagenda').style.display = 'none';
}
