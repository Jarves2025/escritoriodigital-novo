function showFila() {
    currentPage = 'fila';
    setActiveNav('nav-fila');

    // Pega clientes em espera (status PRESENTE) e ordena pelo horário mais próximo
    const filaEspera = agendamentos
        .map((a, idx) => ({ ...a, idx })) // inclui índice original
        .filter(a => a.status === 'PRESENTE')
        .sort((a, b) => {
            // Combina data+horário e compara para garantir ordem real
            return (a.data + a.horario).localeCompare(b.data + b.horario);
        });

    // Descobre quem está chamado ou em atendimento
    let clienteChamado = JSON.parse(localStorage.getItem('clienteChamado')) || null;

    let html = `
        <h2>Fila de Atendimento</h2>
        <div class="controles-fila" style="margin-bottom:1.5rem;">
            <button onclick="chamarProximoCliente()" class="btn btn-primary btn-large">📢 Chamar Próximo</button>
        </div>
    `;

    // Exibe cliente chamado atual (se existir)
    if (clienteChamado) {
        html += `
            <div class="card-atendimento" style="margin-bottom: 2rem;">
                <h3>Cliente chamado:</h3>
                <h2 style="margin: 1rem 0 0.5rem 0; color:#667eea;">${clienteChamado.nome}</h2>
                <p style="margin-bottom:1rem;">Horário agendado: ${clienteChamado.horario}</p>
                ${clienteChamado.status === 'CHAMADO'
                    ? `<button onclick="iniciarAtendimento()" class="btn btn-success">Iniciar Atendimento</button>`
                    : `<button onclick="encerrarAtendimento()" class="btn btn-danger">Encerrar Atendimento</button>`
                }
            </div>
        `;
    }

    html += `
        <h3>Fila de Espera</h3>
        <table>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Horário</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (filaEspera.length === 0) {
        html += `<tr><td colspan="2" style="text-align:center; color:#999;">Nenhum cliente na fila de espera</td></tr>`;
    } else {
        filaEspera.forEach(cli => {
            html += `
                <tr>
                    <td>${cli.clienteNome || cli.nome}</td>
                    <td>${cli.horario}</td>
                </tr>
            `;
        });
    }
    html += `</tbody></table>`;

    document.getElementById('content').innerHTML = html;
}

function chamarProximoCliente() {
    // Fila ordenada pelo menor horário
    const filaEspera = agendamentos
        .map((a, idx) => ({ ...a, idx }))
        .filter(a => a.status === 'PRESENTE')
        .sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario));

    if (filaEspera.length === 0) {
        mostrarToast("Nenhum cliente na fila!", "info");
        return;
    }
    // Seleciona o primeiro da fila (menor horário)
    const proximo = filaEspera[0];
    // Marca como chamado (mas ainda não "em atendimento")
    let clienteChamado = {
        id: proximo.idx,
        nome: proximo.clienteNome || proximo.nome,
        horario: proximo.horario,
        status: 'CHAMADO',
        chamadoEm: new Date().toLocaleTimeString(),
        iniciadoEm: null,
        finalizadoEm: null
    };
    localStorage.setItem('clienteChamado', JSON.stringify(clienteChamado));
    // Sinal sonoro e voz
    sinalSonoro();
    chamadaVoz(clienteChamado.nome);
    mostrarToast(`Cliente ${clienteChamado.nome} chamado!`, "success");
    showFila();
}

function iniciarAtendimento() {
    let clienteChamado = JSON.parse(localStorage.getItem('clienteChamado'));
    if (clienteChamado) {
        clienteChamado.status = "EM_ATENDIMENTO";
        clienteChamado.iniciadoEm = new Date().toLocaleTimeString();
        localStorage.setItem('clienteChamado', JSON.stringify(clienteChamado));
        // Atualiza status do agendamento
        agendamentos[clienteChamado.id].status = "EM_ATENDIMENTO";
        syncStorage();
        mostrarToast(`Atendimento iniciado para ${clienteChamado.nome}!`, "success");
        showFila();
    }
}

function encerrarAtendimento() {
    let clienteChamado = JSON.parse(localStorage.getItem('clienteChamado'));
    if (clienteChamado) {
        clienteChamado.status = "ATENDIDO";
        clienteChamado.finalizadoEm = new Date().toLocaleTimeString();
        // Calcula duração
        const [h1,m1,s1] = (clienteChamado.iniciadoEm || "00:00:00").split(":").map(Number);
        const [h2,m2,s2] = (clienteChamado.finalizadoEm || "00:00:00").split(":").map(Number);
        const d1 = h1*3600 + m1*60 + s1;
        const d2 = h2*3600 + m2*60 + s2;
        clienteChamado.duracao = d1 && d2 ? formatarDuracao(Math.max(0, d2-d1)) : '-';
        // Atualiza status do agendamento e salva em atendidos
        agendamentos[clienteChamado.id].status = "ATENDIDO";
        atendidos.push(clienteChamado);
        syncStorage();
        localStorage.removeItem('clienteChamado');
        mostrarToast(`Atendimento encerrado!`, "success");
        showFila();
    }
}

function formatarDuracao(segundos) {
    const h = Math.floor(segundos/3600);
    const m = Math.floor((segundos%3600)/60);
    const s = segundos%60;
    return `${h > 0 ? (h+'h ') : ''}${m > 0 ? (m+'m ') : ''}${s}s`;
}

// ---- Sinal sonoro e voz ----
function sinalSonoro() {
    const audio = new Audio('sounds/dingdong.mp3');
    audio.volume = 0.90; // ajuste o volume conforme o necessário
    audio.play();
}
function chamadaVoz(nome) {
    if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(`${nome}, favor dirigir-se ao consultório`);
        u.lang = 'pt-BR';
        u.rate = 0.85;
        u.pitch = 1;
        u.volume = 1;
        setTimeout(() => speechSynthesis.speak(u), 700);
    }
}
