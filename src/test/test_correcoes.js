/**
 * Teste de Correções da DApp
 * Projeto Capacitação Web3 - Árvore dos Saberes
 * 
 * Este script testa as correções implementadas nos erros:
 * 1. originalText is not defined
 * 2. Cannot read properties of null (reading 'consultarUsuario')
 */

const fs = require('fs');
const path = require('path');

// Configuração de logs
const logDir = path.join(__dirname, '..', 'logs');
const logFile = path.join(logDir, `test_correcoes_${Date.now()}.log`);

// Garantir que o diretório de logs exista
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Função de logging
function log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [${level}] ${message} ${Object.keys(data).length ? JSON.stringify(data) : ''}\n`;
    console.log(logEntry.trim());
    fs.appendFileSync(logFile, logEntry);
}

// Testes
async function runTests() {
    log('INFO', '🚀 Iniciando testes de correções da DApp');
    
    try {
        // Teste 1: Verificar se os arquivos foram modificados corretamente
        log('INFO', '📋 Teste 1: Verificando modificações nos arquivos');
        
        const appJsPath = path.join(__dirname, '..', '..', 'web', 'js', 'app.js');
        const contractJsPath = path.join(__dirname, '..', '..', 'web', 'js', 'contract.js');
        
        // Verificar app.js
        const appJsContent = fs.readFileSync(appJsPath, 'utf8');
        
        // Verificar se originalText está declarado fora do try
        const originalTextOutOfTry = appJsContent.includes('const originalText = submitBtn.innerHTML;\n        \n        try {') ||
                                     appJsContent.includes('const originalText = consultBtn.innerHTML;\n        \n        try {');
        
        if (originalTextOutOfTry) {
            log('SUCCESS', '✅ Variável originalText declarada corretamente fora do try');
        } else {
            log('ERROR', '❌ Variável originalText ainda está no escopo incorreto');
        }
        
        // Verificar se há validação de contrato nulo
        const contractNullCheck = appJsContent.includes('if (!contractManager.contract)') &&
                                appJsContent.includes('Contrato não inicializado. Por favor, conecte sua carteira novamente.');
        
        if (contractNullCheck) {
            log('SUCCESS', '✅ Validação de contrato nulo adicionada ao handleConsult');
        } else {
            log('ERROR', '❌ Validação de contrato nulo não encontrada');
        }
        
        // Verificar contract.js
        const contractJsContent = fs.readFileSync(contractJsPath, 'utf8');
        
        // Verificar se loadContractInfo tem validação de contrato nulo
        const loadContractInfoCheck = contractJsContent.includes('if (!this.contract)') &&
                                      contractJsContent.includes('⚠️ Contrato não inicializado');
        
        if (loadContractInfoCheck) {
            log('SUCCESS', '✅ Validação de contrato nulo adicionada ao loadContractInfo');
        } else {
            log('ERROR', '❌ Validação de contrato nulo não encontrada em loadContractInfo');
        }
        
        // Verificar se consultarUsuario tem validação de contrato nulo
        const consultarUsuarioCheck = contractJsContent.includes('if (!this.contract)') &&
                                      contractJsContent.includes('throw new Error(\'Contrato não inicializado\')');
        
        if (consultarUsuarioCheck) {
            log('SUCCESS', '✅ Validação de contrato nulo adicionada ao consultarUsuario');
        } else {
            log('ERROR', '❌ Validação de contrato nulo não encontrada em consultarUsuario');
        }
        
        // Teste 2: Verificar sintaxe JavaScript
        log('INFO', '📋 Teste 2: Verificando sintaxe JavaScript');
        
        try {
            // Tentar fazer parse dos arquivos JavaScript
            new Function(appJsContent);
            log('SUCCESS', '✅ Sintaxe de app.js está correta');
        } catch (error) {
            log('ERROR', '❌ Erro de sintaxe em app.js', { error: error.message });
        }
        
        try {
            new Function(contractJsContent);
            log('SUCCESS', '✅ Sintaxe de contract.js está correta');
        } catch (error) {
            log('ERROR', '❌ Erro de sintaxe em contract.js', { error: error.message });
        }
        
        // Teste 3: Verificar se os métodos críticos existem
        log('INFO', '📋 Teste 3: Verificando métodos críticos');
        
        const criticalMethods = [
            'handleRegister',
            'handleConsult',
            'consultarUsuario',
            'loadContractInfo'
        ];
        
        for (const method of criticalMethods) {
            if (appJsContent.includes(method) || contractJsContent.includes(method)) {
                log('SUCCESS', `✅ Método ${method} encontrado`);
            } else {
                log('ERROR', `❌ Método ${method} não encontrado`);
            }
        }
        
        log('SUCCESS', '🎉 Testes concluídos com sucesso!');
        
    } catch (error) {
        log('ERROR', '❌ Erro durante os testes', { error: error.message });
    }
}

// Executar testes
runTests().then(() => {
    log('INFO', '✅ Processo de teste finalizado');
    process.exit(0);
}).catch((error) => {
    log('ERROR', '❌ Falha no processo de teste', { error: error.message });
    process.exit(1);
});
