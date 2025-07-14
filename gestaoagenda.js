var supabase = window._supabase;


// Agenda do gestor — só guarda a lista da última leitura do banco
let agendaGestor = [];

// Carrega dias da agenda do gestor do Supabase
function carregarAgendaGestor() {
    supabase
        .from('agenda_gestor')
        .select('*')
        .order('data', { ascending: true })
        .order('inicio', { ascending: true })
        .then(({ data, error }) => {
            agendaGestor = data || [];
            showGestaoAgenda();
        });
}

// Exibe tela de Gestão da Agenda
function showGestaoAgenda() {
    currentPage = 'gestaoagenda';
    setActiveNav('nav-gestaoagenda');
    let html = `
        <h2>Gestão da Agenda</h2>
        <div style="margin:1.5rem 0;">
            <h3>Adicionar novo dia de atendimento</h3>
            <form id="formNovoDiaAtendimento" onsubmit="salvarNovoDiaAtendimento(event)">
                <label style="margin-right:0.7rem;">Data: <input type="date" id="novoDiaData" required></label>
                <label style="margin-right:0.7rem;">Início: <input type="time" id="novoDiaInicio" required></label>
                <label style="margin-right:0.7rem;">Fim: <input type="time" id="novoDiaFim" required></label>
                <button class="btn btn-primary" type="submit">Adicionar</button>
            </form>
        </div>
        <div style="margin-top:2.5rem;">
            <h3>Dias de atendimento cadastrados</h3>
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Horário Início</th>
                        <th>Horário Fim</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
    `;
    if (!agendaGestor.length) {
        html += `<tr><td colspan="4" style="color:#888; text-align:center;">Nenhum dia cadastrado</td></tr>`;
    } else {
        agendaGestor.forEach(dia => {
            html += `
            <tr>
                <td>${formatarDataISO(dia.data)}</td>
                <td>${dia.inicio}</td>
                <td>${dia.fim}</td>
                <td>
                    <button class="btn btn-danger" onclick="excluirDiaAtendimento(${dia.id})">Excluir</button>
                </td>
            </tr>
            `;
        });
    }
    html += `</tbody></table></div>`;
    document.getElementById('content').innerHTML = html;
}

// Adiciona novo dia na agenda (Supabase)
function salvarNovoDiaAtendimento(e) {
    e.preventDefault();
    const data = document.getElementById('novoDiaData').value;
    const inicio = document.getElementById('novoDiaInicio').value;
    const fim = document.getElementById('novoDiaFim').value;
    if (!data || !inicio || !fim) return;
    supabase
        .from('agenda_gestor')
        .insert([{ data, inicio, fim }])
        .then(({ error }) => {
            if (!error) {
                mostrarToast("Dia cadastrado!", "success");
                carregarAgendaGestor();
            } else {
                mostrarToast("Erro ao cadastrar!", "error");
            }
        });
}

// Excluir dia da agenda (Supabase)
function excluirDiaAtendimento(id) {
    if (confirm('Excluir este horário de atendimento?')) {
        supabase
            .from('agenda_gestor')
            .delete()
            .eq('id', id)
            .then(({ error }) => {
                if (!error) {
                    mostrarToast("Dia excluído!", "success");
                    carregarAgendaGestor();
                } else {
                    mostrarToast("Erro ao excluir!", "error");
                }
            });
    }
}

// Formata data para dd/mm/aaaa
function formatarDataISO(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}
