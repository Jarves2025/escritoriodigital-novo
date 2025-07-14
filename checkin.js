function showCheckin() {
    currentPage = 'checkin';
    setActiveNav('nav-checkin');
    const hoje = document.getElementById('filtroDataCheckin')?.value || hojeISO();
    const agendamentosHoje = agendamentos
        .map((a, idx) => ({ ...a, idxReal: idx }))
        .filter(a => a.data === hoje);

    let html = `
        <h2>Check-in de Clientes</h2>
        <div style="margin: 0.8rem 0 2.2rem 0; display:flex; align-items:center;">
            <label style="margin-right:1rem; font-size:1.07rem; font-weight:600;">Data:</label>
            <input type="date" id="filtroDataCheckin" value="${hoje}" style="font-size:1.12rem; padding:0.4rem 1rem; border-radius:8px; border:2px solid #223262; min-width:170px;" onchange="showCheckin()">
        </div>
        <div class="checkin-card-list">
    `;

    if (agendamentosHoje.length === 0) {
        html += `<div class="empty-state" style="margin-top:2rem;">Nenhum agendamento encontrado para esta data.</div>`;
    } else {
        agendamentosHoje.forEach((agendamento) => {
            html += `
                <div class="checkin-card">
                    <div>
                        <div class="checkin-card-nome">${agendamento.clienteNome || agendamento.nome}</div>
                        <div class="checkin-card-horario">Horário: <strong>${agendamento.horario}</strong></div>
                        <div class="checkin-card-status">Status: <span class="badge ${agendamento.status === 'PRESENTE' ? 'success' : agendamento.status === 'AGENDADO' ? 'warning' : 'info'}">${agendamento.status}</span></div>
                    </div>
                    <div>
                        ${agendamento.status === 'AGENDADO'
                            ? `<button onclick="fazerCheckin(${agendamento.idxReal})" class="btn btn-success btn-large">Fazer Check-in</button>`
                            : `<span class="text-success" style="font-weight:bold;">✓ Presente</span>`}
                    </div>
                </div>
            `;
        });
    }
    html += `</div>`;
    document.getElementById('content').innerHTML = html;
}

function fazerCheckin(idxReal) {
    agendamentos[idxReal].status = 'PRESENTE';
    syncStorage();
    mostrarToast('Check-in realizado!', 'success');
    showCheckin();
}
