# Sistema de Agendamentos

Sistema completo para gestão de clientes, agendamentos e fila de atendimento com painel de chamada para monitor externo.

## 🌐 Demo Online

**URL:** https://w5hni7c7l7n0.manus.space

**Credenciais:**
- Assistente: `assistente@escritorio.com` / `assistente123`
- Profissional: `profissional@escritorio.com` / `profissional123`

## ✨ Funcionalidades

- 👥 **Gestão de Clientes** - Cadastro completo com CRUD
- 📅 **Sistema de Agendamentos** - Agendamento por data/horário
- ✅ **Check-in** - Interface para recepção
- 🎯 **Fila de Atendimento** - Gestão da fila com priorização
- 📺 **Painel de Chamada** - Monitor externo com som e voz
- 🔊 **Síntese de Voz** - Chamada automática de clientes
- 📱 **Interface Responsiva** - Funciona em desktop e mobile

## 🚀 Instalação

### Pré-requisitos
- Python 3.11+
- pip

### Passos

1. **Clone/baixe o projeto**
```bash
# Extrair arquivos do projeto
```

2. **Instale as dependências**
```bash
pip install -r requirements.txt
```

3. **Execute o servidor**
```bash
cd src
python main.py
```

4. **Acesse o sistema**
```
http://localhost:5000
```

## 📁 Estrutura do Projeto

```
src/
├── main.py              # Servidor Flask principal
├── static/              # Arquivos estáticos
│   ├── index.html      # Interface principal
│   └── painel.html     # Painel de chamada
├── models/             # Modelos de dados
│   └── user.py         # Modelo de usuário
├── routes/             # Rotas da API
│   └── user.py         # Rotas de usuário
└── database/           # Banco de dados
    └── app.db          # SQLite database
```

## 🔧 Tecnologias

- **Backend:** Flask (Python)
- **Frontend:** HTML5, CSS3, JavaScript
- **Banco:** SQLite
- **Áudio:** Web Audio API + Speech Synthesis

## 📖 Como Usar

### 1. Login
- Acesse o sistema com as credenciais fornecidas

### 2. Cadastro de Clientes
- Menu "👥 Clientes" → "➕ Novo Cliente"
- Preencha nome, CPF e telefone (obrigatórios)

### 3. Agendamentos
- Menu "📅 Agendamentos" → "➕ Novo Agendamento"
- Selecione cliente, data e horário

### 4. Check-in
- Menu "✅ Check-in"
- Busque o cliente e clique "Check-in"

### 5. Fila de Atendimento
- Menu "🎯 Fila de Atendimento"
- Clique "📢 Chamar Próximo" para chamar clientes

### 6. Painel de Chamada
- Menu "📺 Painel de Chamada"
- Posicione a nova janela no monitor da recepção
- Atualização automática com som e voz

## 🔊 Recursos de Áudio

O sistema possui:
- **Sinal sonoro** (3 bips) quando cliente é chamado
- **Síntese de voz** em português: "[Nome], favor dirigir-se ao consultório"
- **Atualização automática** do painel a cada 3 segundos

## 🌐 Deploy

O sistema está configurado para deploy na plataforma Manus Cloud:

```bash
# Deploy automático
manus-deploy-backend flask .
```

## 📋 APIs Principais

- `POST /api/login` - Autenticação
- `GET/POST/PUT/DELETE /api/clientes` - Gestão de clientes
- `GET/POST /api/agendamentos` - Gestão de agendamentos
- `POST /api/checkin/{id}` - Check-in de clientes
- `GET /api/fila` - Estado da fila
- `POST /api/fila/chamar-proximo` - Chamar próximo cliente
- `GET /api/painel/status` - Status do painel

## 🔒 Segurança

- Autenticação por sessão
- Validação de dados no backend
- Sanitização de inputs
- CORS configurado
- Rate limiting básico

## 🐛 Troubleshooting

### Painel não atualiza
1. Clique na tela do painel para ativar áudio
2. Verifique console do navegador (F12)
3. Recarregue a página do painel

### Sem áudio
1. Permita áudio no navegador
2. Verifique volume do sistema
3. Clique na tela do painel

### Erro de login
1. Verifique credenciais
2. Limpe cache do navegador

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação completa
2. Verifique logs no console do navegador
3. Entre em contato com o suporte técnico

## 📄 Licença

Sistema desenvolvido para uso interno. Todos os direitos reservados.

---

**🎯 Sistema pronto para uso em produção!**

