function showClientes() {
    currentPage = 'clientes';
    setActiveNav('nav-clientes');

    let html = `
        <h2>Gestão de Clientes</h2>
        <button onclick="abrirClienteModal()" class="btn btn-primary">➕ Novo Cliente</button>
        <table style="margin-top: 1rem;">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Telefone</th>
                    <th>E-mail</th>
                    <th>Endereço</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (clientes.length === 0) {
        html += `<tr><td colspan="6" style="text-align:center;color:#888;">Nenhum cliente cadastrado</td></tr>`;
    } else {
        clientes.forEach((cliente, idx) => {
            let endereco = `${cliente.logradouro || ''}, ${cliente.numero || ''}`.trim();
            if (cliente.bairro) endereco += `, ${cliente.bairro}`;
            if (cliente.cidade) endereco += `, ${cliente.cidade}`;
            if (cliente.uf) endereco += ` - ${cliente.uf}`;
            if (cliente.cep) endereco += ` (${cliente.cep})`;
            html += `
                <tr>
                    <td>${cliente.nome}</td>
                    <td>${cliente.cpf}</td>
                    <td>${cliente.telefone}</td>
                    <td>${cliente.email || '-'}</td>
                    <td style="font-size:0.95em">${endereco || '-'}</td>
                    <td>
                        <button onclick="editarCliente(${idx})" class="btn btn-info">Editar</button>
                        <button onclick="excluirCliente(${idx})" class="btn btn-danger">Excluir</button>
                    </td>
                </tr>
            `;
        });
    }

    html += '</tbody></table>';
    document.getElementById('content').innerHTML = html;
}

// Modal Wizard Cliente
function abrirClienteModal() {
    document.getElementById('wizardClienteTitulo').innerText = 'Novo Cliente';
    document.getElementById('clienteWizardForm').reset();
    preencherUFs('ufCliente');
    mostrarWizardClienteEtapa(1);
    document.getElementById('clienteModal').style.display = 'block';
}

function fecharClienteModal() {
    document.getElementById('clienteModal').style.display = 'none';
}

// Wizard de etapas
function mostrarWizardClienteEtapa(n) {
    for(let i=1; i<=4; i++) {
        document.getElementById(`wizardClienteEtapa${i}`).style.display = (i === n) ? '' : 'none';
        document.getElementById(`stepCliente${i}`).classList.toggle('active', i === n);
    }
    if (n === 4) montarResumoCliente();
}

// Próximo/voltar
function wizardClienteProximaEtapa(para) {
    if (para === 2) {
        // Validação Etapa 1
        if (!document.getElementById('nomeCliente').value.trim() ||
            !document.getElementById('cpfCliente').value.trim() ||
            !document.getElementById('telefoneCliente').value.trim()
        ) {
            mostrarToast('Preencha todos os campos obrigatórios!', 'error');
            return;
        }
    }
    if (para === 3) {
        // Etapa 2 não é obrigatória (endereço pode ficar em branco)
    }
    if (para === 4) {
        // Etapa 3 não é obrigatória (e-mail/senha gov podem ficar em branco)
    }
    mostrarWizardClienteEtapa(para);
}
function wizardClienteVoltarEtapa(para) {
    mostrarWizardClienteEtapa(para);
}

// Máscara de CEP para input
function mascaraCEP(campo) {
    let v = campo.value.replace(/\D/g, '');
    if (v.length > 5) v = v.slice(0,5) + '-' + v.slice(5,8);
    campo.value = v;
    // Busca CEP automático
    if (v.replace(/\D/g, '').length === 8) {
        buscarCEP(v, function(data) {
            if (data && !data.erro) {
                document.getElementById('logradouroCliente').value = data.logradouro || '';
                document.getElementById('bairroCliente').value = data.bairro || '';
                document.getElementById('cidadeCliente').value = data.localidade || '';
                document.getElementById('ufCliente').value = data.uf || '';
            }
        });
    }
}

// Monta o resumo antes de salvar
function montarResumoCliente() {
    const nome = document.getElementById('nomeCliente').value.trim();
    const cpf = document.getElementById('cpfCliente').value.trim();
    const dataNasc = document.getElementById('dataNascCliente').value.trim();
    const telefone = document.getElementById('telefoneCliente').value.trim();
    const cep = document.getElementById('cepCliente').value.trim();
    const logradouro = document.getElementById('logradouroCliente').value.trim();
    const numero = document.getElementById('numeroCliente').value.trim();
    const complemento = document.getElementById('complementoCliente').value.trim();
    const bairro = document.getElementById('bairroCliente').value.trim();
    const cidade = document.getElementById('cidadeCliente').value.trim();
    const uf = document.getElementById('ufCliente').value.trim();
    const email = document.getElementById('emailCliente').value.trim();
    const senhaGov = document.getElementById('senhaGovCliente').value.trim();
    const obs = document.getElementById('observacoesCliente').value.trim();

    let resumo = `
    <label>Nome:</label> ${nome}<br>
    <label>CPF:</label> ${cpf}<br>
    <label>Nascimento:</label> ${dataNasc || '-'}<br>
    <label>Telefone:</label> ${telefone}<br>
    <label>CEP:</label> ${cep || '-'}<br>
    <label>Endereço:</label> ${logradouro || '-'}, ${numero || ''} ${complemento ? ', ' + complemento : ''}<br>
    <label>Bairro:</label> ${bairro || '-'}<br>
    <label>Cidade:</label> ${cidade || '-'}<br>
    <label>UF:</label> ${uf || '-'}<br>
    <label>E-mail:</label> ${email || '-'}<br>
    <label>Senha Gov:</label> ${senhaGov || '-'}<br>
    <label>Observações:</label> ${obs || '-'}
    `;
    document.getElementById('wizardClienteResumo').innerHTML = resumo;
}

// Salva o cliente (wizard)
function salvarClienteWizard() {
    const nome = document.getElementById('nomeCliente').value.trim();
    const cpf = document.getElementById('cpfCliente').value.trim();
    const dataNasc = document.getElementById('dataNascCliente').value.trim();
    const telefone = document.getElementById('telefoneCliente').value.trim();
    const cep = document.getElementById('cepCliente').value.trim();
    const logradouro = document.getElementById('logradouroCliente').value.trim();
    const numero = document.getElementById('numeroCliente').value.trim();
    const complemento = document.getElementById('complementoCliente').value.trim();
    const bairro = document.getElementById('bairroCliente').value.trim();
    const cidade = document.getElementById('cidadeCliente').value.trim();
    const uf = document.getElementById('ufCliente').value.trim();
    const email = document.getElementById('emailCliente').value.trim();
    const senhaGov = document.getElementById('senhaGovCliente').value.trim();
    const observacoes = document.getElementById('observacoesCliente').value.trim();

    if (!nome || !cpf || !telefone) {
        mostrarToast('Preencha todos os campos obrigatórios!', 'error');
        return;
    }
    clientes.push({
        nome, cpf, dataNasc, telefone, cep, logradouro, numero, complemento, bairro,
        cidade, uf, email, senhaGov, observacoes
    });
    syncStorage();
    fecharClienteModal();
    mostrarToast('Cliente cadastrado com sucesso!', 'success');
    showClientes();
}

function editarCliente(idx) {
    const cliente = clientes[idx];
    document.getElementById('wizardClienteTitulo').innerText = 'Editar Cliente';
    document.getElementById('clienteWizardForm').reset();
    document.getElementById('nomeCliente').value = cliente.nome || '';
    document.getElementById('cpfCliente').value = cliente.cpf || '';
    document.getElementById('dataNascCliente').value = cliente.dataNasc || '';
    document.getElementById('telefoneCliente').value = cliente.telefone || '';
    document.getElementById('cepCliente').value = cliente.cep || '';
    document.getElementById('logradouroCliente').value = cliente.logradouro || '';
    document.getElementById('numeroCliente').value = cliente.numero || '';
    document.getElementById('complementoCliente').value = cliente.complemento || '';
    document.getElementById('bairroCliente').value = cliente.bairro || '';
    document.getElementById('cidadeCliente').value = cliente.cidade || '';
    preencherUFs('ufCliente');
    document.getElementById('ufCliente').value = cliente.uf || '';
    document.getElementById('emailCliente').value = cliente.email || '';
    document.getElementById('senhaGovCliente').value = cliente.senhaGov || '';
    document.getElementById('observacoesCliente').value = cliente.observacoes || '';
    mostrarWizardClienteEtapa(1);

    // Troca a função de salvar para edição
    document.getElementById('wizardClienteEtapa4').querySelector('.btn-success').onclick = function() {
        salvarEdicaoClienteWizard(idx);
    };
    document.getElementById('clienteModal').style.display = 'block';
}

function salvarEdicaoClienteWizard(idx) {
    clientes[idx] = {
        nome: document.getElementById('nomeCliente').value.trim(),
        cpf: document.getElementById('cpfCliente').value.trim(),
        dataNasc: document.getElementById('dataNascCliente').value.trim(),
        telefone: document.getElementById('telefoneCliente').value.trim(),
        cep: document.getElementById('cepCliente').value.trim(),
        logradouro: document.getElementById('logradouroCliente').value.trim(),
        numero: document.getElementById('numeroCliente').value.trim(),
        complemento: document.getElementById('complementoCliente').value.trim(),
        bairro: document.getElementById('bairroCliente').value.trim(),
        cidade: document.getElementById('cidadeCliente').value.trim(),
        uf: document.getElementById('ufCliente').value.trim(),
        email: document.getElementById('emailCliente').value.trim(),
        senhaGov: document.getElementById('senhaGovCliente').value.trim(),
        observacoes: document.getElementById('observacoesCliente').value.trim()
    };
    syncStorage();
    fecharClienteModal();
    mostrarToast('Cliente atualizado com sucesso!', 'success');
    showClientes();
}

function excluirCliente(idx) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        clientes.splice(idx, 1);
        syncStorage();
        mostrarToast('Cliente excluído com sucesso!', 'success');
        showClientes();
    }
}
