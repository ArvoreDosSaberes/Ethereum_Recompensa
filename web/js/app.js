/**
 * Aplicação Principal DApp - Registro de Usuários com Recompensa
 * Projeto Capacitação Web3 - Árvore dos Saberes
 * 
 * Este arquivo contém a lógica principal da aplicação web
 */

class DApp {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.userAddress = null;
        this.contractAddress = null;
        this.isConnected = false;
        
        // Configurações da rede
        this.networkConfig = {
            localhost: {
                chainId: '0x539', // 1337
                chainName: 'Hardhat Local',
                rpcUrls: ['http://127.0.0.1:8545'],
                nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                },
                blockExplorerUrls: ['http://127.0.0.1:8545']
            },
            sepolia: {
                chainId: '0xaa36a7', // 11155111
                chainName: 'Sepolia Testnet',
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                },
                blockExplorerUrls: ['https://sepolia.etherscan.io']
            }
        };
        
        // Estado da rede atual
        this.currentNetwork = null;
        this.walletBalance = '0';
        
        // Inicializar quando o DOM estiver pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    /**
     * Inicializa a aplicação
     */
    async initializeApp() {
        // Garantir que o logger exista
        if (typeof logger === 'undefined') {
            console.error('❌ Logger não encontrado');
            return;
        }
        
        // Garantir que o ethers exista
        if (typeof window.ethers === 'undefined') {
            logger.error('DAPP', 'initializeApp', 1, '❌ Ethers.js não encontrado');
            this.showStatus('error', 'Ethers.js não foi carregado. Por favor, recarregue a página.');
            return;
        }
        
        logger.info('DAPP', 'initializeApp', 1, '🚀 Inicializando DApp');
        
        try {
            // Verificar se MetaMask está instalado
            if (!this.checkMetaMask()) {
                this.showStatus('error', 'MetaMask não encontrado. Por favor, instale a extensão MetaMask.');
                return;
            }
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Tentar conexão automática
            await this.autoConnect();
            
            logger.success('DAPP', 'initializeApp', 1, '✅ DApp inicializado com sucesso');
        } catch (error) {
            logger.error('DAPP', 'initializeApp', 1, '❌ Erro ao inicializar DApp', { error: error.message });
        }
    }

    /**
     * Verifica se MetaMask está instalado
     * @returns {boolean} True se MetaMask estiver disponível
     */
    checkMetaMask() {
        const result = typeof window.ethereum !== 'undefined';
        logger.info('DAPP', 'checkMetaMask', 1, '🔍 Verificando MetaMask', { installed: result });
        return result;
    }

    /**
     * Configura todos os event listeners da aplicação
     */
    setupEventListeners() {
        logger.info('DAPP', 'setupEventListeners', 1, '🔧 Configurando event listeners');
        
        // Botão de conectar carteira
        const connectBtn = document.getElementById('connect-wallet');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.connectWallet());
        }
        
        // Botão de desconectar
        const disconnectBtn = document.getElementById('disconnect-wallet');
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => this.disconnectWallet());
        }
        
        // Seletor de rede
        const networkSelect = document.getElementById('network-select');
        if (networkSelect) {
            networkSelect.addEventListener('change', (e) => this.handleNetworkChange(e.target.value));
        }
        
        // Formulário de registro
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        
        // Botão de consultar
        const consultBtn = document.getElementById('consult-user');
        if (consultBtn) {
            consultBtn.addEventListener('click', () => this.handleConsult());
        }
        
        // Botão "Meu Endereço"
        const useMyAddressBtn = document.getElementById('use-my-address');
        if (useMyAddressBtn) {
            useMyAddressBtn.addEventListener('click', () => this.useMyAddress());
        }
        
        // Botão de distribuir recompensa
        const rewardBtn = document.getElementById('distribute-reward');
        if (rewardBtn) {
            rewardBtn.addEventListener('click', () => this.handleDistributeReward());
        }
        
        // Navegação por abas
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Event listeners do MetaMask
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => this.handleAccountsChanged(accounts));
            window.ethereum.on('chainChanged', (chainId) => this.handleChainChanged(chainId));
            window.ethereum.on('disconnect', () => this.handleDisconnect());
        }
        
        logger.success('DAPP', 'setupEventListeners', 1, '✅ Event listeners configurados');
    }

    /**
     * Tenta conexão automática se já houver conta conectada
     */
    async autoConnect() {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await this.connectWallet();
            }
        } catch (error) {
            logger.warning('DAPP', 'autoConnect', 1, '⚠️ Falha na conexão automática', { error: error.message });
        }
    }

    /**
     * Conecta à carteira MetaMask
     */
    async connectWallet() {
        try {
            logger.info('DAPP', 'connectWallet', 1, '🔗 Conectando à carteira');
            
            // Solicitar acesso às contas
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            // Criar provider e signer
            this.provider = new window.ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            this.userAddress = accounts[0];
            this.isConnected = true;
            
            // Atualizar UI
            this.updateWalletUI();
            
            // Verificar rede primeiro
            await this.checkNetwork();
            
            // Carregar endereço do contrato após verificar a rede
            this.loadContractAddress();
            
            // Atualizar saldo
            await this.updateWalletBalance();
            
            // Inicializar contrato se houver endereço
            if (this.contractAddress) {
                await this.initializeContract();
            }
            
            this.showStatus('success', 'Carteira conectada com sucesso!');
            logger.success('DAPP', 'connectWallet', 1, '✅ Carteira conectada', { address: this.userAddress });
            
        } catch (error) {
            logger.error('DAPP', 'connectWallet', 1, '❌ Erro ao conectar carteira', { error: error.message });
            this.showStatus('error', 'Erro ao conectar carteira: ' + error.message);
        }
    }

    /**
     * Desconecta da carteira
     */
    disconnectWallet() {
        logger.info('DAPP', 'disconnectWallet', 1, '🔌 Desconectando carteira');
        
        this.provider = null;
        this.signer = null;
        this.userAddress = null;
        this.isConnected = false;
        
        // Resetar contrato
        contractManager.contract = null;
        contractManager.signer = null;
        
        // Resetar informações da carteira
        this.walletBalance = '0';
        this.currentNetwork = null;
        
        // Atualizar UI
        this.updateWalletUI();
        
        // Esconder informações do contrato
        document.getElementById('contract-info').classList.add('hidden');
        
        this.showStatus('info', 'Carteira desconectada');
        logger.success('DAPP', 'disconnectWallet', 1, '✅ Carteira desconectada');
    }

    /**
     * Atualiza a UI com informações da carteira
     */
    updateWalletUI() {
        const connectBtn = document.getElementById('connect-wallet');
        const connectedInfo = document.getElementById('connected-info');
        const walletAddress = document.getElementById('wallet-address');
        const walletBalance = document.getElementById('wallet-balance');
        const networkSelector = document.getElementById('network-selector');
        
        if (this.isConnected && this.userAddress) {
            connectBtn.classList.add('hidden');
            connectedInfo.classList.remove('hidden');
            networkSelector.classList.remove('hidden');
            walletAddress.textContent = this.formatAddress(this.userAddress);
            walletBalance.textContent = `${this.walletBalance} ETH`;
        } else {
            connectBtn.classList.remove('hidden');
            connectedInfo.classList.add('hidden');
            networkSelector.classList.add('hidden');
        }
    }

    /**
     * Formata endereço para exibição
     * @param {string} address - Endereço completo
     * @returns {string} Endereço formatado
     */
    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    /**
     * Verifica se a rede está correta
     */
    async checkNetwork() {
        try {
            const network = await this.provider.getNetwork();
            const chainId = `0x${network.chainId.toString(16)}`;
            
            this.currentNetwork = {
                chainId,
                name: network.name,
                chainIdDecimal: network.chainId.toString()
            };
            
            logger.info('DAPP', 'checkNetwork', 1, '🌐 Verificando rede', { chainId, networkName: network.name });
            
            // Atualizar seletor de rede
            this.updateNetworkSelector();
            
            this.showStatus('info', `Conectado à rede: ${network.name} (${chainId})`);
        } catch (error) {
            logger.error('DAPP', 'checkNetwork', 1, '❌ Erro ao verificar rede', { error: error.message });
        }
    }
    
    /**
     * Atualiza o seletor de rede com a rede atual
     */
    updateNetworkSelector() {
        const networkSelect = document.getElementById('network-select');
        if (!networkSelect || !this.currentNetwork) return;
        
        // Encontrar qual rede corresponde ao chainId atual
        let selectedNetwork = null;
        for (const [key, config] of Object.entries(this.networkConfig)) {
            if (config.chainId === this.currentNetwork.chainId) {
                selectedNetwork = key;
                break;
            }
        }
        
        if (selectedNetwork) {
            networkSelect.value = selectedNetwork;
        } else {
            // Se não encontrar, adicionar opção personalizada
            const option = document.createElement('option');
            option.value = 'unknown';
            option.textContent = `Rede Desconhecida (${this.currentNetwork.chainId})`;
            option.selected = true;
            networkSelect.appendChild(option);
        }
        
        logger.info('DAPP', 'updateNetworkSelector', 1, '🔄 Seletor de rede atualizado', { selectedNetwork });
    }
    
    /**
     * Manipula mudança de rede selecionada
     * @param {string} networkKey - Chave da rede selecionada
     */
    async handleNetworkChange(networkKey) {
        if (networkKey === 'unknown') {
            this.showStatus('warning', 'Rede desconhecida detectada. Por favor, selecione uma rede suportada.');
            return;
        }
        
        const networkConfig = this.networkConfig[networkKey];
        if (!networkConfig) {
            this.showStatus('error', 'Configuração de rede não encontrada.');
            return;
        }
        
        try {
            logger.info('DAPP', 'handleNetworkChange', 1, '🔄 Solicitando mudança de rede', { networkKey });
            
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: networkConfig.chainId }]
            });
            
        } catch (switchError) {
            // Se a rede não existe, adicionar
            if (switchError.code === 4902) {
                try {
                    logger.info('DAPP', 'handleNetworkChange', 1, '➕ Adicionando nova rede', { networkKey });
                    
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [networkConfig]
                    });
                    
                    this.showStatus('success', `Rede ${networkConfig.chainName} adicionada com sucesso!`);
                } catch (addError) {
                    logger.error('DAPP', 'handleNetworkChange', 1, '❌ Erro ao adicionar rede', { error: addError.message });
                    this.showStatus('error', 'Erro ao adicionar rede: ' + addError.message);
                }
            } else {
                logger.error('DAPP', 'handleNetworkChange', 1, '❌ Erro ao mudar de rede', { error: switchError.message });
                this.showStatus('error', 'Erro ao mudar de rede: ' + switchError.message);
            }
        }
    }
    
    /**
     * Atualiza o saldo da carteira
     */
    async updateWalletBalance() {
        if (!this.provider || !this.userAddress) return;
        
        try {
            const balance = await this.provider.getBalance(this.userAddress);
            this.walletBalance = parseFloat(window.ethers.utils.formatEther(balance)).toFixed(4);
            
            // Atualizar UI
            const walletBalanceElement = document.getElementById('wallet-balance');
            if (walletBalanceElement) {
                walletBalanceElement.textContent = `${this.walletBalance} ETH`;
            }
            
            logger.info('DAPP', 'updateWalletBalance', 1, '💰 Saldo atualizado', { balance: this.walletBalance });
        } catch (error) {
            logger.error('DAPP', 'updateWalletBalance', 1, '❌ Erro ao atualizar saldo', { error: error.message });
        }
    }

    /**
     * Carrega o endereço do contrato
     */
    loadContractAddress() {
        // Tentar carregar do localStorage primeiro
        this.contractAddress = localStorage.getItem('contractAddress') || null;
        
        // Se não encontrar, tentar carregar do arquivo .env
        if (!this.contractAddress && window.CONTRACT_ADDRESS) {
            this.contractAddress = window.CONTRACT_ADDRESS;
            localStorage.setItem('contractAddress', this.contractAddress);
        }
        
        // Se ainda não encontrar, definir endereço padrão para desenvolvimento
        if (!this.contractAddress) {
            // Verificar se estamos em rede de teste para usar endereço apropriado
            if (this.currentNetwork && this.currentNetwork.chainId === '0x539') {
                // Hardhat Local
                this.contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
                logger.warning('DAPP', 'loadContractAddress', 1, '⚠️ Usando endereço de contrato para Hardhat Local', { address: this.contractAddress });
            } else if (this.currentNetwork && this.currentNetwork.chainId === '0xaa36a7') {
                // Sepolia Testnet
                this.contractAddress = '0xCF2aB63a9bA9F7B96cd949f1fB69518ea9aBBD6a';
                logger.warning('DAPP', 'loadContractAddress', 1, '⚠️ Usando endereço de contrato para Sepolia', { address: this.contractAddress });
            } else {
                // Para outras redes ou quando não há rede definida, usar Sepolia como padrão
                this.contractAddress = '0xCF2aB63a9bA9F7B96cd949f1fB69518ea9aBBD6a';
                logger.warning('DAPP', 'loadContractAddress', 1, '⚠️ Usando endereço de contrato padrão (Sepolia)', { address: this.contractAddress });
            }
        } else {
            logger.info('DAPP', 'loadContractAddress', 1, '📍 Endereço do contrato carregado', { address: this.contractAddress });
        }
        
        if (this.contractAddress) {
            const contractAddressElement = document.getElementById('contract-address');
            if (contractAddressElement) {
                contractAddressElement.textContent = this.contractAddress;
            }
        }
    }

    /**
     * Inicializa o contrato
     */
    async initializeContract() {
        try {
            if (!this.contractAddress) {
                throw new Error('Endereço do contrato não definido');
            }
            
            if (!this.signer) {
                throw new Error('Signer não disponível');
            }
            
            logger.info('DAPP', 'initializeContract', 1, '🔧 Inicializando contrato', { address: this.contractAddress });
            
            await contractManager.initialize(this.contractAddress, this.signer);
            
            // Mostrar informações do contrato
            const contractInfo = document.getElementById('contract-info');
            if (contractInfo) {
                contractInfo.classList.remove('hidden');
            }
            
            const contractAddressElement = document.getElementById('contract-address');
            if (contractAddressElement) {
                contractAddressElement.textContent = this.contractAddress;
            }
            
            // Configurar permissões baseadas no ownership
            this.updatePermissions();
            
            // Configurar listeners de eventos
            this.setupContractListeners();
            
            logger.success('DAPP', 'initializeContract', 1, '✅ Contrato inicializado com sucesso');
        } catch (error) {
            logger.error('DAPP', 'initializeContract', 1, '❌ Erro ao inicializar contrato', { error: error.message });
            this.showStatus('error', 'Erro ao inicializar contrato: ' + error.message);
        }
    }

    /**
     * Atualiza permissões baseadas no ownership
     */
    updatePermissions() {
        const ownerWarning = document.getElementById('owner-warning');
        const rewardsTab = document.getElementById('rewards-tab');
        
        if (contractManager.isOwner) {
            ownerWarning.classList.add('hidden');
            rewardsTab.querySelector('button').disabled = false;
            logger.info('DAPP', 'updatePermissions', 1, '👤 Permissões de owner ativadas');
        } else {
            ownerWarning.classList.remove('hidden');
            rewardsTab.querySelector('button').disabled = true;
            logger.info('DAPP', 'updatePermissions', 1, '👤 Permissões de usuário comum');
        }
    }

    /**
     * Configura listeners de eventos do contrato
     */
    setupContractListeners() {
        // Listener para registro de usuários
        contractManager.listenToEvents('UsuarioRegistrado', (carteira, nome, data) => {
            logger.info('DAPP', 'setupContractListeners', 1, '🎉 Evento: UsuarioRegistrado', { carteira, nome, data });
            this.showStatus('success', `Novo usuário registrado: ${nome}`);
        });
        
        // Listener para distribuição de recompensas
        contractManager.listenToEvents('RecompensaEnviada', (carteira, quantidade, data) => {
            logger.info('DAPP', 'setupContractListeners', 1, '🎁 Evento: RecompensaEnviada', { carteira, quantidade, data });
            this.showStatus('success', `Recompensa de ${quantidade} tokens enviada!`);
        });
    }

    /**
     * Alterna entre abas
     * @param {string} tabName - Nome da aba
     */
    switchTab(tabName) {
        // Esconder todas as abas
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });
        
        // Remover classe ativa de todos os botões
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('border-indigo-500', 'text-indigo-600');
            button.classList.add('border-transparent', 'text-gray-500');
        });
        
        // Mostrar aba selecionada
        const selectedTab = document.getElementById(`${tabName}-tab`);
        if (selectedTab) {
            selectedTab.classList.remove('hidden');
        }
        
        // Ativar botão selecionado
        const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedButton) {
            selectedButton.classList.remove('border-transparent', 'text-gray-500');
            selectedButton.classList.add('border-indigo-500', 'text-indigo-600');
        }
        
        logger.info('DAPP', 'switchTab', 1, '🔄 Tab alterada', { tab: tabName });
    }

    /**
     * Manipula registro de usuário
     * @param {Event} event - Evento do formulário
     */
    async handleRegister(event) {
        event.preventDefault();
        
        if (!this.isConnected) {
            this.showStatus('error', 'Por favor, conecte sua carteira primeiro.');
            return;
        }
        
        if (!contractManager.contract) {
            this.showStatus('error', 'Contrato não inicializado. Por favor, conecte sua carteira novamente.');
            return;
        }
        
        const formData = new FormData(event.target);
        const nome = formData.get('name').trim();
        
        if (!nome) {
            this.showStatus('error', 'Por favor, informe seu nome.');
            return;
        }
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Desabilitar botão
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading-spinner"></span> Registrando...';
            
            // Registrar usuário
            await contractManager.registrarUsuario(nome);
            
            // Limpar formulário
            event.target.reset();
            
            this.showStatus('success', 'Usuário registrado com sucesso!');
            
        } catch (error) {
            logger.error('DAPP', 'handleRegister', 1, '❌ Erro no registro', { error: error.message });
            this.showStatus('error', 'Erro ao registrar: ' + error.message);
        } finally {
            // Reabilitar botão
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    /**
     * Manipula consulta de usuário
     */
    async handleConsult() {
        const addressInput = document.getElementById('consult-address');
        const address = addressInput.value.trim();
        
        if (!address) {
            this.showStatus('error', 'Por favor, informe um endereço.');
            return;
        }
        
        if (!window.ethers.utils.isAddress(address)) {
            this.showStatus('error', 'Endereço inválido.');
            return;
        }
        
        if (!contractManager.contract) {
            this.showStatus('error', 'Contrato não inicializado. Por favor, conecte sua carteira novamente.');
            return;
        }
        
        const consultBtn = document.getElementById('consult-user');
        const originalText = consultBtn.innerHTML;
        
        try {
            // Desabilitar botão
            consultBtn.disabled = true;
            consultBtn.innerHTML = '<span class="loading-spinner"></span> Consultando...';
            
            // Consultar usuário
            const userInfo = await contractManager.consultarUsuario(address);
            
            // Exibir informações
            this.displayUserInfo(userInfo);
            
        } catch (error) {
            logger.error('DAPP', 'handleConsult', 1, '❌ Erro na consulta', { error: error.message });
            this.showStatus('error', 'Erro ao consultar: ' + error.message);
            
            // Esconder informações anteriores
            document.getElementById('user-info').classList.add('hidden');
        } finally {
            // Reabilitar botão
            const consultBtn = document.getElementById('consult-user');
            consultBtn.disabled = false;
            consultBtn.innerHTML = originalText;
        }
    }

    /**
     * Exibe informações do usuário
     * @param {object} userInfo - Informações do usuário
     */
    displayUserInfo(userInfo) {
        const userInfoDiv = document.getElementById('user-info');
        
        userInfoDiv.innerHTML = `
            <div class="space-y-3">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <span class="text-sm text-gray-500">Nome:</span>
                        <p class="font-semibold">${userInfo.nome}</p>
                    </div>
                    <div>
                        <span class="text-sm text-gray-500">Carteira:</span>
                        <p class="font-mono text-sm">${userInfo.carteira}</p>
                    </div>
                    <div>
                        <span class="text-sm text-gray-500">Data Registro:</span>
                        <p class="text-sm">${userInfo.dataRegistro}</p>
                    </div>
                    <div>
                        <span class="text-sm text-gray-500">Status:</span>
                        <p class="text-sm">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                userInfo.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }">
                                ${userInfo.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                        </p>
                    </div>
                    <div>
                        <span class="text-sm text-gray-500">Saldo de Tokens:</span>
                        <p class="text-lg font-bold text-indigo-600">${userInfo.saldo} tokens</p>
                    </div>
                    <div>
                        <span class="text-sm text-gray-500">Registrado:</span>
                        <p class="text-sm">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                userInfo.estaRegistrado ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }">
                                ${userInfo.estaRegistrado ? 'Sim' : 'Não'}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        userInfoDiv.classList.remove('hidden');
        logger.success('DAPP', 'displayUserInfo', 1, '✅ Informações do usuário exibidas');
    }

    /**
     * Preenche o campo de consulta com o endereço do usuário
     */
    useMyAddress() {
        if (this.userAddress) {
            document.getElementById('consult-address').value = this.userAddress;
            logger.info('DAPP', 'useMyAddress', 1, '👤 Endereço do usuário preenchido');
        }
    }

    /**
     * Manipula distribuição de recompensa
     */
    async handleDistributeReward() {
        const addressInput = document.getElementById('reward-address');
        const address = addressInput.value.trim();
        
        if (!address) {
            this.showStatus('error', 'Por favor, informe um endereço.');
            return;
        }
        
        if (!window.ethers.utils.isAddress(address)) {
            this.showStatus('error', 'Endereço inválido.');
            return;
        }
        
        if (!contractManager.isOwner) {
            this.showStatus('error', 'Apenas o owner pode distribuir recompensas.');
            return;
        }
        
        try {
            // Desabilitar botão
            const rewardBtn = document.getElementById('distribute-reward');
            const originalText = rewardBtn.innerHTML;
            rewardBtn.disabled = true;
            rewardBtn.innerHTML = '<span class="loading-spinner"></span> Distribuindo...';
            
            // Distribuir recompensa
            await contractManager.recompensarUsuario(address);
            
            // Limpar campo
            addressInput.value = '';
            
            this.showStatus('success', 'Recompensa distribuída com sucesso!');
            
        } catch (error) {
            logger.error('DAPP', 'handleDistributeReward', 1, '❌ Erro ao distribuir recompensa', { error: error.message });
            this.showStatus('error', 'Erro ao distribuir recompensa: ' + error.message);
        } finally {
            // Reabilitar botão
            const rewardBtn = document.getElementById('distribute-reward');
            rewardBtn.disabled = false;
            rewardBtn.innerHTML = originalText;
        }
    }

    /**
     * Exibe mensagem de status
     * @param {string} type - Tipo da mensagem (success, error, warning, info)
     * @param {string} message - Mensagem
     */
    showStatus(type, message) {
        const container = document.getElementById('status-container');
        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message status-${type} fade-in`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        statusDiv.innerHTML = `
            <i class="${icons[type] || 'fas fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(statusDiv);
        
        // Remover após 5 segundos
        setTimeout(() => {
            statusDiv.style.opacity = '0';
            setTimeout(() => {
                if (statusDiv.parentNode) {
                    statusDiv.parentNode.removeChild(statusDiv);
                }
            }, 300);
        }, 5000);
        
        logger.info('DAPP', 'showStatus', 1, `💬 Status exibido: ${type}`, { message });
    }

    /**
     * Manipula mudança de contas
     * @param {Array} accounts - Novas contas
     */
    async handleAccountsChanged(accounts) {
        logger.info('DAPP', 'handleAccountsChanged', 1, '🔄 Contas alteradas', { accounts });
        
        if (accounts.length === 0) {
            this.disconnectWallet();
        } else if (accounts[0] !== this.userAddress) {
            this.userAddress = accounts[0];
            this.updateWalletUI();
            await this.updateWalletBalance();
            if (this.contractAddress) {
                await this.initializeContract();
            }
        }
    }

    /**
     * Manipula mudança de rede
     * @param {string} chainId - ID da nova rede
     */
    async handleChainChanged(chainId) {
        logger.info('DAPP', 'handleChainChanged', 1, '🌐 Rede alterada', { chainId });
        
        try {
            // Recreate provider and signer after network change
            this.provider = new window.ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            
            // Atualizar informações da rede
            await this.checkNetwork();
            await this.updateWalletBalance();
            
            // Re-inicializar contrato se houver endereço e estiver conectado
            if (this.contractAddress && this.isConnected) {
                await this.initializeContract();
            }
        } catch (error) {
            logger.error('DAPP', 'handleChainChanged', 1, '❌ Erro ao atualizar após mudança de rede', { error: error.message });
        }
    }

    /**
     * Manipula desconexão
     */
    handleDisconnect() {
        logger.info('DAPP', 'handleDisconnect', 1, '🔌 MetaMask desconectado');
        this.disconnectWallet();
    }
}

// A instância será criada automaticamente quando todos os scripts forem carregados
