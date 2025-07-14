# Sistema de Gestão de Clientes e Agendamentos - Requisitos

## Visão Geral
Sistema web para gestão completa de clientes e agendamentos de escritório, com interfaces específicas para diferentes perfis de usuário e funcionalidades de controle de fila de atendimento.

## Funcionalidades Principais

### 1. Cadastro de Clientes
- Nome Completo
- CPF
- Data de Nascimento
- Telefone
- Endereço Completo
- Interface para busca e edição de clientes

### 2. Sistema de Agendamentos
- Limite de 15 atendimentos diários
- Horários fixos distribuídos em:
  - **Manhã (8 horários)**: 08:00, 08:30, 09:00, 09:30, 10:00, 10:30, 11:00, 11:30
  - **Tarde (7 horários)**: 14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00
- Agendamento por data e horário
- Visualização de agenda diária/semanal

### 3. Sistema de Check-in
- Interface para clientes fazerem check-in na chegada
- Atualização automática do status na fila
- Registro de horário de chegada

### 4. Gestão da Fila de Atendimento
- Visualização de clientes aguardando
- Ordem de atendimento baseada em horário agendado
- Funcionalidade de priorização manual
- Status dos clientes (Agendado, Presente, Em Atendimento, Atendido)

## Perfis de Usuário

### 1. ASSISTENTE (Secretário)
- Cadastro e edição de clientes
- Agendamento de consultas
- Realizar check-in de clientes
- Visualizar fila de espera
- Gerenciar status dos atendimentos

### 2. PROFISSIONAL (Consultório)
- Visualizar fila de atendimento
- Chamar próximo cliente
- Priorizar clientes na fila
- Acesso ao painel de chamada para monitor externo
- Gestão completa dos agendamentos

## Interfaces Necessárias

### 1. Painel do Secretário
- Dashboard com agenda do dia
- Formulário de cadastro/edição de clientes
- Interface de agendamento
- Lista de clientes presentes
- Botões de check-in

### 2. Painel do Consultório
- Fila de atendimento em tempo real
- Botão "Chamar Próximo"
- Botão "Priorizar Cliente"
- Controles de gestão da fila
- Acesso ao painel de chamada

### 3. Interface de Check-in
- Tela simplificada para clientes
- Busca por CPF ou nome
- Confirmação de presença

### 4. Painel de Chamada (Monitor Externo)
- Exibição do cliente sendo chamado
- Número da sala/consultório
- Sinal sonoro de alta qualidade
- Design limpo e visível

## Requisitos Técnicos

### Backend
- Framework: Flask (Python)
- Banco de dados: SQLite (para simplicidade)
- APIs RESTful
- Autenticação por e-mail e senha
- WebSocket para atualizações em tempo real

### Frontend
- Framework: React
- Interface responsiva
- Atualizações em tempo real
- Notificações sonoras
- Design moderno e intuitivo

### Funcionalidades Especiais
- Sinal sonoro para chamadas
- Atualizações automáticas das filas
- Sincronização entre diferentes painéis
- Backup automático dos dados

## Fluxo de Trabalho

1. **Agendamento**: Secretário agenda cliente para data/horário específico
2. **Chegada**: Cliente faz check-in na recepção
3. **Fila**: Cliente entra na fila de espera
4. **Chamada**: Profissional chama próximo cliente
5. **Atendimento**: Cliente é atendido
6. **Finalização**: Status atualizado para "Atendido"

## Segurança
- Autenticação obrigatória
- Sessões seguras
- Validação de dados
- Proteção contra acesso não autorizado

