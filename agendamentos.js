// ----- AGENDAMENTOS: layout original com restrição de datas do gestor -----

// Carrega lista de datas permitidas (agendaGestor)
let agendaGestor = [];
if (localStorage.getItem('agendaGestor')) {
    agendaGestor = JSON.parse(localStorage.getItem('agendaGestor'));
}
function datasPermitidasGestor() {
    return [...new Set(agendaGestor.map(a => a.data))];
}
function formatarDataISO(dataISO) {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

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

function listarAgendamentos() {
    let html = `<table>
        <thead>
            <tr>
                <th>Data</th>
                <th>Horário</th>
                <th>Cliente</th>
                <th>Telefone</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
    `;
    if (agendamentos.length === 0) {
        html += `<tr><td colspan="5" style="color:#aaa; text-align:center;">Nenhum agendamento cadastrado</td></tr>`;
    } else {
        agendamentos.forEach(ag => {
            html += `
                <tr>
                    <td>${formatarDataISO(ag.data)}</td>
                    <td>${ag.horario}</td>
                    <td>${ag.clienteNome || ag.nome}</td>
                    <td>${ag.telefone || ""}</td>
                    <td>${ag.status}</td>
                </tr>
            `;
        });
    }
    html += `</tbody></table>`;
    document.getElementById('tabelaAgendamentos').innerHTML = html;
}

// ---- NOVO AGENDAMENTO (layout tradicional) ----
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
            .agendamento-bg {
                min-height: 100vh;
                width: 100vw;
                display: flex;
                align-items: flex-start;      /* Alinha ao topo */
                justify-content: flex-start;  /* Alinha à esquerda */
                background: #f6fafc;
                padding-left: 50px;           /* Espaço da esquerda (ajuste como quiser) */
                padding-top: 60px;            /* Espaço do topo (ajuste como quiser) */
                }
            .agendamento-card {
                background: #fff;
                border-radius: 22px;
                box-shadow: 0 8px 32px #22326225, 0 1px 3px #00eaff11;
                max-width: 520px;
                min-width: 340px;
                width: 96vw;
                padding: 2.8rem 2.4rem 2.2rem 2.4rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                animation: cardshow 0.55s cubic-bezier(.21,.79,.41,1.00);
                margin: 0;
            }
            @keyframes cardshow {
                from { opacity:0; transform: translateY(60px) scale(.93);}
                to { opacity:1; transform: none;}
            }
            .agendamento-titulo {
                font-size: 2rem;
                margin-bottom: 2.1rem;
                font-weight: 800;
                color: #284b7b;
                text-align: center;
                letter-spacing: 2px;
                text-shadow: 0 2px 12px #b5cfe199;
            }
            .agendamento-row {
                width: 100%;
                display: flex;
                flex-direction: column;
                margin-bottom: 1.12rem;
            }
            .agendamento-row label {
                margin-bottom: 0.28rem;
                font-size: 1.09rem;
                color: #1d2a42;
                font-weight: 600;
            }
            .agendamento-row input,
            .agendamento-row select {
                font-size: 1.07rem;
                border-radius: 10px;
                border: 1.7px solid #bfd4f6;
                padding: 0.64rem 0.95rem;
                margin-bottom: 0.15rem;
                background: #f8fbff;
                transition: border .22s;
            }
            .agendamento-row input:focus,
            .agendamento-row select:focus {
                border-color: #23d2fc;
                outline: none;
            }
            .agendamento-row-2col {
                flex-direction: row;
                gap: 1.2rem;
                margin-bottom: 1.15rem;
            }
            .agendamento-row-2col > div { flex:1; }
            .agendamento-actions {
                width: 100%;
                display: flex;
                justify-content: flex-end;
                gap: 1.25rem;
                margin-top: 1.0rem;
            }
            .btn-success {
                background: linear-gradient(90deg,#18d586,#11b0e3 90%);
                color: #fff;
                border: none;
                border-radius: 7px;
                font-weight: 700;
                font-size: 1.06rem;
                padding: 0.69rem 2.2rem;
                cursor: pointer;
                box-shadow: 0 2px 8px #cbeeff33;
                transition: background .21s,box-shadow .25s;
            }
            .btn-success:hover { background: linear-gradient(90deg,#1ee9ab,#25cbfa 80%);}
            .btn-secondary {
                background: #637182;
                color: #fff;
                border: none;
                border-radius: 7px;
                font-weight: 700;
                font-size: 1.06rem;
                padding: 0.69rem 2.2rem;
                cursor: pointer;
                box-shadow: 0 1px 6px #b6c2e022;
                transition: background .18s;
            }
            .btn-secondary:hover { background: #3f5265; }
            @media (max-width: 650px){
                .agendamento-card { padding: 1.2rem 0.5rem;}
                .agendamento-row-2col { flex-direction: column; gap: 0.25rem;}
            }
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
// ---- Mascara para CPF e Telefone ----
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

// ---- Carrega horários disponíveis para a data escolhida ----
function carregarHorariosDisponiveis() {
    const data = document.getElementById('dataAgendamento').value;
    const select = document.getElementById('horarioSelect');
    select.innerHTML = '<option value="">Selecione o horário</option>';

    // Busca blocos horários permitidos para a data
    const blocos = agendaGestor.filter(d => d.data === data);
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
        const ocupado = agendamentos.some(ag => ag.data === data && ag.horario === horario);
        if (!ocupado) {
            select.innerHTML += `<option value="${horario}">${horario}</option>`;
        }
    });
}

// ---- Salva novo agendamento ----
function salvarNovoAgendamento(event) {
    event.preventDefault();
    const cpf = document.getElementById('cpfAgendamento').value.trim();
    const nome = document.getElementById('nomeAgendamento').value.trim();
    const telefone = document.getElementById('telefoneAgendamento').value.trim();
    const data = document.getElementById('dataAgendamento').value;
    const horario = document.getElementById('horarioSelect').value;

    // Checagem das datas permitidas
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

    agendamentos.push({
        cpf,
        nome,
        telefone,
        data,
        horario,
        status: "AGENDADO"
    });
    syncStorage();
    mostrarToast("Agendamento realizado!", "success");
    showAgendamentos();
}
