// Variáveis globais
let currentPage = 'dashboard';

let clientes = [];
let agendamentos = [];
let atendidos = [];

if (localStorage.getItem('clientes')) clientes = JSON.parse(localStorage.getItem('clientes'));
if (localStorage.getItem('agendamentos')) agendamentos = JSON.parse(localStorage.getItem('agendamentos'));
if (localStorage.getItem('atendidos')) atendidos = JSON.parse(localStorage.getItem('atendidos'));

function syncStorage() {
    localStorage.setItem('clientes', JSON.stringify(clientes));
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
    localStorage.setItem('atendidos', JSON.stringify(atendidos));
}

// Toast moderno
function mostrarToast(mensagem, tipo = "success") {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast ' + tipo;
    toast.innerText = mensagem;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => container.removeChild(toast), 500);
    }, 3000);
}

// Login/logout
function login(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    document.getElementById('loginBtn').textContent = 'Entrando...';
    setTimeout(() => {
        if ((email === 'assistente@escritorio.com' && senha === 'assistente123') ||
            (email === 'profissional@escritorio.com' && senha === 'profissional123')) {
            currentUser = { email, perfil: email.includes('assistente') ? 'ASSISTENTE' : 'PROFISSIONAL' };
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('mainContainer').style.display = 'block';
            showDashboard();
        } else {
            mostrarToast('Credenciais inválidas!', 'error');
            document.getElementById('loginBtn').textContent = 'Entrar';
        }
    }, 1000);
    return false;
}

function logout() {
    currentUser = null;
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('mainContainer').style.display = 'none';
    document.getElementById('email').value = '';
    document.getElementById('senha').value = '';
    document.getElementById('loginBtn').textContent = 'Entrar';
}

function setActiveNav(navId) {
    document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
    document.getElementById(navId).classList.add('active');
}

function showPainel() {
    window.open("painel.html", "_blank");
}

function hojeISO() {
    return new Date().toISOString().split('T')[0];
}

// ---------------- MÁSCARAS E ENDEREÇO ---------------- //

// Máscara CPF (input)
function mascaraCPF(campo) {
    let v = campo.value.replace(/\D/g, '');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    campo.value = v;
}

// Máscara Telefone (input)
function mascaraTelefone(campo) {
    let v = campo.value.replace(/\D/g, '');
    v = v.replace(/^(\d\d)(\d)/g, "($1) $2");
    if (v.length <= 13) {
        v = v.replace(/(\d{4})(\d)/, "$1-$2");
    } else {
        v = v.replace(/(\d{5})(\d)/, "$1-$2");
    }
    campo.value = v.slice(0, 15);
}

// CEP: busca ViaCEP e preenche campos
function buscarCEP(cep, cb) {
    cep = cep.replace(/\D/g, '');
    if (cep.length !== 8) return;
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(r => r.json())
        .then(data => cb(data))
        .catch(() => cb(null));
}

// Preenche UFs no select
function preencherUFs(selectId) {
    const ufs = [
        "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
        "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
        "RS","RO","RR","SC","SP","SE","TO"
    ];
    const sel = document.getElementById(selectId);
    sel.innerHTML = '<option value="">UF</option>' + ufs.map(uf => `<option value="${uf}">${uf}</option>`).join('');
}

// Busca cidades por UF (API IBGE)
function buscarCidadesPorUF(uf, cb) {
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
        .then(r => r.json())
        .then(dados => cb(dados.map(c => c.nome)))
        .catch(() => cb([]));
}

// Deixa campo nome só em maiúsculo
function toUpperNome(el) {
    el.value = el.value.toUpperCase();
}

// Inicialização ao carregar
window.onload = () => {
    if (!currentUser) {
        document.getElementById('loginContainer').style.display = 'flex';
        document.getElementById('mainContainer').style.display = 'none';
    }
    window.addEventListener('storage', function () {
        if (currentPage === 'fila') showFila();
    });

    // Máscaras cadastro cliente
    if (document.getElementById('cpfCliente')) {
        document.getElementById('cpfCliente').addEventListener('input', function(){ mascaraCPF(this); });
    }
    if (document.getElementById('telefoneCliente')) {
        document.getElementById('telefoneCliente').addEventListener('input', function(){ mascaraTelefone(this); });
    }
    if (document.getElementById('cepCliente')) {
        document.getElementById('cepCliente').addEventListener('input', function(){
            let cep = this.value.replace(/\D/g, '');
            if (cep.length === 8) {
                buscarCEP(cep, function(data) {
                    if (data && !data.erro) {
                        document.getElementById('logradouroCliente').value = data.logradouro || '';
                        document.getElementById('bairroCliente').value = data.bairro || '';
                        document.getElementById('cidadeCliente').value = data.localidade || '';
                        document.getElementById('ufCliente').value = data.uf || '';
                    }
                });
            }
        });
    }
    if (document.getElementById('ufCliente')) {
        preencherUFs('ufCliente');
        document.getElementById('ufCliente').addEventListener('change', function() {
            const uf = this.value;
            if (uf && document.getElementById('cidadeCliente')) {
                buscarCidadesPorUF(uf, function(lista) {
                    // Para facilitar, se lista vier, vira datalist
                    let datalist = document.getElementById('datalistCidades');
                    if (!datalist) {
                        datalist = document.createElement('datalist');
                        datalist.id = 'datalistCidades';
                        document.body.appendChild(datalist);
                        document.getElementById('cidadeCliente').setAttribute('list','datalistCidades');
                    }
                    datalist.innerHTML = lista.map(nome => `<option value="${nome}">`).join('');
                });
            }
        });
    }
    if (document.getElementById('nomeCliente')) {
        document.getElementById('nomeCliente').addEventListener('input', function(){ toUpperNome(this); });
    }
};
