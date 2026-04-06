# Interface Web - Registro de Usuários com Recompensa

## 📋 Descrição

Esta é uma aplicação web (DApp) **autônoma** desenvolvida para interagir com o Smart Contract `RegistroDeUsuariosComRecompensa`. A interface permite que usuários se registrem no sistema, consultem informações e recebam recompensas em tokens simulados.

**Frontend 100% autônomo - sem necessidade de backend!**

## 🚀 Funcionalidades

### 👤 Registro de Usuários
- Cadastro de novos usuários no sistema blockchain
- Validação de dados e prevenção de duplicatas
- Emissão de eventos para rastreabilidade

### 🔍 Consulta de Informações
- Consulta de dados completos de usuários registrados
- Verificação de saldos de tokens
- Status de registro e ativação

### 🎁 Sistema de Recompensas
- Distribuição de tokens simulados (apenas owner)
- Controle de acesso baseado em permissões
- Registro histórico de recompensas

### 📊 Logs e Monitoramento
- Sistema de logging detalhado com emoticons
- Registro de todas as operações
- Interface para visualização de logs em tempo real

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Framework UI**: TailwindCSS (via CDN)
- **Blockchain**: Ethereum (Hardhat Localhost / Sepolia Testnet)
- **Web3 Library**: Ethers.js v5.7.2 (via CDN)
- **Wallet**: MetaMask
- **Icons**: Font Awesome (via CDN)

## 📋 Pré-requisitos

1. **MetaMask** instalado no navegador
2. **Hardhat** para deploy do contrato
3. Conta Ethereum com ETH para taxas de gás

## 🚀 Como Usar

### 1. Compilar e Deploy do Contrato
```bash
# Na raiz do projeto
npm install
npm run compile
npm run node  # (em outro terminal)
npm run deploy:local
```

### 2. Abrir a Interface Web
Como a aplicação é 100% frontend, você pode abri-la de várias formas:

#### Opção 1: Servidor Python (Recomendado)
```bash
cd web
python -m http.server 3000
```

#### Opção 2: Servidor PHP
```bash
cd web
php -S localhost:3000
```

#### Opção 3: Visual Studio Code
- Instale a extensão "Live Server"
- Clique com o botão direito em `index.html`
- Selecione "Open with Live Server"

#### Opção 4: Abrir Diretamente no Navegador
- Abra o arquivo `index.html` diretamente no navegador
- **Nota**: Pode ter limitações devido à política CORS

### 3. Configurar MetaMask
1. Abra o MetaMask
2. Adicione a rede local:
   - **Network Name**: Hardhat Local
   - **New RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 1337
   - **Currency Symbol**: ETH

### 4. Configurar Endereço do Contrato
Após fazer o deploy, configure o endereço do contrato:

1. Abra o console do navegador (F12)
2. Execute:
```javascript
localStorage.setItem('contractAddress', '0x...');
```
(Substitua `0x...` pelo endereço do seu contrato)

## 🔧 Configuração de Rede

### Rede Local (Hardhat)
- **Chain ID**: 1337 (0x539)
- **RPC URL**: http://127.0.0.1:8545
- **Configuração MetaMask**: Adicionar rede manualmente

### Sepolia Testnet
- **Chain ID**: 11155111 (0xaa36a7)
- **RPC URL**: https://sepolia.infura.io/v3/
- **Faucet**: https://sepoliafaucet.com/

## 📱 Guia de Uso

### 1. Conectar Carteira
1. Clique em "Conectar Carteira"
2. Autorize o acesso no MetaMask
3. Verifique se está na rede correta

### 2. Registrar Usuário
1. Vá para a aba "Registrar Usuário"
2. Digite seu nome completo
3. Clique em "Registrar no Sistema"
4. Aguarde a confirmação da transação

### 3. Consultar Usuário
1. Vá para a aba "Consultar Usuário"
2. Digite o endereço da carteira ou use "Meu Endereço"
3. Clique em "Consultar"
4. Visualize as informações detalhadas

### 4. Distribuir Recompensas (Apenas Owner)
1. Vá para a aba "Distribuir Recompensas"
2. Digite o endereço do usuário
3. Clique em "Distribuir Recompensa"
4. Confirme a transação no MetaMask

### 5. Visualizar Logs
1. Vá para a aba "Logs"
2. Acompanhe todas as operações em tempo real
3. Use "Limpar Logs" para limpar o histórico

## 🏗️ Estrutura do Projeto

```
web/
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos personalizados
├── js/
│   ├── app.js          # Aplicação principal
│   ├── contract.js     # Interação com contrato
│   └── logger.js       # Sistema de logging
└── README.md           # Documentação
```

## 🔍 Funções do Contrato Integradas

### `registrarUsuario(string _nome)`
- **Descrição**: Registra um novo usuário no sistema
- **Parâmetros**: Nome do usuário
- **Eventos**: `UsuarioRegistrado`

### `consultarUsuario(address _carteira)`
- **Descrição**: Consulta informações completas de um usuário
- **Retorno**: Struct Usuario com todos os dados

### `recompensarUsuario(address _carteira)`
- **Descrição**: Distribui recompensa em tokens (apenas owner)
- **Parâmetros**: Endereço do usuário a ser recompensado
- **Eventos**: `RecompensaEnviada`

### `consultarSaldo(address _carteira)`
- **Descrição**: Consulta saldo de tokens de um usuário
- **Retorno**: Saldo em tokens simulados

## 📊 Sistema de Logging

A aplicação implementa um sistema de logging detalhado seguindo as diretrizes do projeto:

### Formato das Mensagens
```
[Timestamp] [NÍVEL] 📝 arquivo:função:linha - mensagem | params: {...}
```

### Níveis de Log
- **ℹ️ INFO**: Informações gerais
- **✅ SUCCESS**: Operações bem-sucedidas
- **⚠️ WARNING**: Avisos importantes
- **❌ ERROR**: Erros e falhas

### Emoticons por Contexto
- 🚀 Inicialização
- 🔗 Conexão
- 👤 Operações de usuário
- 🎁 Recompensas
- 🔍 Consultas
- 💰 Operações financeiras
- 🌐 Operações de rede

## 🛡️ Segurança

### Melhores Práticas Implementadas
- Validação de endereços Ethereum
- Sanitização de dados sensíveis nos logs
- Controle de acesso baseado em ownership
- Verificação de estado antes das operações
- Tratamento de erros robusto

### Recomendações Adicionais
- Use HTTPS em produção
- Verifique sempre o endereço do contrato
- Mantenha o MetaMask atualizado
- Revise as transações antes de confirmar

## 🐛 Troubleshooting

### Problemas Comuns

#### "MetaMask não encontrado"
- **Solução**: Instale a extensão MetaMask no navegador

#### "Rede incorreta"
- **Solução**: Configure a rede correta no MetaMask (localhost: 1337)

#### "Contrato não encontrado"
- **Solução**: Verifique se o endereço do contrato está correto

#### "Saldo insuficiente"
- **Solução**: Adicione ETH à carteira para taxas de gás

#### "Apenas o owner pode executar"
- **Solução**: Conecte com a carteira do deployer do contrato

#### "Logger não encontrado"
- **Solução**: Verifique se todos os arquivos JS foram carregados corretamente

### Debug Mode
Abra o console do navegador (F12) para ver logs detalhados e mensagens de debug.

## 🔄 Fluxo de Trabalho

### Para Desenvolvedores
1. Modifique o contrato Solidity
2. Compile e faça o deploy
3. Atualize o ABI se necessário
4. Teste a interface web
5. Verifique os logs para debug

### Para Usuários
1. Conecte a carteira MetaMask
2. Registre-se no sistema
3. Aguarde recompensas do owner
4. Consulte seu saldo quando necessário

## 📚 Recursos Adicionais

### Documentação
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Ethers.js Documentation](https://docs.ethers.io/)
- [MetaMask Documentation](https://docs.metamask.io/)

### Ferramentas
- [Hardhat](https://hardhat.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Font Awesome](https://fontawesome.com/)

### Testnets
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)

## 🚀 Deploy em Produção

Para fazer deploy da aplicação:

1. **Build do Contrato**: Compile e faça deploy na rede desejada
2. **Atualizar Endereço**: Configure o endereço do contrato
3. **Hospedar Frontend**: Use qualquer serviço de hospedagem estática:
   - Vercel
   - Netlify
   - GitHub Pages
   - Surge.sh
4. **Configurar MetaMask**: Adicione a rede correta

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo LICENSE para detalhes.

## 👥 Autores

- **Projeto Capacitação Web3 - Árvore dos Saberes**
- Desenvolvido como parte do programa de capacitação em Web3

---

**Nota**: Esta é uma aplicação educacional para demonstração de conceitos Web3. Em produção, considere auditorias de segurança e testes extensivos.
# Ethereum_Recompensa
