/**
 * Módulo de Interação com Smart Contract
 * Projeto Capacitação Web3 - Árvore dos Saberes
 * 
 * Este módulo implementa a comunicação com o contrato RegistroDeUsuariosComRecompensa
 * utilizando ethers.js e MetaMask
 */

class ContractManager {
    constructor() {
        this.contract = null;
        this.signer = null;
        this.provider = null;
        this.contractAddress = null;
        this.isOwner = false;
        
        // ABI do contrato (gerada após compilação)
        this.contractABI = [
            {
                "inputs": [],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "anonymous": false,
                "inputs": [
                    {"indexed": true, "internalType": "address", "name": "carteira", "type": "address"},
                    {"indexed": false, "internalType": "uint256", "name": "quantidade", "type": "uint256"},
                    {"indexed": false, "internalType": "uint256", "name": "data", "type": "uint256"}
                ],
                "name": "RecompensaEnviada",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {"indexed": true, "internalType": "address", "name": "carteira", "type": "address"},
                    {"indexed": false, "internalType": "string", "name": "nome", "type": "string"},
                    {"indexed": false, "internalType": "uint256", "name": "data", "type": "uint256"}
                ],
                "name": "UsuarioRegistrado",
                "type": "event"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "_carteira", "type": "address"}
                ],
                "name": "consultarSaldo",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "_carteira", "type": "address"}
                ],
                "name": "consultarUsuario",
                "outputs": [
                    {
                        "components": [
                            {"internalType": "string", "name": "nome", "type": "string"},
                            {"internalType": "address", "name": "carteira", "type": "address"},
                            {"internalType": "uint256", "name": "dataRegistro", "type": "uint256"},
                            {"internalType": "bool", "name": "ativo", "type": "bool"}
                        ],
                        "internalType": "struct RegistroDeUsuariosComRecompensa.Usuario",
                        "name": "",
                        "type": "tuple"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "_carteira", "type": "address"}
                ],
                "name": "estaRegistrado",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "owner",
                "outputs": [{"internalType": "address", "name": "", "type": "address"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "string", "name": "_nome", "type": "string"}
                ],
                "name": "registrarUsuario",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "_carteira", "type": "address"}
                ],
                "name": "recompensarUsuario",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "totalUsuarios",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "VALOR_RECOMPENSA",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "", "type": "address"}
                ],
                "name": "saldos",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "", "type": "address"}
                ],
                "name": "usuarioExiste",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "", "type": "address"}
                ],
                "name": "usuarios",
                "outputs": [
                    {
                        "components": [
                            {"internalType": "string", "name": "nome", "type": "string"},
                            {"internalType": "address", "name": "carteira", "type": "address"},
                            {"internalType": "uint256", "name": "dataRegistro", "type": "uint256"},
                            {"internalType": "bool", "name": "ativo", "type": "bool"}
                        ],
                        "internalType": "struct RegistroDeUsuariosComRecompensa.Usuario",
                        "name": "",
                        "type": "tuple"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ];
    }

    /**
     * Inicializa a conexão com o contrato
     * @param {string} contractAddress - Endereço do contrato
     * @param {ethers.Signer} signer - Signer do ethers
     */
    async initialize(contractAddress, signer) {
        try {
            logger.info('CONTRACT', 'initialize', 1, '🔧 Inicializando conexão com o contrato', { contractAddress });
            
            // Validar formato do endereço
            if (!window.ethers.utils.isAddress(contractAddress)) {
                throw new Error('Endereço do contrato inválido: ' + contractAddress);
            }
            
            this.contractAddress = contractAddress;
            this.signer = signer;
            this.provider = signer.provider;
            
            // Criar instância do contrato
            this.contract = new window.ethers.Contract(contractAddress, this.contractABI, signer);
            
            // Verificar se o contrato existe antes de continuar
            const code = await this.provider.getCode(contractAddress);
            if (code === '0x') {
                throw new Error('Nenhum contrato encontrado no endereço: ' + contractAddress);
            }
            
            logger.success('CONTRACT', 'initialize', 1, '✅ Contrato encontrado no endereço', { contractAddress });
            
            // Verificar se o usuário é o owner
            await this.checkOwnership();
            
            // Carregar informações iniciais do contrato
            await this.loadContractInfo();
            
            logger.success('CONTRACT', 'initialize', 1, '✅ Contrato inicializado com sucesso');
            
            return true;
        } catch (error) {
            logger.error('CONTRACT', 'initialize', 1, '❌ Erro ao inicializar contrato', { error: error.message });
            
            // Mostrar mensagem específica para erros comuns
            if (error.message.includes('Nenhum contrato encontrado') || error.message.includes('Endereço do contrato inválido')) {
                logger.error('CONTRACT', 'initialize', 1, '❌ Problema de configuração do contrato', {
                    address: contractAddress,
                    error: error.message,
                    suggestion: 'Verifique se o endereço está correto para a rede atual'
                });
            }
            
            throw error;
        }
    }

    /**
     * Verifica se o usuário conectado é o owner do contrato
     */
    async checkOwnership() {
        try {
            // Verificar se o contrato existe e está acessível
            if (!this.contract) {
                logger.warning('CONTRACT', 'checkOwnership', 1, '⚠️ Contrato não inicializado para verificar ownership');
                return false;
            }

            // Tentar verificar o código do contrato para garantir que existe
            const code = await this.provider.getCode(this.contractAddress);
            if (code === '0x') {
                logger.error('CONTRACT', 'checkOwnership', 1, '❌ Nenhum código encontrado no endereço do contrato', { address: this.contractAddress });
                throw new Error('Contrato não encontrado neste endereço');
            }

            const ownerAddress = await this.contract.owner();
            const userAddress = await this.signer.getAddress();
            this.isOwner = ownerAddress.toLowerCase() === userAddress.toLowerCase();
            
            logger.info('CONTRACT', 'checkOwnership', 1, '👤 Verificação de ownership', {
                owner: ownerAddress,
                user: userAddress,
                isOwner: this.isOwner
            });
            
            return this.isOwner;
        } catch (error) {
            logger.error('CONTRACT', 'checkOwnership', 1, '❌ Erro ao verificar ownership', { error: error.message });
            
            // Verificar se o erro é de contrato não existente
            if (error.message.includes('call revert exception') || error.message.includes('Contrato não encontrado')) {
                logger.error('CONTRACT', 'checkOwnership', 1, '❌ Possível problema com o endereço do contrato', { 
                    address: this.contractAddress,
                    error: error.message 
                });
            }
            
            return false;
        }
    }

    /**
     * Carrega informações básicas do contrato
     */
    async loadContractInfo() {
        try {
            if (!this.contract) {
                logger.warning('CONTRACT', 'loadContractInfo', 1, '⚠️ Contrato não inicializado');
                return;
            }

            // Verificar se o contrato existe antes de tentar chamar métodos
            const code = await this.provider.getCode(this.contractAddress);
            if (code === '0x') {
                logger.error('CONTRACT', 'loadContractInfo', 1, '❌ Contrato não encontrado no endereço', { address: this.contractAddress });
                throw new Error('Contrato não encontrado neste endereço');
            }
            
            const totalUsuarios = await this.contract.totalUsuarios();
            const valorRecompensa = await this.contract.VALOR_RECOMPENSA();
            
            // Atualizar UI
            document.getElementById('total-users').textContent = totalUsuarios.toString();
            document.getElementById('reward-value').textContent = window.ethers.utils.formatUnits(valorRecompensa, 0);
            
            logger.info('CONTRACT', 'loadContractInfo', 1, '📊 Informações do contrato carregadas', {
                totalUsuarios: totalUsuarios.toString(),
                valorRecompensa: valorRecompensa.toString()
            });
        } catch (error) {
            logger.error('CONTRACT', 'loadContractInfo', 1, '❌ Erro ao carregar informações do contrato', { error: error.message });
            
            // Verificar se o erro é relacionado ao contrato não existir ou estar incorreto
            if (error.message.includes('call revert exception') || error.message.includes('Contrato não encontrado')) {
                logger.error('CONTRACT', 'loadContractInfo', 1, '❌ Possível problema com o endereço do contrato', { 
                    address: this.contractAddress,
                    error: error.message,
                    suggestion: 'Verifique se o endereço do contrato está correto para a rede atual'
                });
                
                // Mostrar mensagem amigável ao usuário
                if (typeof window.dapp !== 'undefined') {
                    window.dapp.showStatus('error', 'Endereço do contrato inválido para esta rede. Verifique a configuração.');
                }
            }
        }
    }

    /**
     * Registra um novo usuário no contrato
     * @param {string} nome - Nome do usuário
     * @returns {ethers.Transaction} Transação
     */
    async registrarUsuario(nome) {
        try {
            logger.info('CONTRACT', 'registrarUsuario', 1, '👤 Iniciando registro de usuário', { nome });
            
            const tx = await this.contract.registrarUsuario(nome);
            logger.info('CONTRACT', 'registrarUsuario', 1, '📤 Transação enviada', { hash: tx.hash });
            
            // Aguardar confirmação
            const receipt = await tx.wait();
            
            // Buscar evento
            const event = receipt.events?.find(e => e.event === 'UsuarioRegistrado');
            
            logger.success('CONTRACT', 'registrarUsuario', 1, '✅ Usuário registrado com sucesso', {
                hash: tx.hash,
                blockNumber: receipt.blockNumber,
                evento: event ? event.args : null
            });
            
            // Atualizar informações do contrato
            await this.loadContractInfo();
            
            return receipt;
        } catch (error) {
            logger.error('CONTRACT', 'registrarUsuario', 1, '❌ Erro ao registrar usuário', { error: error.message });
            throw error;
        }
    }

    /**
     * Consulta informações de um usuário
     * @param {string} address - Endereço do usuário
     * @returns {object} Informações do usuário
     */
    async consultarUsuario(address) {
        try {
            logger.info('CONTRACT', 'consultarUsuario', 1, '🔍 Consultando informações do usuário', { address });
            
            if (!this.contract) {
                throw new Error('Contrato não inicializado');
            }
            
            const usuario = await this.contract.consultarUsuario(address);
            const saldo = await this.contract.consultarSaldo(address);
            const estaRegistrado = await this.contract.estaRegistrado(address);
            
            const userInfo = {
                nome: usuario.nome,
                carteira: usuario.carteira,
                dataRegistro: new Date(usuario.dataRegistro.toNumber() * 1000).toLocaleString(),
                ativo: usuario.ativo,
                saldo: window.ethers.utils.formatUnits(saldo, 0),
                estaRegistrado
            };
            
            logger.success('CONTRACT', 'consultarUsuario', 1, '✅ Informações consultadas com sucesso', { userInfo });
            
            return userInfo;
        } catch (error) {
            logger.error('CONTRACT', 'consultarUsuario', 1, '❌ Erro ao consultar usuário', { error: error.message });
            throw error;
        }
    }

    /**
     * Distribui recompensa para um usuário
     * @param {string} address - Endereço do usuário
     * @returns {ethers.Transaction} Transação
     */
    async recompensarUsuario(address) {
        try {
            if (!this.isOwner) {
                throw new Error('Apenas o owner pode distribuir recompensas');
            }
            
            logger.info('CONTRACT', 'recompensarUsuario', 1, '🎁 Iniciando distribuição de recompensa', { address });
            
            const tx = await this.contract.recompensarUsuario(address);
            logger.info('CONTRACT', 'recompensarUsuario', 1, '📤 Transação enviada', { hash: tx.hash });
            
            // Aguardar confirmação
            const receipt = await tx.wait();
            
            // Buscar evento
            const event = receipt.events?.find(e => e.event === 'RecompensaEnviada');
            
            logger.success('CONTRACT', 'recompensarUsuario', 1, '✅ Recompensa distribuída com sucesso', {
                hash: tx.hash,
                blockNumber: receipt.blockNumber,
                evento: event ? event.args : null
            });
            
            return receipt;
        } catch (error) {
            logger.error('CONTRACT', 'recompensarUsuario', 1, '❌ Erro ao distribuir recompensa', { error: error.message });
            throw error;
        }
    }

    /**
     * Verifica se um endereço está registrado
     * @param {string} address - Endereço a verificar
     * @returns {boolean} True se estiver registrado
     */
    async estaRegistrado(address) {
        try {
            const registrado = await this.contract.estaRegistrado(address);
            logger.info('CONTRACT', 'estaRegistrado', 1, '🔍 Verificando registro', { address, registrado });
            return registrado;
        } catch (error) {
            logger.error('CONTRACT', 'estaRegistrado', 1, '❌ Erro ao verificar registro', { error: error.message });
            return false;
        }
    }

    /**
     * Consulta o saldo de tokens de um usuário
     * @param {string} address - Endereço do usuário
     * @returns {string} Saldo formatado
     */
    async consultarSaldo(address) {
        try {
            const saldo = await this.contract.consultarSaldo(address);
            const saldoFormatado = window.ethers.utils.formatUnits(saldo, 0);
            
            logger.info('CONTRACT', 'consultarSaldo', 1, '💰 Saldo consultado', { address, saldo: saldoFormatado });
            
            return saldoFormatado;
        } catch (error) {
            logger.error('CONTRACT', 'consultarSaldo', 1, '❌ Erro ao consultar saldo', { error: error.message });
            return '0';
        }
    }

    /**
     * Escuta eventos do contrato
     * @param {string} eventName - Nome do evento
     * @param {function} callback - Função de callback
     */
    async listenToEvents(eventName, callback) {
        try {
            if (!this.contract) {
                throw new Error('Contrato não inicializado');
            }
            
            logger.info('CONTRACT', 'listenToEvents', 1, '👂 Iniciando listener de eventos', { eventName });
            
            this.contract.on(eventName, callback);
            
            logger.success('CONTRACT', 'listenToEvents', 1, '✅ Listener de eventos configurado', { eventName });
        } catch (error) {
            logger.error('CONTRACT', 'listenToEvents', 1, '❌ Erro ao configurar listener', { error: error.message });
        }
    }

    /**
     * Para de escutar eventos
     * @param {string} eventName - Nome do evento
     */
    async stopListening(eventName) {
        try {
            if (!this.contract) return;
            
            logger.info('CONTRACT', 'stopListening', 1, '🛑 Parando listener de eventos', { eventName });
            
            this.contract.removeAllListeners(eventName);
            
            logger.success('CONTRACT', 'stopListening', 1, '✅ Listener removido', { eventName });
        } catch (error) {
            logger.error('CONTRACT', 'stopListening', 1, '❌ Erro ao remover listener', { error: error.message });
        }
    }

    /**
     * Obtém o endereço do owner
     * @returns {string} Endereço do owner
     */
    async getOwner() {
        try {
            const owner = await this.contract.owner();
            logger.info('CONTRACT', 'getOwner', 1, '👤 Owner consultado', { owner });
            return owner;
        } catch (error) {
            logger.error('CONTRACT', 'getOwner', 1, '❌ Erro ao consultar owner', { error: error.message });
            return null;
        }
    }
}

// Instância global do gerenciador de contrato
const contractManager = new ContractManager();
