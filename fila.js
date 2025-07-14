const SUPABASE_URL = 'https://jdflixpbupzwnictncbp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZmxpeHBidXB6d25pY3RuY2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDA4MjksImV4cCI6MjA2ODA3NjgyOX0.pNMVYVU5tw42_qMUhdJI1SE59xs5upVYz0RSyR81AMk';

window._supabase = window._supabase || window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const supabase = window._supabase;

// Fila será um filtro sobre agendamentos do Supabase
let fila = [];

function carregarFila() {
    // Busca todos os agendamentos com status "NA FILA"
    supabase
        .from('agendamentos')
        .select('*')
        .order('data', { ascending: true })
        .order('horario', { ascending: true })
        .then(({ data, error }) => {
            fila = (data || []).filter(ag => ag.status && ag.status.toUpperCase() === 'NA FILA');
            showFila();
        });
}

function showFila() {
    currentPage = 'fila';
    setActiveNav('nav-fila');

    let html = `
        <h2>Fila de Atendimento</h2>
        <button class="btn btn-primary" onclick="abrirChamadaFila()">Chamar próximo</button>
        <div id="tabelaFila" style="margin-top:2.2rem"></div>
    `;
    document.getElementById('content').innerHTML = html;
    listarFila();
}

function listarFila() {
    let html = `<table>
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
        <tbody>
    `;
    if (!fila.length) {
        html += `<tr><td colspan="6" style="color:#aaa; text-align:center;">Nenhum cliente na fila</td></tr>`;
    } else {
        fila.forEach(item => {
            html += `
                <tr>
                    <td>${formatarDataISO(item.data)}</td>
                    <td>${item.horario}</td>
                    <td>${item.nome || item.clienteNome}</td>
                    <td>${item.cpf}</td>
                    <td>${item.status}</td>
                    <td>
                        <button class="btn btn-success" onclick="atenderFila(${item.id})">Atender</button>
                    </td>
                </tr>
            `;
        });
    }
    html += `</tbody></table>`;
    document.getElementById('tabelaFila').innerHTML = html;
}

// Chamar próximo da fila (opcional: exibir pop-up/alert ou fazer "atender" direto)
function abrirChamadaFila() {
    if (!fila.length) {
        mostrarToast("Nenhum cliente na fila.", "info");
        return;
    }
    const proximo = fila[0];
    if (proximo) {
        atenderFila(proximo.id);
    }
}

// Função para marcar cliente como atendido (ou outro status)
function atenderFila(id) {
    supabase.from('agendamentos').update({ status: "ATENDIDO" }).eq('id', id).then(({ error }) => {
        if (!error) {
            mostrarToast("Cliente atendido!", "success");
            carregarFila();
        } else {
            mostrarToast("Erro ao atualizar status!", "error");
        }
    });
}

// Utilitário: formato dd/mm/aaaa
function formatarDataISO(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}
