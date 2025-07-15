// gestaoagenda.js

// A variável 'supabase' é inicializada em supabaseConfig.js

// --- ESTADO DO MÓDULO ---
// Armazena a agenda do gestor localmente para evitar múltiplas chamadas ao banco de dados.
let agendaGestorCache = [];

// --- FUNÇÕES PRINCIPAIS ---

/**
 * Ponto de entrada para a visualização da Gestão da Agenda.
 * Busca os dados mais recentes do Supabase e renderiza a tela.
 */
async function carregarAgendaGestor() {
    setActiveNav('nav-gestaoagenda');
    const contentArea = document.getElementById('content');
    contentArea.innerHTML = `
        <h2><span class="icon">📅</span>Gestão da Agenda</h2>
        
        <div class="form-container-box">
            <h3>Adicionar Novo Dia de Atendimento</h3>
            <form id="formNovoDia" class="form-inline">
                <div class="form-group">
                    <label for="novoDiaData">Data</label>
                    <input type="date" id="novoDiaData" required>
                </div>
                <div class="form-group">
                    <label for="novoDiaInicio">Início</label>
                    <input type="time" id="novoDiaInicio" required>
                </div>
                <div class="form-group">
                    <label for="novoDiaFim">Fim</label>
                    <input type="time" id="novoDiaFim" required>
                </div>
                <button type="submit" class="btn btn-primary">Adicionar</button>
            </form>
        </div>

        <div id="agendaContainer" class="table-container">
            <p>Carregando agenda...</p>
        </div>
    `;

    document.getElementById('formNovoDia').addEventListener('submit', handleSalvarNovoDia);

    try {
        const { data, error } = await supabase
            .from('agenda_gestor')
            .select('*')
            .order('data', { ascending: true })
            .order('inicio', { ascending: true });

        if (error) throw error;

        agendaGestorCache = data || [];
        renderTabelaAgenda();
    } catch (error) {
        console.error('Erro ao carregar a agenda do gestor:', error.message);
        mostrarToast('Falha ao carregar a agenda.', 'error');
        document.getElementById('agendaContainer').innerHTML = '<p class="error-message">Não foi possível carregar os dados. Tente novamente.</p>';
    }
}

// --- RENDERIZAÇÃO DA INTERFACE (UI) ---

/**
 * Renderiza a tabela da agenda do gestor com os dados do cache.
 */
function renderTabelaAgenda() {
    const container = document.getElementById('agendaContainer');
    if (!container) return;

    const tituloTabela = '<h3>Dias de Atendimento Cadastrados</h3>';

    if (agendaGestorCache.length === 0) {
        container.innerHTML = `${tituloTabela}<p class="empty-state">Nenhum dia de atendimento cadastrado.</p>`;
        return;
    }

    const table = document.createElement('table');
    table.className = 'data-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Data</th>
                <th>Horário de Início</th>
                <th>Horário de Fim</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');
    agendaGestorCache.forEach(dia => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatarDataISO(dia.data)}</td>
            <td>${dia.inicio}</td>
            <td>${dia.fim}</td>
            <td class="actions-cell"></td>
        `;
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.innerHTML = '<span class="icon">🗑️</span> Excluir';
        deleteButton.onclick = () => handleDeleteDia(dia.id);
        
        tr.querySelector('.actions-cell').appendChild(deleteButton);
        tbody.appendChild(tr);
    });

    container.innerHTML = tituloTabela;
    container.appendChild(table);
}

// --- LÓGICA DE DADOS E EVENTOS ---

/**
 * Salva um novo dia de atendimento no banco de dados.
 * @param {Event} event O evento de submit do formulário.
 */
async function handleSalvarNovoDia(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');

    const novoDia = {
        data: document.getElementById('novoDiaData').value,
        inicio: document.getElementById('novoDiaInicio').value,
        fim: document.getElementById('novoDiaFim').value,
    };

    if (novoDia.inicio >= novoDia.fim) {
        mostrarToast("O horário de início deve ser anterior ao horário de fim.", "error");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Adicionando...';

    try {
        const { data: insertedData, error } = await supabase
            .from('agenda_gestor')
            .insert([novoDia])
            .select(); // .select() retorna o registro inserido

        if (error) throw error;

        mostrarToast("Dia de atendimento adicionado com sucesso!", "success");
        form.reset(); // Limpa o formulário

        // Adiciona o novo item ao cache e renderiza a tabela para atualização instantânea
        agendaGestorCache.push(insertedData[0]);
        agendaGestorCache.sort((a, b) => new Date(a.data) - new Date(b.data) || a.inicio.localeCompare(b.inicio));
        renderTabelaAgenda();

    } catch (error) {
        console.error('Erro ao salvar dia de atendimento:', error.message);
        mostrarToast(`Falha ao adicionar: ${error.message}`, "error");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Adicionar';
    }
}

/**
 * Exclui um dia de atendimento do banco de dados.
 * @param {number} id O ID do dia a ser excluído.
 */
async function handleDeleteDia(id) {
    if (!confirm("Tem certeza que deseja excluir este dia de atendimento? Todos os horários associados serão perdidos.")) {
        return;
    }

    try {
        const { error } = await supabase.from('agenda_gestor').delete().eq('id', id);
        if (error) throw error;

        mostrarToast("Dia de atendimento excluído com sucesso!", "success");
        
        // Remove o item do cache e renderiza a tabela novamente para uma atualização instantânea
        agendaGestorCache = agendaGestorCache.filter(dia => dia.id !== id);
        renderTabelaAgenda();

    } catch (error) {
        console.error('Erro ao excluir dia de atendimento:', error.message);
        mostrarToast("Falha ao excluir o dia de atendimento.", "error");
    }
}
