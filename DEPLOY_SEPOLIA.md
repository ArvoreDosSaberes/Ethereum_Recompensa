# Deploy na Rede Sepolia

## Configuração

1. **Obter ETH de Teste Sepolia:**
   - Acesse um faucet como: https://sepoliafaucet.com/
   - Use sua carteira MetaMask ou similar para receber ETH de teste

2. **Configurar Variáveis de Ambiente:**
   - Copie o arquivo `.env` para seu diretório raiz
   - Preencha suas credenciais:

   ```bash
   # URL RPC para Sepolia (Infura, Alchemy, etc.)
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
   
   # Chave privada da carteira (NUNCA compartilhe!)
   PRIVATE_KEY=0x...
   
   # API Key Etherscan (opcional, para verificação)
   ETHERSCAN_API_KEY=your_api_key
   ```

3. **Instalar Dependências:**
   ```bash
   npm install
   ```

## Deploy

### Via Hardhat (Recomendado)

```bash
# Compilar contrato
npm run compile

# Deploy na Sepolia
npm run deploy:sepolia
```

### Via Remix (Alternativa)

1. Abra o contrato `src/contracts/RegistroDeUsuariosComRecompensa.sol` no Remix
2. Configure o ambiente para "Injected Provider - MetaMask"
3. Certifique-se que MetaMask está conectado à rede Sepolia
4. Compile e deploy pelo Remix

## Verificação

Após o deploy, você pode verificar o contrato no Etherscan Sepolia:
- URL: https://sepolia.etherscan.io/

## Logs

Todos os logs de deploy são salvos na pasta `logs/` com timestamp:
- `deploy_*.log` - Log detalhado do processo
- `deploy_info_*.json` - Informações estruturadas do deploy

## Troubleshooting

### Erro: "Insufficient funds"
- Verifique se você tem ETH suficiente na Sepolia
- Use um faucet para obter mais ETH de teste

### Erro: "Network not configured"
- Verifique se as variáveis de ambiente estão corretas
- Confirme que `SEPOLIA_RPC_URL` está acessível

### Erro: "Invalid private key"
- Verifique se a chave privada está no formato correto (0x...)
- Confirme que a carteira tem saldo na Sepolia
