const SUPABASE_URL = 'https://jdflixpbupzwnictncbp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZmxpeHBidXB6d25pY3RuY2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDA4MjksImV4cCI6MjA2ODA3NjgyOX0.pNMVYVU5tw42_qMUhdJI1SE59xs5upVYz0RSyR81AMk';

window._supabase = window._supabase || window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const supabase = window._supabase;

// Lista local SOMENTE para exibir a tela, sempre vinda do banco!
let clientes = [];

// Carrega lista de clientes do Supabase
function carregarClientes() {
    supabase
        .from('clientes')
        .select('*')
        .order('nome', { ascending: true })
        .then(({ data, error }) => {
            clientes = data || [];
            showClientes();
        });
}

// Mostra a tela/lista de clientes
function showClientes() {
    currentPage = 'clientes';
    setActiveNav('nav-clientes');

    let html = `
        <h2>Clientes</h2>
        <button class="btn btn-primary" onclick="abrirCadastroCliente()">Novo Cliente</button>
        <table>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Telefone</th>
                    <th>Email</th>
                    <th>Cidade</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;
    if (!clientes.length) {
        html += `<tr><td colspan="6" style="color:#888; text-align:center;">Nenhum cliente cadastrado</td></tr>`;
    } else {
        clientes.forEach(cli => {
            html += `
            <tr>
                <td>${cli.nome}</td>
                <td>${cli.cpf || ""}</td>
                <td>${cli.telefone || ""}</td>
                <td>${cli.email || ""}</td>
                <td>${cli.cidade || ""}</td>
                <td>
                    <button class="btn btn-secondary" onclick="editarCliente(${cli.id})">Editar</button>
                    <button class="btn btn-danger" onclick="excluirCliente(${cli.id})">Excluir</button>
                </td>
            </tr>
            `;
        });
    }
    html += `</tbody></table>`;
    document.getElementById('content').innerHTML = html;
}

// Abrir modal wizard do cliente
function abrirCadastroCliente() {
    document.getElementById('wizardClienteTitulo').innerText = 'Novo Cliente';
    document.getElementById('clienteModal').style.display = 'block';
    resetarWizardCliente();
    document.getElementById('clienteModal').removeAttribute('data-edit-id');
}

// Função chamada pelo botão "Salvar Cliente" no modal wizard
function salvarClienteWizard() {
    const novoCli = {
        nome: document.getElementById('nomeCliente').value.trim(),
        cpf: document.getElementById('cpfCliente').value.trim(),
        telefone: document.getElementById('telefoneCliente').value.trim(),
        email: document.getElementById('emailCliente').value.trim(),
        cep: document.getElementById('cepCliente').value.trim(),
        logradouro: document.getElementById('logradouroCliente').value.trim(),
        numero: document.getElementById('numeroCliente').value.trim(),
        complemento: document.getElementById('complementoCliente').value.trim(),
        bairro: document.getElementById('bairroCliente').value.trim(),
        cidade: document.getElementById('cidadeCliente').value.trim(),
        uf: document.getElementById('ufCliente').value.trim(),
        senha_gov: document.getElementById('senhaGovCliente').value.trim(),
        observacoes: document.getElementById('observacoesCliente').value.trim()
    };
    if (!novoCli.nome || !novoCli.cpf || !novoCli.telefone) {
        mostrarToast("Preencha todos os campos obrigatórios!", "error");
        return;
    }
    const modal = document.getElementById('clienteModal');
    const editId = modal.getAttribute('data-edit-id');
    if (editId) {
        supabase.from('clientes').update(novoCli).eq('id', editId).then(({ error }) => {
            if (!error) {
                mostrarToast("Cliente atualizado com sucesso!", "success");
                fecharClienteModal();
                carregarClientes();
            } else {
                mostrarToast("Erro ao editar cliente!", "error");
            }
            modal.removeAttribute('data-edit-id');
        });
    } else {
        supabase.from('clientes').insert([novoCli]).then(({ error }) => {
            if (!error) {
                mostrarToast("Cliente cadastrado com sucesso!", "success");
                fecharClienteModal();
                carregarClientes();
            } else if (error && error.code === "23505") {
                mostrarToast("Já existe um cliente com esse CPF!", "error");
            } else {
                mostrarToast("Erro ao salvar cliente!", "error");
            }
        });
    }
}

function fecharClienteModal() {
    document.getElementById('clienteModal').style.display = 'none';
    resetarWizardCliente();
    document.getElementById('clienteModal').removeAttribute('data-edit-id');
}

function resetarWizardCliente() {
    document.getElementById('clienteWizardForm').reset();
    wizardClienteVoltarEtapa(1);
    document.getElementById('wizardClienteResumo').innerHTML = "";
}

window.onclick = function(event) {
    const modal = document.getElementById('clienteModal');
    if (event.target === modal) {
        fecharClienteModal();
    }
};

function editarCliente(id) {
    const cli = clientes.find(c => c.id === id);
    if (!cli) return;
    document.getElementById('wizardClienteTitulo').innerText = 'Editar Cliente';
    document.getElementById('clienteModal').style.display = 'block';
    document.getElementById('nomeCliente').value = cli.nome || '';
    document.getElementById('cpfCliente').value = cli.cpf || '';
    document.getElementById('telefoneCliente').value = cli.telefone || '';
    document.getElementById('emailCliente').value = cli.email || '';
    document.getElementById('cepCliente').value = cli.cep || '';
    document.getElementById('logradouroCliente').value = cli.logradouro || '';
    document.getElementById('numeroCliente').value = cli.numero || '';
    document.getElementById('complementoCliente').value = cli.complemento || '';
    document.getElementById('bairroCliente').value = cli.bairro || '';
    document.getElementById('cidadeCliente').value = cli.cidade || '';
    document.getElementById('ufCliente').value = cli.uf || '';
    document.getElementById('senhaGovCliente').value = cli.senha_gov || '';
    document.getElementById('observacoesCliente').value = cli.observacoes || '';
    document.getElementById('clienteModal').setAttribute('data-edit-id', id);
    wizardClienteVoltarEtapa(1);
}

function excluirCliente(id) {
    if (!confirm('Excluir este cliente?')) return;
    supabase.from('clientes').delete().eq('id', id).then(({ error }) => {
        if (!error) {
            mostrarToast("Cliente excluído!", "success");
            carregarClientes();
        } else {
            mostrarToast("Erro ao excluir cliente!", "error");
        }
    });
}
