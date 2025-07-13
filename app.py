from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from firebase_config import db
import datetime
from google.cloud import firestore
import uuid

app = Flask(__name__)
app.secret_key = 'sua-chave-secreta-pode-ser-qualquer-coisa'

# Autenticação / Sessão
@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('painel'))
    return render_template('index.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('user_role', None)
    return redirect(url_for('index'))

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

# Painel
@app.route('/painel')
def painel():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    role = session['user_role']
    if role == 'ASSISTENTE':
        return render_template('painel.html', role=role)
    elif role == 'PROFISSIONAL':
        hoje = datetime.datetime.now().strftime('%Y-%m-%d')
        agendHoje = list(db.collection('agendamentos')
                         .where('data', '==', hoje)
                         .order_by('hora')
                         .stream())
        agend_list = [ { **a.to_dict(), 'id': a.id } for a in agendHoje ]
        return render_template('painel.html', role=role, agendamentos=agend_list)
    return redirect(url_for('index'))

# Listar clientes
@app.route('/clientes')
def clientes():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    docs = list(db.collection('clientes').stream())
    clientes = [ c.to_dict() for c in docs ]
    return render_template('clientes.html', clientes=clientes)

# Agendamento
@app.route('/agendamento/<cpf>')
def agendamento(cpf):
    if 'user_id' not in session:
        return redirect(url_for('index'))
    cliente_doc = db.collection('clientes').document(cpf).get()
    if not cliente_doc.exists:
        return "Cliente não encontrado", 404
    cliente = cliente_doc.to_dict()
    return render_template('agendamento.html', cliente=cliente)

@app.route('/salvar_agendamento', methods=["POST"])
def salvar_agendamento():
    cpf = request.form.get('cpf')
    nome = request.form.get('nome')
    data = request.form.get('data')
    hora = request.form.get('hora')
    profissional = request.form.get('profissional')
    agendamento = {
        'cpf': cpf,
        'nome': nome,
        'data': data,
        'hora': hora,
        'profissional': profissional,
        'chamado': False
    }
    db.collection('agendamentos').add(agendamento)
    return redirect(url_for('painel'))

# Chamada
@app.route('/api/chamar/<ag_id>', methods=['POST'])
def api_chamar(ag_id):
    ref = db.collection('agendamentos').document(ag_id)
    ref.update({'chamado': True})
    doc = ref.get()
    nome = doc.to_dict().get('nome')
    return jsonify({'status':'ok','nome': nome})

@app.route('/chamada_publica')
def chamada_publica():
    hoje = datetime.datetime.now().strftime('%Y-%m-%d')
    chamado = list(db.collection('agendamentos')
                   .where('data','==',hoje)
                   .where('chamado','==',True)
                   .order_by('hora', direction=firestore.Query.DESCENDING)
                   .limit(1)
                   .stream())
    nome = chamado[0].to_dict()['nome'] if chamado else ''
    return render_template('chamada.html', nome=nome)

if __name__ == '__main__':
    app.run(debug=True)
