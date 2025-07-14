var supabase = window._supabase;


// Lista de check-ins sempre lida do Supabase!
let checkins = [];

// Carrega lista de check-ins do Supabase
function carregarCheckins() {
    supabase
        .from('checkins')
        .select('*')
        .order('data_checkin', { ascending: false })
        .order('horario_checkin', { ascending: false })
        .then(({ data, error }) => {
            checkins = data || [];
            showCheckins();
        });
}

// Mostra a tela/lista de check-ins
function showCheckins() {
    currentPage = 'checkin';
    setActiveNav('nav-checkin');

    let html = `
        <h2>Check-ins</h2>
        <button class="btn btn-primary" onclick="abrirNovoCheckin()">Novo Check-in</button>
        <div id="tabelaCheckins" style="margin-top:2.2rem"></div>
    `;
    document.getElementById('content').innerHTML = html;
    listarCheckins();
}

// Renderiza tabela de check-ins
function listarCheckins() {
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
    if (!checkins.length) {
        html += `<tr><td colspan="7" style="color:#aaa; text-align:center;">Nenhum check-in registrado</td></tr>`;
    } else {
        checkins.forEach(ch => {
            html += `
                <tr>
                    <td>${formatarDataISO(ch.data_checkin)}</td>
                    <td>${ch.horario_checkin}</td>
                    <td>${ch.nome}</td>
                    <td>${ch.cpf}</td>
                    <td>${ch.telefone || ""}</td>
                    <td>${ch.status || ""}</td>
                    <td>
                        <button class="btn btn-danger" onclick="excluirCheckin(${ch.id})">Excluir</button>
                    </td>
                </tr>
            `;
        });
    }
    html += `</tbody></table>`;
    document.getElementById('tabelaCheckins').innerHTML = html;
}

// Abre modal para novo check-in
function abrirNovoCheckin() {
    let html = `
        <div class="checkin-bg">
        <div class="checkin-card">
            <h2>Novo Check-in</h2>
            <form id="formNovoCheckin" onsubmit="salvarNovoCheckin(event)">
                <label>Nome: <input type="text" id="nomeCheckin" required></label><br>
                <label>CPF: <input type="text" id="cpfCheckin" required oninput="mascaraCpf(this)"></label><br>
                <label>Telefone: <input type="text" id="telCheckin" oninput="mascaraTelefone(this)"></label><br>
                <label>Data: <input type="date" id="dataCheckin" required></label><br>
                <label>Horário: <input type="time" id="horarioCheckin" required></label><br>
                <label>Status: 
                    <select id="statusCheckin">
                        <option value="PRESENTE">PRESENTE</option>
                        <option value="AGUARDANDO">AGUARDANDO</option>
                        <option value="ATENDIDO">ATENDIDO</option>
                    </select>
                </label><br>
                <button type="submit" class="btn btn-success">Registrar</button>
                <button type="button" class="btn btn-secondary" onclick="showCheckins()">Cancelar</button>
            </form>
        </div>
        </div>
    `;
    document.getElementById('content').innerHTML = html;
}

// Salva novo check-in no Supabase
function salvarNovoCheckin(event) {
    event.preventDefault();
    const novoCheckin = {
        nome: document.getElementById('nomeCheckin').value.trim(),
        cpf: document.getElementById('cpfCheckin').value.trim(),
        telefone: document.getElementById('telCheckin').value.trim(),
        data_checkin: document.getElementById('dataCheckin').value,
        horario_checkin: document.getElementById('horarioCheckin').value,
        status: document.getElementById('statusCheckin').value
    };
    supabase.from('checkins').insert([novoCheckin]).then(({ error }) => {
        if (!error) {
            mostrarToast("Check-in registrado!", "success");
            carregarCheckins();
        } else {
            mostrarToast("Erro ao registrar check-in!", "error");
        }
    });
}

// Excluir check-in do Supabase
function excluirCheckin(id) {
    if (!confirm('Excluir este check-in?')) return;
    supabase.from('checkins').delete().eq('id', id).then(({ error }) => {
        if (!error) {
            mostrarToast("Check-in excluído!", "success");
            carregarCheckins();
        } else {
            mostrarToast("Erro ao excluir check-in!", "error");
        }
    });
}

// Funções de máscara já estão em outros arquivos, use do utils.js se já existir.
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

// Função auxiliar para data no padrão dd/mm/aaaa
function formatarDataISO(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}
