const SUPABASE_URL = 'https://jdflixpbupzwnictncbp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZmxpeHBidXB6d25pY3RuY2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDA4MjksImV4cCI6MjA2ODA3NjgyOX0.pNMVYVU5tw42_qMUhdJI1SE59xs5upVYz0RSyR81AMk';

window._supabase = window._supabase || window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const supabase = window._supabase;

function showRelatorio() {
    currentPage = 'relatorio';
    setActiveNav('nav-relatorio');
    document.getElementById('content').innerHTML = `<h2>Carregando relatório...</h2>`;
    gerarRelatorio();
}

// Exemplo: relatório de agendamentos por status
async function gerarRelatorio() {
    let [agRes, cliRes] = await Promise.all([
        supabase.from('agendamentos').select('*'),
        supabase.from('clientes').select('*')
    ]);

    let agendamentos = agRes.data || [];
    let clientes = cliRes.data || [];

    // Exemplo de agrupamento
    let agendados = agendamentos.filter(a => a.status === "AGENDADO");
    let atendidos = agendamentos.filter(a => a.status === "ATENDIDO");
    let cancelados = agendamentos.filter(a => a.status === "CANCELADO");

    let html = `
        <h2>Relatório Geral</h2>
        <div style="display:flex; flex-wrap:wrap; gap:2.2rem; margin-bottom:2.2rem">
            <div class="relatorio-card">
                <h3>Total de Clientes</h3>
                <div class="relatorio-num">${clientes.length}</div>
            </div>
            <div class="relatorio-card">
                <h3>Total de Agendamentos</h3>
                <div class="relatorio-num">${agendamentos.length}</div>
            </div>
            <div class="relatorio-card">
                <h3>Agendados</h3>
                <div class="relatorio-num">${agendados.length}</div>
            </div>
            <div class="relatorio-card">
                <h3>Atendidos</h3>
                <div class="relatorio-num">${atendidos.length}</div>
            </div>
            <div class="relatorio-card">
                <h3>Cancelados</h3>
                <div class="relatorio-num">${cancelados.length}</div>
            </div>
        </div>
        <h3>Listagem Completa de Agendamentos</h3>
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Horário</th>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;
    if (!agendamentos.length) {
        html += `<tr><td colspan="5" style="color:#aaa; text-align:center;">Nenhum agendamento cadastrado</td></tr>`;
    } else {
        agendamentos.forEach(a => {
            html += `
                <tr>
                    <td>${formatarDataISO(a.data)}</td>
                    <td>${a.horario}</td>
                    <td>${a.nome || a.clienteNome}</td>
                    <td>${a.cpf}</td>
                    <td>${a.status}</td>
                </tr>
            `;
        });
    }
    html += `</tbody></table>`;
    document.getElementById('content').innerHTML = html;
}

// Utilitário: formato dd/mm/aaaa
function formatarDataISO(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}
