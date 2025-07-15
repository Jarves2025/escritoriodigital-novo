// dashboard.js

// A variável 'supabase' é inicializada em supabaseConfig.js

/**
 * Ponto de entrada para a visualização do Dashboard.
 * Inicia o carregamento dos dados e exibe o estado inicial.
 */
function showDashboard() {
    setActiveNav('nav-dashboard');
    const contentArea = document.getElementById('content');
    
    // Define a estrutura inicial do dashboard com um estado de carregamento
    contentArea.innerHTML = `
        <h2><span class="icon">📊</span>Dashboard</h2>
        <div id="dashboard-cards-container" class="dashboard-cards">
            <div class="dashboard-card placeholder"></div>
            <div class="dashboard-card placeholder"></div>
            <div class="dashboard-card placeholder"></div>
            <div class="dashboard-card placeholder"></div>
        </div>
    `;
    
    // Inicia o processo de busca e renderização dos dados
    carregarResumoDashboard();
}

/**
 * Busca os totais de cada tabela de forma eficiente usando count()
 * e renderiza os cards do dashboard com os dados.
 */
async function carregarResumoDashboard() {
    const container = document.getElementById('dashboard-cards-container');

    try {
        // Executa todas as contagens em paralelo para máxima eficiência
        const [
            { count: totalClientes, error: errClientes },
            { count: totalAgendamentos, error: errAgendamentos },
            { count: totalCheckins, error: errCheckins },
            { count: totalAtendidos, error: errAtendidos }
        ] = await Promise.all([
            supabase.from('clientes').select('*', { count: 'exact', head: true }),
            supabase.from('agendamentos').select('*', { count: 'exact', head: true }),
            supabase.from('checkins').select('*', { count: 'exact', head: true }),
            supabase.from('agendamentos').select('*', { count: 'exact', head: true }).eq('status', 'ATENDIDO')
        ]);

        // Verifica se houve erro em alguma das chamadas
        if (errClientes || errAgendamentos || errCheckins || errAtendidos) {
            throw new Error('Falha ao buscar um ou mais totais do banco de dados.');
        }

        // Renderiza os cards com os dados obtidos
        container.innerHTML = `
            <div class="dashboard-card">
                <h3>Total de Clientes</h3>
                <p class="dashboard-num">${totalClientes !== null ? totalClientes : '?'}</p>
            </div>
            <div class="dashboard-card">
                <h3>Total de Agendamentos</h3>
                <p class="dashboard-num">${totalAgendamentos !== null ? totalAgendamentos : '?'}</p>
            </div>
            <div class="dashboard-card">
                <h3>Agendamentos Atendidos</h3>
                <p class="dashboard-num">${totalAtendidos !== null ? totalAtendidos : '?'}</p>
            </div>
            <div class="dashboard-card">
                <h3>Total de Check-ins</h3>
                <p class="dashboard-num">${totalCheckins !== null ? totalCheckins : '?'}</p>
            </div>
        `;

    } catch (error) {
        console.error('Erro ao carregar resumos do dashboard:', error.message);
        mostrarToast('Não foi possível carregar os dados do dashboard.', 'error');
        container.innerHTML = '<p class="error-message">Erro ao carregar os dados. Tente atualizar a página.</p>';
    }
}
