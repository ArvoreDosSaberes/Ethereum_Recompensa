const { ethers } = require("ethers");

async function main() {
    console.log("🔧 Testando conexão com o contrato na Sepolia...");
    
    const contractAddress = "0xCF2aB63a9bA9F7B96cd949f1fB69518ea9aBBD6a";
    const sepoliaRpcUrl = "https://ethereum-sepolia-rpc.publicnode.com"; // Public RPC endpoint
    
    // Conectar à rede Sepolia
    const provider = new ethers.JsonRpcProvider(sepoliaRpcUrl);
    
    // Verificar rede
    const network = await provider.getNetwork();
    console.log(`📍 Rede: ${network.name} (ChainId: ${network.chainId})`);
    
    if (network.chainId.toString() !== "11155111") {
        throw new Error("❌ Você não está na rede Sepolia!");
    }
    
    // Verificar se há código no endereço
    const code = await provider.getCode(contractAddress);
    if (code === "0x") {
        console.error("❌ Nenhum contrato encontrado no endereço!");
        return;
    }
    console.log("✅ Contrato encontrado no endereço!");
    
    // Conectar ao contrato
    const contractABI = [
        "function owner() view returns (address)",
        "function totalUsuarios() view returns (uint256)",
        "function VALOR_RECOMPENSA() view returns (uint256)",
        "function consultarUsuario(address) view returns (tuple(string nome, address carteira, uint256 dataRegistro, bool ativo))",
        "function estaRegistrado(address) view returns (bool)",
        "function consultarSaldo(address) view returns (uint256)"
    ];
    
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    try {
        // Testar funções de view
        const owner = await contract.owner();
        const totalUsuarios = await contract.totalUsuarios();
        const valorRecompensa = await contract.VALOR_RECOMPENSA();
        
        console.log("\n📊 Informações do contrato:");
        console.log(`   - Owner: ${owner}`);
        console.log(`   - Total Usuários: ${totalUsuarios.toString()}`);
        console.log(`   - Valor Recompensa: ${valorRecompensa.toString()}`);
        
        // Testar consulta de usuário (com um endereço qualquer)
        const testAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
        const estaRegistrado = await contract.estaRegistrado(testAddress);
        
        console.log(`\n🔍 Teste de consulta (endereço ${testAddress}):`);
        console.log(`   - Está registrado: ${estaRegistrado}`);
        
        if (estaRegistrado) {
            const usuario = await contract.consultarUsuario(testAddress);
            const saldo = await contract.consultarSaldo(testAddress);
            
            console.log(`   - Nome: ${usuario.nome}`);
            console.log(`   - Carteira: ${usuario.carteira}`);
            console.log(`   - Data Registro: ${new Date(usuario.dataRegistro.toNumber() * 1000).toLocaleString()}`);
            console.log(`   - Ativo: ${usuario.ativo}`);
            console.log(`   - Saldo: ${saldo.toString()}`);
        }
        
        console.log("\n✅ Contrato está funcionando corretamente!");
        console.log(`🌐 Verifique no Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
        
    } catch (error) {
        console.error("❌ Erro ao interagir com o contrato:", error.message);
        
        if (error.message.includes("call revert exception")) {
            console.error("\n💡 Possíveis causas:");
            console.error("   - O ABI pode estar incorreto");
            console.error("   - O contrato pode estar em uma rede diferente");
            console.error("   - O endereço pode estar incorreto");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
