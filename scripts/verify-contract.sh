#!/bin/bash

# Script para verificar o endereço do contrato na Sepolia
echo "🔍 Verificando contrato na Sepolia..."
echo ""

CONTRACT_ADDRESS="0xCF2aB63a9bA9F7B96cd949f1fB69518ea9aBBD6a"
ETHERSCAN_URL="https://sepolia.etherscan.io/address/$CONTRACT_ADDRESS"

echo "📍 Endereço do contrato: $CONTRACT_ADDRESS"
echo "🌐 Etherscan: $ETHERSCAN_URL"
echo ""

# Verificar se é um contrato ou EOA
echo -n "📊 Verificando tipo de endereço... "
RESPONSE=$(curl -s -L "$ETHERSCAN_URL" | grep -i "Contract:" | head -1)

if [[ $RESPONSE == *"Contract:"* ]]; then
    echo "✅ É um Smart Contract!"
    
    # Verificar se está verificado
    if [[ $RESPONSE == *"Unverified"* ]]; then
        echo "⚠️  Contrato não verificado"
    else
        echo "✅ Contrato verificado"
    fi
    
    # Verificar transações
    TRANSACTIONS=$(curl -s -L "$ETHERSCAN_URL" | grep -o "Transactions: [0-9]*" | head -1)
    echo "📈 $TRANSACTIONS"
    
else
    echo "❌ Não é um Smart Contract (é uma EOA)"
fi

echo ""
echo "🔗 Link para verificação: $ETHERSCAN_URL"
echo ""
echo "✅ Verificação concluída!"
