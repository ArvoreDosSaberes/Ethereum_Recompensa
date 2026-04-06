#!/bin/bash

# Script de Configuração Rápida - Registro de Usuários com Recompensa
# Este script ajuda a configurar o ambiente para deploy do contrato

echo "🚀 Script de Configuração - Registro de Usuários com Recompensa"
echo "============================================================="
echo ""

# Verificar se .env existe
if [ -f ".env" ]; then
    echo "⚠️  Arquivo .env já existe!"
    read -p "Deseja sobrescrever? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "❌ Configuração cancelada."
        exit 1
    fi
fi

# Copiar arquivo de exemplo
if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✅ Arquivo .env criado a partir do exemplo"
else
    echo "❌ Arquivo .env.example não encontrado!"
    exit 1
fi

# Solicitar endereço do contrato
echo ""
echo "📍 Configuração do Endereço do Contrato"
echo "----------------------------------------"
read -p "Digite o endereço do seu contrato (ex: 0x123...): " CONTRACT_ADDR

if [ -z "$CONTRACT_ADDR" ]; then
    echo "⚠️  Endereço não fornecido. Usando placeholder."
    CONTRACT_ADDR="0x0000000000000000000000000000000000000000"
fi

# Validar formato do endereço (básico)
if [[ ! $CONTRACT_ADDR =~ ^0x[0-9a-fA-F]{40}$ ]]; then
    echo "❌ Endereço inválido! Formato esperado: 0x seguido por 40 caracteres hexadecimais"
    exit 1
fi

# Atualizar o arquivo .env
sed -i "s/CONTRACT_ADDRESS=.*/CONTRACT_ADDRESS=$CONTRACT_ADDR/" .env

echo ""
echo "📋 Resumo da Configuração"
echo "------------------------"
echo "✅ Arquivo .env criado"
echo "✅ Endereço do contrato: $CONTRACT_ADDR"
echo ""

# Verificar instalação do Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js encontrado: $(node --version)"
else
    echo "⚠️  Node.js não encontrado. Instale Node.js para rodar a aplicação web."
fi

# Verificar instalação do Python (para servidor HTTP)
if command -v python3 &> /dev/null; then
    echo "✅ Python3 encontrado: $(python3 --version)"
elif command -v python &> /dev/null; then
    echo "✅ Python encontrado: $(python --version)"
else
    echo "⚠️  Python não encontrado. Instale Python para servidor HTTP."
fi

echo ""
echo "🌐 Próximos Passos"
echo "------------------"
echo "1. Abra o Remix IDE: https://remix.ethereum.org/"
echo "2. Copie o código do contrato para o Remix"
echo "3. Compile e faça o deploy na rede Sepolia"
echo "4. Copie o endereço do contrato deployado"
echo "5. Execute este script novamente para atualizar o endereço"
echo "6. Inicie a aplicação web:"
echo "   cd web"
echo "   python3 -m http.server 8000"
echo "   ou"
echo "   npm install && npm start"
echo ""
echo "📖 Tutorial completo disponível em: TUTORIAL_REMIX_DEPLOY.md"
echo ""

# Criar diretório de logs se não existir
if [ ! -d "logs" ]; then
    mkdir -p logs
    echo "✅ Diretório de logs criado"
fi

echo ""
echo "🎉 Configuração concluída com sucesso!"
echo "======================================"
