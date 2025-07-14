#!/usr/bin/env python3
"""
Script de execução do Sistema de Agendamentos
"""

import os
import sys

# Adicionar o diretório src ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

if __name__ == '__main__':
    from main import app
    
    # Configurações para desenvolvimento
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )

