/**
 * @file deploy.js
 * @description Script de deploy do contrato RegistroDeUsuariosComRecompensa.
 *              Gera logs detalhados na pasta logs/ para auditoria.
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Gera timestamp formatado para logs.
 * @returns {string} Data/hora no formato ISO
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Escreve uma linha de log no arquivo e no console.
 * @param {fs.WriteStream} logStream - Stream do arquivo de log
 * @param {string} emoji - Emoticon indicador do tipo de mensagem
 * @param {string} funcName - Nome da função que gerou o log
 * @param {string} message - Mensagem descritiva
 * @param {object} [params] - Parâmetros relevantes (não sensíveis)
 */
function log(logStream, emoji, funcName, message, params = {}) {
  const timestamp = getTimestamp();
  const paramsStr = Object.keys(params).length > 0
    ? ` | params: ${JSON.stringify(params)}`
    : "";
  const line = `${emoji} [${timestamp}] [deploy.js] [${funcName}] ${message}${paramsStr}`;
  console.log(line);
  logStream.write(line + "\n");
}

async function main() {
  const logsDir = path.resolve(__dirname, "../../logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const logFile = path.join(logsDir, `deploy_${Date.now()}.log`);
  const logStream = fs.createWriteStream(logFile, { flags: "a" });

  try {
    log(logStream, "🚀", "main", "Iniciando deploy do contrato RegistroDeUsuariosComRecompensa");
    log(logStream, "🌐", "main", "Rede de deploy", { 
      network: hre.network.name,
      chainId: hre.network.config.chainId || "local"
    });

    const [deployer] = await hre.ethers.getSigners();
    log(logStream, "👤", "main", "Deployer identificado", { address: deployer.address });

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    log(logStream, "💰", "main", "Saldo do deployer", { balance: hre.ethers.formatEther(balance) + " ETH" });

    log(logStream, "🔨", "main", "Obtendo factory do contrato...");
    const ContractFactory = await hre.ethers.getContractFactory("RegistroDeUsuariosComRecompensa");

    log(logStream, "📦", "main", "Realizando deploy...");
    const contract = await ContractFactory.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    log(logStream, "✅", "main", "Contrato implantado com sucesso!", { address: contractAddress });

    const owner = await contract.owner();
    log(logStream, "🔑", "main", "Owner do contrato", { owner });

    const valorRecompensa = await contract.VALOR_RECOMPENSA();
    log(logStream, "🎁", "main", "Valor de recompensa configurado", { valorRecompensa: valorRecompensa.toString() });

    log(logStream, "📝", "main", "Deploy finalizado com sucesso", {
      contrato: contractAddress,
      rede: hre.network.name,
      deployer: deployer.address,
    });

    // Salva informações do deploy em JSON para referência futura
    const deployInfo = {
      contrato: contractAddress,
      rede: hre.network.name,
      deployer: deployer.address,
      timestamp: getTimestamp(),
      valorRecompensa: valorRecompensa.toString(),
    };

    const deployInfoPath = path.join(logsDir, `deploy_info_${Date.now()}.json`);
    fs.writeFileSync(deployInfoPath, JSON.stringify(deployInfo, null, 2));
    log(logStream, "💾", "main", "Informações de deploy salvas", { arquivo: deployInfoPath });

  } catch (error) {
    log(logStream, "❌", "main", "Erro durante o deploy", { error: error.message });
    throw error;
  } finally {
    logStream.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deploy falhou:", error);
    process.exit(1);
  });
