// agendamentos.js

// A variável 'supabase' é inicializada em supabaseConfig.js

// --- ESTADO DO MÓDULO ---
// Armazena os agendamentos localmente para evitar múltiplas chamadas ao banco de dados.
let agendamentosCache = [];

// --- FUNÇÕES PRINCIPAIS ---

/**
 * Ponto de entrada para a visualização de agendamentos.
 * Busca os dados mais recentes do Supabase e renderiza a tela.
 */
async function showAgendamentos() {
    setActiveNav('nav-agendamentos');
    const contentArea = document.getElementById('content');
    contentArea.innerHTML = `
        <h2><span class="icon">📅</span>Agendamentos</h2>
        <div class="actions-bar">
            <button id="btnNovoAgendamento" class="btn btn-primary">
                <span class="icon">➕</span>Novo Agendamento
            </button>
        </div>
        <div id="agendamentosContainer" class="table-container">
            <p>Carregando agendamentos...</p>
        </div>
    `;

    document.getElementById('btnNovoAgendamento').addEventListener('click', renderFormularioAgendamento);

    try {
        const { data, error } = await supabase
            .from('agendamentos')
            .select('*')
            .order('data', { ascending: true })
            .order('horario', { ascending: true });

        if (error) {
            throw error; // Lança o erro para o bloco catch
        }

        agendamentosCache = data || [];
        renderTabelaAgendamentos();
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error.message);
        mostrarToast('Falha ao carregar agendamentos.', 'error');
        document.getElementById('agendamentosContainer').innerHTML = '<p class="error-message">Não foi possível carregar os dados. Tente novamente mais tarde.</p>';
    }
}

// --- RENDERIZAÇÃO DA INTERFACE (UI) ---

/**
 * Renderiza a tabela de agendamentos com os dados do cache.
 */
function renderTabelaAgendamentos() {
    const container = document.getElementById('agendamentosContainer');
    if (!container) return;

    if (agendamentosCache.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum agendamento cadastrado.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'data-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Data</th>
                <th>Horário</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Status</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');
    agendamentosCache.forEach(ag => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatarDataISO(ag.data)}</td>
            <td>${ag.horario}</td>
            <td>${ag.nome || ''}</td>
            <td>${ag.cpf || ''}</td>
            <td>${ag.telefone || ''}</td>
            <td><span class="status status-${(ag.status || 'agendado').toLowerCase()}">${ag.status || 'AGENDADO'}</span></td>
            <td class="actions-cell"></td>
        `;
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.innerHTML = '<span class="icon">🗑️</span> Excluir';
        deleteButton.onclick = () => handleDeleteAgendamento(ag.id);
        
        tr.querySelector('.actions-cell').appendChild(deleteButton);
        tbody.appendChild(tr);
    });

    container.innerHTML = '';
    container.appendChild(table);
}

/**
 * Renderiza o formulário para criar ou editar um agendamento.
 */
async function renderFormularioAgendamento() {
    setActiveNav('nav-agendamentos');
    const contentArea = document.getElementById('content');
    contentArea.innerHTML = `
        <h2><span class="icon">➕</span>Novo Agendamento</h2>
        <form id="formAgendamento" class="form-layout">
            <div class="form-group">
                <label for="cpfAgendamento">CPF do Cliente *</label>
                <input type="text" id="cpfAgendamento" required maxlength="14" placeholder="000.000.000-00">
            </div>
            <div class="form-group">
                <label for="nomeAgendamento">Nome Completo *</label>
                <input type="text" id="nomeAgendamento" required placeholder="Nome do cliente">
            </div>
            <div class="form-group">
                <label for="telefoneAgendamento">Telefone *</label>
                <input type="text" id="telefoneAgendamento" required maxlength="15" placeholder="(00) 00000-0000">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="dataAgendamento">Data *</label>
                    <select id="dataAgendamento" required></select>
                </div>
                <div class="form-group">
                    <label for="horarioSelect">Horário *</label>
                    <select id="horarioSelect" required disabled>
                        <option value="">Escolha uma data</option>
                    </select>
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-success">Salvar Agendamento</button>
                <button type="button" id="btnCancelar" class="btn btn-secondary">Cancelar</button>
            </div>
        </form>
    `;

    // Adiciona listeners de evento
    document.getElementById('btnCancelar').addEventListener('click', showAgendamentos);
    document.getElementById('formAgendamento').addEventListener('submit', handleSaveAgendamento);
    
    // Aplica máscaras usando as funções de utils.js
    document.getElementById('cpfAgendamento').addEventListener('input', (e) => { e.target.value = mascaraCPF(e.target.value); });
    document.getElementById('telefoneAgendamento').addEventListener('input', (e) => { e.target.value = mascaraTelefone(e.target.value); });

    // Carrega as opções de data e horário
    await popularDatasDisponiveis();
    document.getElementById('dataAgendamento').addEventListener('change', handleDataChange);
}

// --- LÓGICA DE DADOS E EVENTOS ---

/**
 * Salva um novo agendamento no banco de dados.
 * @param {Event} event O evento de submit do formulário.
 */
async function handleSaveAgendamento(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');

    const novoAgendamento = {
        cpf: document.getElementById('cpfAgendamento').value.trim(),
        nome: document.getElementById('nomeAgendamento').value.trim(),
        telefone: document.getElementById('telefoneAgendamento').value.trim(),
        data: document.getElementById('dataAgendamento').value,
        horario: document.getElementById('horarioSelect').value,
        status: "AGENDADO"
    };

    if (!novoAgendamento.data || !novoAgendamento.horario) {
        mostrarToast("Por favor, selecione data e horário.", "error");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Salvando...';

    try {
        const { error } = await supabase.from('agendamentos').insert([novoAgendamento]);
        if (error) throw error;

        mostrarToast("Agendamento realizado com sucesso!", "success");
        showAgendamentos(); // Volta para a lista
    } catch (error) {
        console.error('Erro ao salvar agendamento:', error.message);
        mostrarToast(`Falha ao salvar: ${error.message}`, "error");
        submitButton.disabled = false;
        submitButton.textContent = 'Salvar Agendamento';
    }
}

/**
 * Exclui um agendamento do banco de dados.
 * @param {number} id O ID do agendamento a ser excluído.
 */
async function handleDeleteAgendamento(id) {
    if (!confirm("Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.")) {
        return;
    }

    try {
        const { error } = await supabase.from('agendamentos').delete().eq('id', id);
        if (error) throw error;

        mostrarToast("Agendamento excluído com sucesso!", "success");
        // Remove o item do cache e renderiza a tabela novamente para uma atualização instantânea
        agendamentosCache = agendamentosCache.filter(ag => ag.id !== id);
        renderTabelaAgendamentos();
    } catch (error) {
        console.error('Erro ao excluir agendamento:', error.message);
        mostrarToast("Falha ao excluir o agendamento.", "error");
    }
}

/**
 * Lida com a mudança da data no formulário, carregando os horários disponíveis.
 */
async function handleDataChange() {
    const dataSelecionada = document.getElementById('dataAgendamento').value;
    const horarioSelect = document.getElementById('horarioSelect');
    horarioSelect.innerHTML = '<option value="">Carregando...</option>';
    horarioSelect.disabled = true;

    if (!dataSelecionada) {
        horarioSelect.innerHTML = '<option value="">Escolha uma data</option>';
        return;
    }

    try {
        // Supondo que 'agendaGestor' é uma variável global ou pode ser buscada
        if (typeof agendaGestor === 'undefined') {
            throw new Error("Configurações da agenda do gestor não encontradas.");
        }

        // Filtra os blocos de horário para a data selecionada
        const blocosDoDia = agendaGestor.filter(d => d.data === dataSelecionada);
        const todosHorariosPossiveis = new Set();
        blocosDoDia.forEach(bloco => {
            const inicio = new Date(`1970-01-01T${bloco.inicio}`);
            const fim = new Date(`1970-01-01T${bloco.fim}`);
            for (let dt = inicio; dt < fim; dt.setMinutes(dt.getMinutes() + 30)) {
                todosHorariosPossiveis.add(dt.toTimeString().substring(0, 5));
            }
        });

        // Filtra horários que já foram agendados
        const horariosOcupados = new Set(
            agendamentosCache
                .filter(ag => ag.data === dataSelecionada)
                .map(ag => ag.horario)
        );

        const horariosDisponiveis = [...todosHorariosPossiveis].filter(h => !horariosOcupados.has(h));

        horarioSelect.innerHTML = '<option value="">Selecione um horário</option>';
        if (horariosDisponiveis.length > 0) {
            horariosDisponiveis.forEach(horario => {
                horarioSelect.innerHTML += `<option value="${horario}">${horario}</option>`;
            });
            horarioSelect.disabled = false;
        } else {
            horarioSelect.innerHTML = '<option value="">Nenhum horário disponível</option>';
        }
    } catch (error) {
        console.error("Erro ao carregar horários:", error.message);
        horarioSelect.innerHTML = '<option value="">Erro ao carregar</option>';
    }
}

/**
 * Popula o select de datas com base na agenda do gestor.
 */
async function popularDatasDisponiveis() {
    const selectData = document.getElementById('dataAgendamento');
    selectData.innerHTML = '<option value="">Selecione a data</option>';

    try {
        // Supondo que 'agendaGestor' é uma variável global ou pode ser buscada
        if (typeof agendaGestor === 'undefined') {
            throw new Error("Configurações da agenda do gestor não encontradas.");
        }
        const datasUnicas = [...new Set(agendaGestor.map(a => a.data))].sort();
        
        datasUnicas.forEach(dataISO => {
            const opt = document.createElement('option');
            opt.value = dataISO;
            opt.textContent = formatarDataISO(dataISO);
            selectData.appendChild(opt);
        });
    } catch (error) {
        console.error("Erro ao popular datas:", error.message);
        selectData.innerHTML = '<option value="">Erro ao carregar datas</option>';
    }
}
