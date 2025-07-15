// fila.js

// A variável 'supabase' é inicializada em supabaseConfig.js

// --- ESTADO DO MÓDULO ---
// Armazena os itens da fila localmente para evitar múltiplas chamadas ao banco de dados.
let filaCache = [];

// --- FUNÇÕES PRINCIPAIS ---

/**
 * Ponto de entrada para a visualização da Fila de Atendimento.
 * Busca os dados mais recentes do Supabase e renderiza a tela.
 */
async function showFila() {
    setActiveNav('nav-fila');
    const contentArea = document.getElementById('content');
    contentArea.innerHTML = `
        <h2><span class="icon">🎯</span>Fila de Atendimento</h2>
        <div class="actions-bar">
            <button id="btnChamarProximo" class="btn btn-primary">
                <span class="icon">📣</span>Chamar Próximo
            </button>
        </div>
        <div id="filaContainer" class="table-container">
            <p>Carregando fila...</p>
        </div>
    `;

    document.getElementById('btnChamarProximo').addEventListener('click', handleChamarProximo);

    try {
        // Busca diretamente apenas os agendamentos com status 'NA FILA'
        const { data, error } = await supabase
            .from('agendamentos')
            .select('*')
            .eq('status', 'NA FILA') // Filtro feito diretamente no banco de dados
            .order('data', { ascending: true })
            .order('horario', { ascending: true });

        if (error) throw error;

        filaCache = data || [];
        renderTabelaFila();
    } catch (error) {
        console.error('Erro ao carregar a fila:', error.message);
        mostrarToast('Falha ao carregar a fila.', 'error');
        document.getElementById('filaContainer').innerHTML = '<p class="error-message">Não foi possível carregar os dados. Tente novamente.</p>';
    }
}

// --- RENDERIZAÇÃO DA INTERFACE (UI) ---

/**
 * Renderiza a tabela da fila de atendimento com os dados do cache.
 */
function renderTabelaFila() {
    const container = document.getElementById('filaContainer');
    if (!container) return;

    if (filaCache.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum cliente na fila de atendimento.</p>';
        // Desabilita o botão se a fila estiver vazia
        const btnChamar = document.getElementById('btnChamarProximo');
        if (btnChamar) btnChamar.disabled = true;
        return;
    }

    const table = document.createElement('table');
    table.className = 'data-table'; // Reutilize sua classe de tabela padrão
    table.innerHTML = `
        <thead>
            <tr>
                <th>Data</th>
                <th>Horário</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>Status</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');
    filaCache.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatarDataISO(item.data)}</td>
            <td>${item.horario}</td>
            <td>${item.nome || ''}</td>
            <td>${item.cpf || ''}</td>
            <td><span class="status status-na-fila">${item.status}</span></td>
            <td class="actions-cell"></td>
        `;
        
        const atenderButton = document.createElement('button');
        atenderButton.className = 'btn btn-success btn-sm';
        atenderButton.innerHTML = '<span class="icon">✔️</span> Atender';
        atenderButton.onclick = () => handleAtenderCliente(item.id);
        
        tr.querySelector('.actions-cell').appendChild(atenderButton);
        tbody.appendChild(tr);
    });

    container.innerHTML = '';
    container.appendChild(table);
    
    // Garante que o botão esteja habilitado se a fila tiver itens
    const btnChamar = document.getElementById('btnChamarProximo');
    if (btnChamar) btnChamar.disabled = false;
}

// --- LÓGICA DE DADOS E EVENTOS ---

/**
 * Lida com o clique no botão "Chamar Próximo".
 * Atende o primeiro cliente da fila.
 */
function handleChamarProximo() {
    if (filaCache.length === 0) {
        mostrarToast("Nenhum cliente na fila para chamar.", "info");
        return;
    }
    const proximoCliente = filaCache[0];
    handleAtenderCliente(proximoCliente.id, `Chamando ${proximoCliente.nome}...`);
}

/**
 * Atualiza o status de um cliente na fila para "ATENDIDO".
 * @param {number} id O ID do agendamento a ser atualizado.
 * @param {string} [mensagemSucesso="Cliente atendido com sucesso!"] Mensagem a ser exibida.
 */
async function handleAtenderCliente(id, mensagemSucesso = "Cliente atendido com sucesso!") {
    try {
        const { error } = await supabase
            .from('agendamentos')
            .update({ status: 'ATENDIDO' })
            .eq('id', id);

        if (error) throw error;

        mostrarToast(mensagemSucesso, "success");
        
        // Atualiza a UI instantaneamente, removendo o item da fila local
        filaCache = filaCache.filter(item => item.id !== id);
        renderTabelaFila();

    } catch (error) {
        console.error('Erro ao atender cliente:', error.message);
        mostrarToast("Falha ao atualizar o status do cliente.", "error");
    }
}
