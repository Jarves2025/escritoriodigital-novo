// ------ GESTÃO DA AGENDA DO GESTOR ------

let agendaGestor = [];
if (localStorage.getItem('agendaGestor')) {
    agendaGestor = JSON.parse(localStorage.getItem('agendaGestor'));
}

function syncAgendaGestor() {
    localStorage.setItem('agendaGestor', JSON.stringify(agendaGestor));
}

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
    if (agendaGestor.length === 0) {
        html += `<tr><td colspan="4" style="color:#888; text-align:center;">Nenhum dia cadastrado</td></tr>`;
    } else {
        agendaGestor
            .sort((a, b) => (a.data + a.inicio).localeCompare(b.data + b.inicio))
            .forEach((dia, idx) => {
                html += `
                <tr>
                    <td>${formatarDataISO(dia.data)}</td>
                    <td>${dia.inicio}</td>
                    <td>${dia.fim}</td>
                    <td>
                        <button class="btn btn-danger" onclick="excluirDiaAtendimento(${idx})">Excluir</button>
                    </td>
                </tr>
                `;
            });
    }
    html += `</tbody></table></div>`;
    document.getElementById('content').innerHTML = html;
}

function salvarNovoDiaAtendimento(e) {
    e.preventDefault();
    const data = document.getElementById('novoDiaData').value;
    const inicio = document.getElementById('novoDiaInicio').value;
    const fim = document.getElementById('novoDiaFim').value;
    if (!data || !inicio || !fim) return;
    agendaGestor.push({ data, inicio, fim });
    syncAgendaGestor();
    mostrarToast("Dia cadastrado!", "success");
    showGestaoAgenda();
}

function excluirDiaAtendimento(idx) {
    if (confirm('Excluir este horário de atendimento?')) {
        agendaGestor.splice(idx, 1);
        syncAgendaGestor();
        showGestaoAgenda();
    }
}
function formatarDataISO(dataISO) {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}
