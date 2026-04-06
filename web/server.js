/**
 * Servidor simples para a DApp
 * Projeto Capacitação Web3 - Árvore dos Saberes
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Rota principal
app.get('/', (req, res) => {
    // Injetar variáveis de ambiente no HTML
    let htmlContent = require('fs').readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    
    // Substituir placeholder pelo endereço do contrato se existir
    if (process.env.CONTRACT_ADDRESS) {
        htmlContent = htmlContent.replace(
            '<!-- Contract address will be injected here -->',
            `<script>window.CONTRACT_ADDRESS = '${process.env.CONTRACT_ADDRESS}';</script>`
        );
    }
    
    res.send(htmlContent);
});

// API para obter endereço do contrato (se existir)
app.get('/api/contract-address', (req, res) => {
    const contractAddress = process.env.CONTRACT_ADDRESS || null;
    res.json({ contractAddress });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor DApp rodando em http://localhost:${PORT}`);
    console.log(`📁 Servindo arquivos de: ${__dirname}`);
    console.log(`🔍 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
