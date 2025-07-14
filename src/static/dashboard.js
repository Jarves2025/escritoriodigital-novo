function showDashboard() {
    currentPage = 'dashboard';
    setActiveNav('nav-dashboard');
    const hoje = hojeISO();

    // Filtros do dia
    const agendamentosHoje = agendamentos.filter(a => a.data === hoje);

    let html = `
        <div>
            <div class="dashboard-title">Cássio Moura Advocacia - Barro Duro</div>
            <div class="dashboard-date">${new Date().toLocaleDateString('pt-BR')}</div>
        </div>
        <div class="stats-grid">
            <div class="stat-card">
                <span class="numero">${agendamentosHoje.length}</span>
                <span class="label">Agendamentos Hoje</span>
            </div>
            <div class="stat-card">
                <span class="numero">${agendamentosHoje.filter(a => a.status === 'PRESENTE').length}</span>
                <span class="label">Presentes</span>
            </div>
            <div class="stat-card">
                <span class="numero">${agendamentosHoje.filter(a => a.status === 'EM_ATENDIMENTO').length}</span>
                <span class="label">Em Atendimento</span>
            </div>
            <div class="stat-card">
                <span class="numero">${agendamentosHoje.filter(a => a.status === 'ATENDIDO').length}</span>
                <span class="label">Atendidos</span>
            </div>
        </div>
        <div id="dashboard-agendamentos-title">
            <h3>Agendamentos de Hoje</h3>
        </div>
        <table id="dashboard-agendamentos-table">
            <thead>
                <tr>
                    <th>Cliente</th>
                    <th>Horário</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    agendamentosHoje.forEach(agendamento => {
        const statusClass = agendamento.status === 'ATENDIDO' ? 'success' : 
                           agendamento.status === 'EM_ATENDIMENTO' ? 'info' :
                           agendamento.status === 'PRESENTE' ? 'warning' : 'secondary';

        html += `
            <tr>
                <td>${agendamento.clienteNome || agendamento.nome}</td>
                <td>${agendamento.horario}</td>
                <td><span class="badge ${statusClass}">${agendamento.status}</span></td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    document.getElementById('content').innerHTML = html;
}
