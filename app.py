from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from firebase_config import db  # Firebase Firestore
import datetime

app = Flask(__name__)
app.secret_key = 'sua-chave-secreta-pode-ser-qualquer-coisa'

# --- ROTAS DE AUTENTICAÇÃO ---

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('painel'))
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    # Apenas redireciona; login é feito via Firebase no frontend
    return redirect(url_for('painel'))

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('user_role', None)
    return redirect(url_for('index'))

# --- ROTAS PRINCIPAIS DO SISTEMA ---

@app.route('/painel')
def painel():
    if 'user_id' not in session:
        return redirect(url_for('index'))

    role = session.get('user_role', 'ASSISTENTE')
    if role == 'ASSISTENTE':
        hoje = datetime.datetime.now().strftime('%Y-%m-%d')
        return render_template('painel.html', role=role, data_selecionada=hoje)
    elif role == 'PROFISSIONAL':
        return render_template('painel.html', role=role)

    return redirect(url_for('index'))

@app.route('/chamada')
def chamada():
    return render_template('chamada.html')

# --- API PARA SETAR SESSÃO VIA FIREBASE ---

@app.route('/api/set_session', methods=['POST'])
def set_session():
    data = request.json
    user_id = data.get('uid')

    if not user_id:
        return jsonify({'status': 'error', 'message': 'UID não fornecido'}), 400

    try:
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

# --- CADASTRO DE PACIENTES ---

@app.route("/pacientes")
def pacientes():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template("pacientes.html")

@app.route("/salvar_paciente", methods=["POST"])
def salvar_paciente():
    try:
        cpf = request.form.get("cpf").replace(".", "").replace("-", "")
        paciente = {
            "nome": request.form.get("nome"),
            "cpf": cpf,
            "data_nascimento": request.form.get("data_nascimento"),
            "telefone": request.form.get("telefone"),
            "senha_gov": request.form.get("senha_gov"),
            "observacoes": request.form.get("observacoes", "")
        }

        db.collection("pacientes").document(cpf).set(paciente)
        return render_template("pacientes.html", mensagem="Paciente cadastrado com sucesso!")
    except Exception as e:
        return render_template("pacientes.html", erro=f"Erro ao salvar: {str(e)}")

# --- INICIAR APP ---

if __name__ == '__main__':
    app.run(debug=True)
