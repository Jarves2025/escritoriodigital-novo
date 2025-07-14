import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, jsonify, request, session, send_from_directory
from flask_cors import CORS
from src.models.user import db, User, PerfilEnum
from datetime import datetime

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'sistema-agendamentos-2024'

# Configurar CORS
CORS(app, origins="*", supports_credentials=True)

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Rota de teste
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({'success': True, 'message': 'API funcionando!'})

# Rotas de autenticação - CORRIGIDAS para corresponder ao frontend
@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({'success': True})
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'Dados não fornecidos'}), 400
            
        email = data.get('email')
        senha = data.get('senha')
        
        if not email or not senha:
            return jsonify({'success': False, 'message': 'Email e senha obrigatórios'}), 400
        
        # Verificar credenciais fixas para teste
        if email == 'assistente@escritorio.com' and senha == 'assistente123':
            session['user_id'] = 1
            session['user_email'] = email
            session['user_perfil'] = 'ASSISTENTE'
            
            return jsonify({
                'success': True,
                'message': 'Login realizado com sucesso',
                'user': {
                    'id': 1,
                    'nome': 'Assistente',
                    'email': email,
                    'perfil': 'ASSISTENTE'
                }
            })
        elif email == 'profissional@escritorio.com' and senha == 'profissional123':
            session['user_id'] = 2
            session['user_email'] = email
            session['user_perfil'] = 'PROFISSIONAL'
            
            return jsonify({
                'success': True,
                'message': 'Login realizado com sucesso',
                'user': {
                    'id': 2,
                    'nome': 'Profissional',
                    'email': email,
                    'perfil': 'PROFISSIONAL'
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Email ou senha inválidos'
            }), 401
            
    except Exception as e:
        print(f"Erro no login: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logout realizado'})

@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    return jsonify({
        'success': True,
        'user': {
            'id': session['user_id'],
            'nome': 'Assistente' if session['user_perfil'] == 'ASSISTENTE' else 'Profissional',
            'email': session['user_email'],
            'perfil': session['user_perfil']
        }
    })

# Rotas básicas para clientes e agendamentos (mock)
@app.route('/api/clientes', methods=['GET', 'POST'])
def clientes():
    if request.method == 'GET':
        return jsonify({
            'success': True,
            'clientes': [
                {
                    'id': 1,
                    'nome': 'João Silva',
                    'cpf': '123.456.789-00',
                    'telefone': '(11) 99999-9999',
                    'email': 'joao@email.com',
                    'data_nascimento': '1990-01-01',
                    'endereco': 'Rua das Flores, 123',
                    'observacoes': 'Cliente preferencial'
                },
                {
                    'id': 2,
                    'nome': 'Maria Santos',
                    'cpf': '987.654.321-00',
                    'telefone': '(11) 88888-8888',
                    'email': 'maria@email.com',
                    'data_nascimento': '1985-05-15',
                    'endereco': 'Av. Principal, 456',
                    'observacoes': 'Primeira consulta'
                }
            ]
        })
    elif request.method == 'POST':
        data = request.get_json()
        return jsonify({
            'success': True,
            'message': 'Cliente criado com sucesso',
            'cliente': {
                'id': 3,
                'nome': data.get('nome'),
                'cpf': data.get('cpf')
            }
        })

@app.route('/api/agendamentos', methods=['GET', 'POST'])
def agendamentos():
    if request.method == 'GET':
        return jsonify({
            'success': True,
            'agendamentos': [
                {
                    'id': 1,
                    'cliente': {
                        'id': 1,
                        'nome': 'João Silva',
                        'cpf': '123.456.789-00',
                        'telefone': '(11) 99999-9999'
                    },
                    'data_agendamento': '2025-07-13',
                    'horario': '09:00',
                    'status': 'AGENDADO',
                    'observacoes': 'Consulta de rotina',
                    'prioridade': False,
                    'posicao_fila': 1
                },
                {
                    'id': 2,
                    'cliente': {
                        'id': 2,
                        'nome': 'Maria Santos',
                        'cpf': '987.654.321-00',
                        'telefone': '(11) 88888-8888'
                    },
                    'data_agendamento': '2025-07-13',
                    'horario': '10:00',
                    'status': 'PRESENTE',
                    'observacoes': 'Primeira consulta',
                    'prioridade': False,
                    'posicao_fila': 2
                }
            ]
        })
    elif request.method == 'POST':
        data = request.get_json()
        return jsonify({
            'success': True,
            'message': 'Agendamento criado com sucesso',
            'agendamento': {
                'id': 3,
                'cliente_id': data.get('cliente_id'),
                'data_agendamento': data.get('data_agendamento'),
                'horario': data.get('horario')
            }
        })

# Rotas para check-in
@app.route('/api/checkin/<int:agendamento_id>', methods=['POST'])
def fazer_checkin(agendamento_id):
    return jsonify({
        'success': True,
        'message': 'Check-in realizado com sucesso'
    })

# Rotas para fila de atendimento
@app.route('/api/fila', methods=['GET'])
def fila_atendimento():
    return jsonify({
        'success': True,
        'fila': [
            {
                'id': 1,
                'cliente': {
                    'nome': 'João Silva',
                    'cpf': '123.456.789-00'
                },
                'horario': '09:00',
                'status': 'PRESENTE',
                'posicao': 1,
                'prioridade': False
            },
            {
                'id': 2,
                'cliente': {
                    'nome': 'Maria Santos',
                    'cpf': '987.654.321-00'
                },
                'horario': '10:00',
                'status': 'PRESENTE',
                'posicao': 2,
                'prioridade': False
            }
        ],
        'em_atendimento': None,
        'estatisticas': {
            'total_agendados': 2,
            'presentes': 2,
            'em_atendimento': 0,
            'atendidos': 0
        }
    })

# Estado global para gerenciar chamadas
estado_chamada = {
    'cliente_atual': None,
    'timestamp_chamada': None
}

@app.route('/api/fila/chamar-proximo', methods=['POST'])
def chamar_proximo():
    global estado_chamada
    
    try:
        data = request.get_json()
        cliente_data = data.get('cliente', {})
        
        # Usar dados do cliente enviados ou dados padrão
        proximo_cliente = {
            'nome': cliente_data.get('nome', 'João Silva'),
            'cpf': cliente_data.get('cpf', '123.456.789-00'),
            'horario': cliente_data.get('horario', '09:00'),
            'prioridade': cliente_data.get('prioridade', False)
        }
        
        # Atualizar estado da chamada
        estado_chamada['cliente_atual'] = proximo_cliente
        estado_chamada['timestamp_chamada'] = datetime.now().isoformat()
        
        print(f"Cliente chamado: {proximo_cliente['nome']} - {estado_chamada['timestamp_chamada']}")
        
        return jsonify({
            'success': True,
            'message': 'Próximo cliente chamado',
            'cliente_chamado': proximo_cliente,
            'timestamp': estado_chamada['timestamp_chamada']
        })
        
    except Exception as e:
        print(f"Erro ao chamar próximo: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@app.route('/api/fila/priorizar/<int:agendamento_id>', methods=['POST'])
def priorizar_cliente(agendamento_id):
    return jsonify({
        'success': True,
        'message': 'Cliente priorizado com sucesso'
    })

# Rotas para painel de chamada
@app.route('/api/painel/status', methods=['GET'])
def painel_status():
    global estado_chamada
    
    return jsonify({
        'success': True,
        'cliente_atual': estado_chamada['cliente_atual'],
        'timestamp_chamada': estado_chamada['timestamp_chamada'],
        'proximos': [
            {
                'nome': 'Maria Santos',
                'horario': '10:00',
                'posicao': 1,
                'prioridade': False
            }
        ],
        'estatisticas': {
            'total_agendados': 2,
            'presentes': 1,
            'em_atendimento': 1 if estado_chamada['cliente_atual'] else 0,
            'atendidos': 0
        }
    })

# Rotas para horários disponíveis
@app.route('/api/horarios-disponiveis', methods=['GET'])
def horarios_disponiveis():
    return jsonify({
        'success': True,
        'horarios': [
            {'horario': '08:00', 'disponivel': True},
            {'horario': '08:30', 'disponivel': True},
            {'horario': '09:00', 'disponivel': False},
            {'horario': '09:30', 'disponivel': True},
            {'horario': '10:00', 'disponivel': False},
            {'horario': '10:30', 'disponivel': True},
            {'horario': '11:00', 'disponivel': True},
            {'horario': '11:30', 'disponivel': True},
            {'horario': '14:00', 'disponivel': True},
            {'horario': '14:30', 'disponivel': True},
            {'horario': '15:00', 'disponivel': True},
            {'horario': '15:30', 'disponivel': True},
            {'horario': '16:00', 'disponivel': True},
            {'horario': '16:30', 'disponivel': True},
            {'horario': '17:00', 'disponivel': True}
        ]
    })

# Rota para servir o frontend
@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

# Rota específica para o painel de chamada
@app.route('/painel.html')
def serve_painel():
    return send_from_directory(app.static_folder, 'painel.html')

@app.route('/<path:path>')
def serve_static(path):
    try:
        return send_from_directory(app.static_folder, path)
    except:
        return send_from_directory(app.static_folder, 'index.html')

def init_database():
    """Inicializa o banco de dados"""
    with app.app_context():
        try:
            db.create_all()
            print("Banco de dados inicializado com sucesso!")
        except Exception as e:
            print(f"Erro ao inicializar banco: {e}")

if __name__ == '__main__':
    init_database()
    app.run(host='0.0.0.0', port=5000, debug=True)

