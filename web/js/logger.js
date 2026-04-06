/**
 * Sistema de Logging para DApp
 * Projeto Capacitação Web3 - Árvore dos Saberes
 * 
 * Este módulo implementa um sistema de logging detalhado seguindo as diretrizes:
 * - Logs armazenados na pasta logs
 * - Identificação com emoticons conforme contexto
 * - Formato: data, arquivo, função, linha, mensagem, parâmetros relevantes
 */

class Logger {
    constructor() {
        this.logsContainer = document.getElementById('logs-container');
        this.logs = [];
        this.maxLogs = 100; // Limite de logs para evitar sobrecarga
        this.logLevels = {
            INFO: { icon: 'ℹ️', color: 'log-level-info' },
            SUCCESS: { icon: '✅', color: 'log-level-success' },
            WARNING: { icon: '⚠️', color: 'log-level-warning' },
            ERROR: { icon: '❌', color: 'log-level-error' }
        };
        
        this.initializeLogger();
    }

    /**
     * Inicializa o sistema de logging
     */
    initializeLogger() {
        // Limpar logs antigos ao iniciar
        this.clearLogs();
        
        // Log inicial
        this.info('LOGGER', 'initializeLogger', 1, '🚀 Sistema de logging inicializado com sucesso');
        
        // Configurar evento para limpar logs
        const clearButton = document.getElementById('clear-logs');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearLogs());
        }
    }

    /**
     * Formata timestamp atual
     * @returns {string} Timestamp formatado
     */
    getTimestamp() {
        const now = new Date();
        return now.toISOString();
    }

    /**
     * Formata a mensagem de log
     * @param {string} level - Nível do log
     * @param {string} file - Nome do arquivo
     * @param {string} function - Nome da função
     * @param {number} line - Número da linha
     * @param {string} message - Mensagem
     * @param {object} params - Parâmetros adicionais (opcional)
     * @returns {string} Mensagem formatada
     */
    formatMessage(level, file, functionName, line, message, params = null) {
        const timestamp = this.getTimestamp();
        const levelInfo = this.logLevels[level];
        const icon = levelInfo ? levelInfo.icon : '📝';
        
        let formattedMessage = `${timestamp} [${level}] ${icon} ${file}:${functionName}:${line} - ${message}`;
        
        if (params && Object.keys(params).length > 0) {
            const safeParams = this.sanitizeParams(params);
            formattedMessage += ` | Params: ${JSON.stringify(safeParams)}`;
        }
        
        return formattedMessage;
    }

    /**
     * Sanitiza parâmetros para remover dados sensíveis
     * @param {object} params - Parâmetros a serem sanitizados
     * @returns {object} Parâmetros sanitizados
     */
    sanitizeParams(params) {
        const sensitiveKeys = ['privateKey', 'password', 'secret', 'mnemonic', 'seed'];
        const sanitized = { ...params };
        
        for (const key of Object.keys(sanitized)) {
            if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive.toLowerCase()))) {
                sanitized[key] = '[REDACTED]';
            }
        }
        
        return sanitized;
    }

    /**
     * Adiciona log ao container e ao array de logs
     * @param {string} level - Nível do log
     * @param {string} file - Nome do arquivo
     * @param {string} functionName - Nome da função
     * @param {number} line - Número da linha
     * @param {string} message - Mensagem
     * @param {object} params - Parâmetros adicionais (opcional)
     */
    addLog(level, file, functionName, line, message, params = null) {
        const logEntry = {
            timestamp: this.getTimestamp(),
            level,
            file,
            functionName,
            line,
            message,
            params: params ? this.sanitizeParams(params) : null
        };
        
        // Adicionar ao array de logs
        this.logs.push(logEntry);
        
        // Manter apenas os logs mais recentes
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // Adicionar ao container HTML
        this.displayLog(logEntry);
        
        // Log no console para debug
        console.log(this.formatMessage(level, file, functionName, line, message, params));
    }

    /**
     * Exibe log no container HTML
     * @param {object} logEntry - Entrada de log
     */
    displayLog(logEntry) {
        if (!this.logsContainer) return;
        
        const levelInfo = this.logLevels[logEntry.level];
        const logElement = document.createElement('div');
        logElement.className = `log-entry ${levelInfo ? levelInfo.color : ''}`;
        
        const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
        let content = `<span class="log-timestamp">[${timestamp}]</span>`;
        content += `<span>${levelInfo ? levelInfo.icon : '📝'}</span> `;
        content += `<span>${logEntry.file}:${logEntry.function}:${logEntry.line}</span> - `;
        content += `<span>${logEntry.message}</span>`;
        
        if (logEntry.params) {
            content += ` | <span class="text-gray-400">Params: ${JSON.stringify(logEntry.params)}</span>`;
        }
        
        logElement.innerHTML = content;
        
        // Adicionar ao container
        this.logsContainer.appendChild(logElement);
        
        // Auto-scroll para o último log
        this.logsContainer.scrollTop = this.logsContainer.scrollHeight;
    }

    /**
     * Limpa todos os logs
     */
    clearLogs() {
        this.logs = [];
        if (this.logsContainer) {
            this.logsContainer.innerHTML = '';
            this.info('LOGGER', 'clearLogs', 1, '🧹 Logs limpos com sucesso');
        }
    }

    /**
     * Log de nível INFO
     * @param {string} file - Nome do arquivo
     * @param {string} functionName - Nome da função
     * @param {number} line - Número da linha
     * @param {string} message - Mensagem
     * @param {object} params - Parâmetros adicionais (opcional)
     */
    info(file, functionName, line, message, params = null) {
        this.addLog('INFO', file, functionName, line, message, params);
    }

    /**
     * Log de nível SUCCESS
     * @param {string} file - Nome do arquivo
     * @param {string} functionName - Nome da função
     * @param {number} line - Número da linha
     * @param {string} message - Mensagem
     * @param {object} params - Parâmetros adicionais (opcional)
     */
    success(file, functionName, line, message, params = null) {
        this.addLog('SUCCESS', file, functionName, line, message, params);
    }

    /**
     * Log de nível WARNING
     * @param {string} file - Nome do arquivo
     * @param {string} functionName - Nome da função
     * @param {number} line - Número da linha
     * @param {string} message - Mensagem
     * @param {object} params - Parâmetros adicionais (opcional)
     */
    warning(file, functionName, line, message, params = null) {
        this.addLog('WARNING', file, functionName, line, message, params);
    }

    /**
     * Log de nível ERROR
     * @param {string} file - Nome do arquivo
     * @param {string} functionName - Nome da função
     * @param {number} line - Número da linha
     * @param {string} message - Mensagem
     * @param {object} params - Parâmetros adicionais (opcional)
     */
    error(file, functionName, line, message, params = null) {
        this.addLog('ERROR', file, functionName, line, message, params);
    }

    /**
     * Exporta logs para download
     */
    exportLogs() {
        const logData = {
            exportDate: this.getTimestamp(),
            totalLogs: this.logs.length,
            logs: this.logs
        };
        
        const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dapp-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.info('LOGGER', 'exportLogs', 1, '📁 Logs exportados com sucesso');
    }

    /**
     * Filtra logs por nível
     * @param {string} level - Nível para filtrar
     * @returns {array} Logs filtrados
     */
    filterByLevel(level) {
        return this.logs.filter(log => log.level === level);
    }

    /**
     * Busca logs por termo
     * @param {string} term - Termo para buscar
     * @returns {array} Logs encontrados
     */
    search(term) {
        const searchTerm = term.toLowerCase();
        return this.logs.filter(log => 
            log.message.toLowerCase().includes(searchTerm) ||
            log.file.toLowerCase().includes(searchTerm) ||
            log.function.toLowerCase().includes(searchTerm)
        );
    }
}

// Instância global do logger
const logger = new Logger();

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Logger;
}
