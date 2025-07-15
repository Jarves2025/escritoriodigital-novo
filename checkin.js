// clientes.js

// A variável 'supabase' é inicializada em supabaseConfig.js

// --- ESTADO DO MÓDULO ---
let clientesCache = [];
let wizardEtapaAtual = 1;

// --- FUNÇÕES PRINCIPAIS DE RENDERIZAÇÃO ---

/**
 * Ponto de entrada para a visualização de clientes.
 * Busca os dados mais recentes e renderiza a tela principal.
 */
async function carregarClientes() {
    setActiveNav('nav-clientes');
    const contentArea = document.getElementById('content');
    contentArea.innerHTML = `
        <h2><span class="icon">👥</span>Clientes</h2>
        <div class="actions-bar">
            <button id="btnNovoCliente" class="btn btn-primary">
                <span class="icon">➕</span>Novo Cliente
            </button>
        </div>
        <div id="clientesContainer" class="table-container">
            <p>Carregando clientes...</p>
        </div>
    `;

    document.getElementById('btnNovoCliente').addEventListener('click', abrirWizardCliente);

    try {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .order('nome', { ascending: true });

        if (error) throw error;

        clientesCache = data || [];
        renderTabelaClientes();
    } catch (error) {
        console.error('Erro ao carregar clientes:', error.message);
        mostrarToast('Falha ao carregar clientes.', 'error');
        document.getElementById('clientesContainer').innerHTML = '<p class="error-message">Não foi possível carregar os dados.</p>';
    }
}

/**
 * Renderiza a tabela de clientes com os dados do cache.
 */
function renderTabelaClientes() {
    const container = document.getElementById('clientesContainer');
    if (!container) return;

    if (clientesCache.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum cliente cadastrado.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'data-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Email</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');
    clientesCache.forEach(cliente => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cliente.nome || ''}</td>
            <td>${cliente.cpf || ''}</td>
            <td>${cliente.telefone || ''}</td>
            <td>${cliente.email || ''}</td>
            <td class="actions-cell"></td>
        `;
        
        const editButton = document.createElement('button');
        editButton.className = 'btn btn-secondary btn-sm';
        editButton.innerHTML = '<span class="icon">✏️</span> Editar';
        editButton.onclick = () => abrirWizardCliente(cliente.id);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.innerHTML = '<span class="icon">🗑️</span> Excluir';
        deleteButton.onclick = () => handleDeleteCliente(cliente.id);
        
        const actionsCell = tr.querySelector('.actions-cell');
        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
        tbody.appendChild(tr);
    });

    container.innerHTML = '';
    container.appendChild(table);
}

// --- LÓGICA DO WIZARD (MODAL) ---

/**
 * Abre o modal wizard para criar ou editar um cliente.
 * @param {number|null} [clienteId=null] O ID do cliente para editar.
 */
function abrirWizardCliente(clienteId = null) {
    const modal = document.getElementById('clienteModal');
    const form = document.getElementById('clienteWizardForm');
    const titulo = document.getElementById('wizardClienteTitulo');
    const isEditing = clienteId !== null;

    form.reset();
    modal.removeAttribute('data-edit-id');

    if (isEditing) {
        const cliente = clientesCache.find(c => c.id === clienteId);
        if (!cliente) {
            mostrarToast("Cliente não encontrado.", "error");
            return;
        }
        titulo.textContent = 'Editar Cliente';
        // Preenche o formulário com os dados do cliente
        Object.keys(cliente).forEach(key => {
            const input = form.querySelector(`#${key}Cliente`);
            if (input) input.value = cliente[key] || '';
        });
        modal.setAttribute('data-edit-id', clienteId);
    } else {
        titulo.textContent = 'Novo Cliente';
    }

    modal.style.display = 'block';
    wizardNavegarParaEtapa(1);
}

/**
 * Fecha o modal do cliente e reseta seu estado.
 */
function fecharClienteModal() {
    const modal = document.getElementById('clienteModal');
    modal.style.display = 'none';
    modal.removeAttribute('data-edit-id');
}

/**
 * Navega para uma etapa específica do wizard.
 * @param {number} numeroEtapa O número da etapa para exibir.
 */
function wizardNavegarParaEtapa(numeroEtapa) {
    wizardEtapaAtual = numeroEtapa;
    // Esconde todas as etapas
    document.querySelectorAll('.wizard-body').forEach(etapa => etapa.style.display = 'none');
    // Mostra a etapa atual
    document.getElementById(`wizardClienteEtapa${numeroEtapa}`).style.display = 'block';

    // Atualiza os indicadores de passo
    document.querySelectorAll('.wizard-step').forEach((step, index) => {
        step.classList.toggle('active', index + 1 === numeroEtapa);
        step.classList.toggle('completed', index + 1 < numeroEtapa);
    });

    // Se for a última etapa, gera o resumo
    if (numeroEtapa === 4) {
        gerarResumoWizard();
    }
}

function wizardClienteProximaEtapa(proximaEtapa) {
    wizardNavegarParaEtapa(proximaEtapa);
}

function wizardClienteVoltarEtapa(etapaAnterior) {
    wizardNavegarParaEtapa(etapaAnterior);
}

/**
 * Gera o resumo dos dados inseridos na última etapa do wizard.
 */
function gerarResumoWizard() {
    const resumoContainer = document.getElementById('wizardClienteResumo');
    const nome = document.getElementById('nomeCliente').value;
    const cpf = document.getElementById('cpfCliente').value;
    const telefone = document.getElementById('telefoneCliente').value;
    const email = document.getElementById('emailCliente').value;

    resumoContainer.innerHTML = `
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>CPF:</strong> ${cpf}</p>
        <p><strong>Telefone:</strong> ${telefone}</p>
        <p><strong>Email:</strong> ${email || 'Não informado'}</p>
        <p><i>Confira os dados antes de salvar.</i></p>
    `;
}

// --- LÓGICA DE DADOS (CRUD) ---

/**
 * Salva (cria ou atualiza) um cliente a partir dos dados do wizard.
 */
async function salvarClienteWizard() {
    const modal = document.getElementById('clienteModal');
    const clienteId = modal.getAttribute('data-edit-id');
    const isEditing = !!clienteId;

    const dadosCliente = {
        nome: document.getElementById('nomeCliente').value.trim(),
        cpf: document.getElementById('cpfCliente').value.trim(),
        data_nascimento: document.getElementById('dataNascCliente').value || null,
        telefone: document.getElementById('telefoneCliente').value.trim(),
        cep: document.getElementById('cepCliente').value.trim(),
        logradouro: document.getElementById('logradouroCliente').value.trim(),
        numero: document.getElementById('numeroCliente').value.trim(),
        complemento: document.getElementById('complementoCliente').value.trim(),
        bairro: document.getElementById('bairroCliente').value.trim(),
        cidade: document.getElementById('cidadeCliente').value.trim(),
        uf: document.getElementById('ufCliente').value.trim(),
        email: document.getElementById('emailCliente').value.trim(),
        senha_gov: document.getElementById('senhaGovCliente').value.trim(),
        observacoes: document.getElementById('observacoesCliente').value.trim()
    };

    if (!dadosCliente.nome || !dadosCliente.cpf || !dadosCliente.telefone) {
        mostrarToast("Nome, CPF e Telefone são obrigatórios!", "error");
        wizardNavegarParaEtapa(1); // Leva o usuário de volta para a primeira etapa
        return;
    }

    try {
        let error;
        if (isEditing) {
            const { error: updateError } = await supabase.from('clientes').update(dadosCliente).eq('id', clienteId);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('clientes').insert([dadosCliente]);
            error = insertError;
        }

        if (error) {
            // Trata erro de CPF duplicado
            if (error.code === '23505') {
                throw new Error("Já existe um cliente com este CPF.");
            }
            throw error;
        }

        mostrarToast(`Cliente ${isEditing ? 'atualizado' : 'salvo'} com sucesso!`, "success");
        fecharClienteModal();
        carregarClientes(); // Recarrega a lista da página principal
    } catch (error) {
        console.error('Erro ao salvar cliente:', error.message);
        mostrarToast(`Falha ao salvar: ${error.message}`, "error");
    }
}

/**
 * Exclui um cliente do banco de dados.
 * @param {number} clienteId O ID do cliente a ser excluído.
 */
async function handleDeleteCliente(clienteId) {
    if (!confirm("Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.")) {
        return;
    }

    try {
        const { error } = await supabase.from('clientes').delete().eq('id', clienteId);
        if (error) throw error;

        mostrarToast("Cliente excluído com sucesso!", "success");
        // Atualização instantânea da UI
        clientesCache = clientesCache.filter(c => c.id !== clienteId);
        renderTabelaClientes();
    } catch (error) {
        console.error('Erro ao excluir cliente:', error.message);
        mostrarToast("Falha ao excluir o cliente.", "error");
    }
}

// Listener global para fechar o modal ao clicar fora dele
window.addEventListener('click', (event) => {
    const modal = document.getElementById('clienteModal');
    if (event.target === modal) {
        fecharClienteModal();
    }
});
