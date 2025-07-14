var supabase = window.supabase;

// Agendamentos sempre lidos do Supabase!
let agendamentosSupabase = [];

// Carregar lista de agendamentos do Supabase
function carregarAgendamentos() {
    supabase
        .from('agendamentos')
        .select('*')
        .order('data', { ascending: true })
        .order('horario', { ascending: true })
        .then(({ data, error }) => {
            agendamentosSupabase = data || [];
            showAgendamentos();
        });
}

// Exibe tela de agendamentos
function showAgendamentos() {
    currentPage = 'agendamentos';
    setActiveNav('nav-agendamentos');
    let html = `
        <h2>Agendamentos</h2>
        <button class="btn btn-primary" onclick="abrirNovoAgendamento()">Novo Agendamento</button>
        <div id="tabelaAgendamentos" style="margin-top:2.2rem"></div>
    `;
    document.getElementById('content').innerHTML = html;
    listarAgendamentos();
}

function formatarDataISO(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

function listarAgendamentos() {
    let html = `<table>
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
        <tbody>
    `;
    if (!agendamentosSupabase.length) {
        html += `<tr><td colspan="7" style="color:#aaa; text-align:center;">Nenhum agendamento cadastrado</td></tr>`;
    } else {
        agendamentosSupabase.forEach(ag => {
            html += `
                <tr>
                    <td>${formatarDataISO(ag.data)}</td>
                    <td>${ag.horario}</td>
                    <td>${ag.nome || ag.clienteNome}</td>
                    <td>${ag.cpf}</td>
                    <td>${ag.telefone || ""}</td>
                    <td>${ag.status}</td>
                    <td>
                        <button class="btn btn-danger" onclick="excluirAgendamento(${ag.id})">Excluir</button>
                    </td>
                </tr>
            `;
        });
    }
    html += `</tbody></table>`;
    document.getElementById('tabelaAgendamentos').innerHTML = html;
}

// Para obter as datas configuradas pelo gestor
function datasPermitidasGestor() {
    return (typeof agendaGestor !== 'undefined')
        ? [...new Set(agendaGestor.map(a => a.data))]
        : [];
}

// ---- NOVO AGENDAMENTO ----
function abrirNovoAgendamento() {
    let html = `
        <div class="agendamento-bg">
        <div class="agendamento-card">
            <h2 class="agendamento-titulo">Novo Agendamento</h2>
            <form id="formNovoAgendamento" onsubmit="salvarNovoAgendamento(event)">
                <div class="agendamento-row">
                    <label for="cpfAgendamento">CPF do cliente</label>
                    <input type="text" id="cpfAgendamento" maxlength="14" required oninput="mascaraCpf(this)" placeholder="Digite o CPF">
                </div>
                <div class="agendamento-row">
                    <label for="nomeAgendamento">Nome completo</label>
                    <input type="text" id="nomeAgendamento" required placeholder="Digite o nome completo">
                </div>
                <div class="agendamento-row">
                    <label for="telefoneAgendamento">Telefone</label>
                    <input type="text" id="telefoneAgendamento" maxlength="15" required oninput="mascaraTelefone(this)" placeholder="(99) 99999-9999">
                </div>
                <div class="agendamento-row agendamento-row-2col">
                    <div>
                        <label for="dataAgendamento">Data</label>
                        <select id="dataAgendamento" required onchange="carregarHorariosDisponiveis()">
                            <option value="">Selecione a data</option>
                        </select>
                    </div>
                    <div>
                        <label for="horarioSelect">Horário</label>
                        <select id="horarioSelect" required>
                            <option value="">Selecione o horário</option>
                        </select>
                    </div>
                </div>
                <div class="agendamento-actions">
                    <button class="btn btn-success" type="submit">Agendar</button>
                    <button type="button" class="btn btn-secondary" onclick="showAgendamentos()">Cancelar</button>
                </div>
            </form>
        </div>
        </div>
        <style>
            /* ...seu CSS aqui (igual ao anterior)... */
        </style>
    `;

    document.getElementById('content').innerHTML = html;

    // Preenche datas permitidas
    const selectData = document.getElementById('dataAgendamento');
    const datasPermitidas = datasPermitidasGestor().sort();
    datasPermitidas.forEach(dataISO => {
        const opt = document.createElement('option');
        opt.value = dataISO;
        opt.textContent = formatarDataISO(dataISO);
        selectData.appendChild(opt);
    });
}

// Máscara para CPF e Telefone
function mascaraCpf(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    input.value = value;
}
function mascaraTelefone(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    input.value = value;
}

// Carrega horários disponíveis para a data escolhida
function carregarHorariosDisponiveis() {
    const data = document.getElementById('dataAgendamento').value;
    const select = document.getElementById('horarioSelect');
    select.innerHTML = '<option value="">Selecione o horário</option>';

    const blocos = typeof agendaGestor !== 'undefined'
        ? agendaGestor.filter(d => d.data === data)
        : [];
    if (!blocos.length) return;

    let horarios = [];
    blocos.forEach(bloco => {
        let [h1, m1] = bloco.inicio.split(':').map(Number);
        let [h2, m2] = bloco.fim.split(':').map(Number);
        let ini = h1 * 60 + m1, fim = h2 * 60 + m2;
        for (let t = ini; t < fim; t += 30) {
            let h = Math.floor(t / 60), m = t % 60;
            let horario = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            horarios.push(horario);
        }
    });
    // Remove horários já ocupados
    horarios.forEach(horario => {
        const ocupado = agendamentosSupabase.some(ag => ag.data === data && ag.horario === horario);
        if (!ocupado) {
            select.innerHTML += `<option value="${horario}">${horario}</option>`;
        }
    });
}

// ---- Salva novo agendamento no Supabase ----
function salvarNovoAgendamento(event) {
    event.preventDefault();
    const cpf = document.getElementById('cpfAgendamento').value.trim();
    const nome = document.getElementById('nomeAgendamento').value.trim();
    const telefone = document.getElementById('telefoneAgendamento').value.trim();
    const data = document.getElementById('dataAgendamento').value;
    const horario = document.getElementById('horarioSelect').value;

    if (!datasPermitidasGestor().includes(data)) {
        mostrarToast("Só é possível agendar para dias configurados pelo gestor!", "error");
        document.getElementById('dataAgendamento').value = '';
        document.getElementById('horarioSelect').innerHTML = '<option value="">Selecione o horário</option>';
        return;
    }

    if (!cpf || !nome || !telefone || !data || !horario) {
        mostrarToast("Preencha todos os campos!", "error");
        return;
    }

    supabase.from('agendamentos').insert([{
        cpf,
        nome,
        telefone,
        data,
        horario,
        status: "AGENDADO"
    }]).then(({ error }) => {
        if (!error) {
            mostrarToast("Agendamento realizado!", "success");
            carregarAgendamentos();
        } else {
            mostrarToast("Erro ao agendar!", "error");
        }
    });
}

// ---- Excluir agendamento do Supabase ----
function excluirAgendamento(id) {
    if (!confirm('Excluir este agendamento?')) return;
    supabase.from('agendamentos').delete().eq('id', id).then(({ error }) => {
        if (!error) {
            mostrarToast("Agendamento excluído!", "success");
            carregarAgendamentos();
        } else {
            mostrarToast("Erro ao excluir agendamento!", "error");
        }
    });
}
