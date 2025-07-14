function showRelatorio() {
    currentPage = 'relatorio';
    setActiveNav('nav-relatorio');
    let html = `
        <h2>Relatório de Atendimentos</h2>
        <button onclick="exportarPDF()" class="btn btn-primary" style="margin-bottom:1.5rem;">Exportar PDF</button>
        <table>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Horário Chamado</th>
                    <th>Início Atendimento</th>
                    <th>Fim Atendimento</th>
                    <th>Duração</th>
                </tr>
            </thead>
            <tbody>
    `;
    if (atendidos.length === 0) {
        html += `<tr><td colspan="5" style="text-align:center;color:#999;">Nenhum atendimento registrado</td></tr>`;
    } else {
        atendidos.forEach(cli => {
            html += `
                <tr>
                    <td>${cli.nome}</td>
                    <td>${cli.chamadoEm || '-'}</td>
                    <td>${cli.iniciadoEm || '-'}</td>
                    <td>${cli.finalizadoEm || '-'}</td>
                    <td>${cli.duracao || '-'}</td>
                </tr>
            `;
        });
    }
    html += `</tbody></table>`;
    document.getElementById('content').innerHTML = html;
}

// Exportação para PDF usando print (pode trocar para lib como jsPDF depois)
function exportarPDF() {
    window.print();
}
