import firebase_admin
from firebase_admin import credentials, firestore
import os

# Carrega as credenciais do Firebase a partir de um arquivo JSON.
# Vamos configurar este arquivo no Render.
cred = credentials.Certificate('firebase-credentials.json') 
firebase_admin.initialize_app(cred)

# Exporta a instância do banco de dados para ser usada em outros arquivos.
db = firestore.client()
