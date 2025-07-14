const SUPABASE_URL = 'https://jdflixpbupzwnictncbp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZmxpeHBidXB6d25pY3RuY2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDA4MjksImV4cCI6MjA2ODA3NjgyOX0.pNMVYVU5tw42_qMUhdJI1SE59xs5upVYz0RSyR81AMk';

window._supabase = window._supabase || window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const supabase = window._supabase;

// Exibe o painel inicial (dashboard) com resumos dos dados
function showDashboard() {
    currentPage = 'dashboard';
    setActiveNav('nav-dashboard');
    document.getElementById('content').innerHTML = `<h2>Carregando dados...</h2>`;
    carregarResumoDashboard();
}

// Função para buscar os resumos e atualizar a tela
async function carregarResumoDashboard() {
    // Pega totais direto do Supabase (pode usar count, mas aqui busca tudo para facilitar)
    let [clientesRes, agendamentosRes, checkinsRes] = await Promise.all([
        supabase.from('clientes').select('*'),
        supabase.from('agendamentos').select('*'),
        supabase.from('checkins').select('*')
    ]);

    let clientes = clientesRes.data || [];
    let agendamentos = agendamentosRes.data || [];
    let checkins = checkinsRes.data || [];

    // Filtros (exemplos)
    let agendados = agendamentos.filter(a => a.status === "AGENDADO");
    let atendidos = agendamentos.filter(a => a.status === "ATENDIDO");
    let pendentes = agendamentos.filter(a => a.status !== "ATENDIDO");

    let html = `
        <h2>Dashboard</h2>
        <div class="dashboard-cards">
            <div class="dashboard-card">
                <h3>Total de Clientes</h3>
                <p class="dashboard-num">${clientes.length}</p>
            </div>
            <div class="dashboard-card">
                <h3>Total de Agendamentos</h3>
                <p class="dashboard-num">${agendamentos.length}</p>
            </div>
            <div class="dashboard-card">
                <h3>Agendados</h3>
                <p class="dashboard-num">${agendados.length}</p>
            </div>
            <div class="dashboard-card">
                <h3>Atendidos</h3>
                <p class="dashboard-num">${atendidos.length}</p>
            </div>
            <div class="dashboard-card">
                <h3>Check-ins</h3>
                <p class="dashboard-num">${checkins.length}</p>
            </div>
        </div>
    `;
    document.getElementById('content').innerHTML = html;
}

// (Opcional) Estilo para cards do dashboard — pode ajustar conforme seu CSS global
const dashStyle = document.createElement('style');
dashStyle.innerHTML = `
.dashboard-cards { display: flex; gap: 2.2rem; flex-wrap: wrap; margin-top: 2.5rem; }
.dashboard-card { background: #fff; border-radius: 17px; box-shadow: 0 2px 15px #22326214; padding: 1.8rem 2.1rem 1.4rem 2.1rem; min-width: 190px; text-align: center; }
.dashboard-num { font-size: 2.3rem; font-weight: 800; margin-top: 0.6rem; color: #185da1;}
@media (max-width: 700px){ .dashboard-cards { flex-direction: column; gap: 1.3rem;} .dashboard-card{min-width:120px;padding:1.1rem 0.8rem;} }
`;
document.head.appendChild(dashStyle);
