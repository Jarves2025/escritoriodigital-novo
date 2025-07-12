import firebase_admin
from firebase_admin import credentials, firestore
import os

# Garante que só inicialize uma vez (evita erros em produção ou debug Flask)
if not firebase_admin._apps:
    cred_path = os.path.join(os.path.dirname(__file__), 'firebase-credentials.json')
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

# Exporta o client do Firestore
db = firestore.client()
