from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from firebase_config import db # Importa nosso banco de dados
import datetime

app = Flask(__name__)
# Chave secreta para gerenciar sessões de login. Pode ser qualquer string.
app.secret_key = 'sua-chave-secreta-pode-ser-qualquer-coisa'

# --- ROTAS DE AUTENTICAÇÃO ---

@app.route('/')
def index():
    # Se o usuário já estiver logado, redireciona para o painel
    if 'user_id' in session:
        return redirect(url_for('painel'))
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    # Esta é uma rota de exemplo. A autenticação real será com Google no frontend.
    # Por enquanto, vamos focar em ter o usuário logado na sessão.
    # A lógica de login do Google será adicionada ao index.html
    return redirect(url_for('painel'))

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('user_role', None)
    return redirect(url_for('index'))

# --- ROTAS PRINCIPAIS DO SISTEMA ---

@app.route('/painel')
def painel():
    # Protege a rota: se não estiver logado, volta para o início
    if 'user_id' not in session:
        return redirect(url_for('index'))

    role = session.get('user_role', 'ASSISTENTE') # Padrão para assistente
    
    # Lógica para o Assistente
    if role == 'ASSISTENTE':
        hoje = datetime.datetime.now().strftime('%Y-%m-%d')
        return render_template('painel.html', role=role, data_selecionada=hoje)

    # Lógica para o Profissional
    elif role == 'PROFISSIONAL':
        return render_template('painel.html', role=role)
        
    return redirect(url_for('index')) # Se não tiver role, volta

@app.route('/chamada')
def chamada():
    # Página da sala de espera
    return render_template('chamada.html')

# --- API INTERNA (para o JavaScript interagir com o Python) ---

@app.route('/api/set_session', methods=['POST'])
def set_session():
    data = request.json
    user_id = data.get('uid')
    
    if not user_id:
        return jsonify({'status': 'error', 'message': 'UID não fornecido'}), 400

    try:
        # Verifica a permissão do usuário no Firestore
        user_ref = db.collection('usuarios').document(user_id).get()
        if user_ref.exists:
            user_data = user_ref.to_dict()
            session['user_id'] = user_id
            session['user_role'] = user_data.get('role', 'ASSISTENTE')
            return jsonify({'status': 'success', 'role': session['user_role']})
        else:
            return jsonify({'status': 'error', 'message': 'Usuário não autorizado'}), 403
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# --- Ponto de entrada para rodar o app ---
if __name__ == '__main__':
    app.run(debug=True)
