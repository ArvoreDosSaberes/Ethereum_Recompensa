const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🚀 Iniciando deploy do contrato na Sepolia...");
    
    // Verificar se a configuração da rede está correta
    const network = await ethers.provider.getNetwork();
    console.log(`📍 Rede atual: ${network.name} (ChainId: ${network.chainId})`);
    
    if (network.chainId !== 11155111) {
        throw new Error("❌ Você não está na rede Sepolia! Por favor, configure o Hardhat para a Sepolia.");
    }
    
    // Compilar e deployar
    const RegistroDeUsuarios = await ethers.getContractFactory("RegistroDeUsuariosComRecompensa");
    console.log("📝 Deployando contrato...");
    
    const registro = await RegistroDeUsuarios.deploy();
    await registro.deployed();
    
    console.log("✅ Contrato deployado com sucesso!");
    console.log(`📍 Endereço do contrato: ${registro.address}`);
    console.log(`🔗 Hash da transação: ${registro.deployTransaction.hash}`);
    console.log(`🌐 Etherscan: https://sepolia.etherscan.io/address/${registro.address}`);
    
    // Salvar endereço em um arquivo .env para fácil acesso
    const fs = require("fs");
    const envContent = `# Contract Address Sepolia
CONTRACT_ADDRESS_SEPOLIA=${registro.address}
`;
    
    fs.writeFileSync(".env.contract", envContent);
    console.log("📁 Endereço salvo em .env.contract");
    
    // Verificar se o contrato foi deployado corretamente
    const code = await ethers.provider.getCode(registro.address);
    if (code === "0x") {
        console.error("❌ Erro: Nenhum código encontrado no endereço!");
        process.exit(1);
    }
    
    console.log("✅ Contrato verificado e funcionando!");
    
    // Testar inicialização
    try {
        const owner = await registro.owner();
        const totalUsuarios = await registro.totalUsuarios();
        const valorRecompensa = await registro.VALOR_RECOMPENSA();
        
        console.log("📊 Informações do contrato:");
        console.log(`   - Owner: ${owner}`);
        console.log(`   - Total Usuários: ${totalUsuarios}`);
        console.log(`   - Valor Recompensa: ${valorRecompensa}`);
    } catch (error) {
        console.error("❌ Erro ao verificar contrato:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
