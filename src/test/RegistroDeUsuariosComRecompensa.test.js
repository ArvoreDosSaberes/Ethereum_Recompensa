/**
 * @file RegistroDeUsuariosComRecompensa.test.js
 * @description Testes unitários completos para o contrato RegistroDeUsuariosComRecompensa.
 *              Gera logs detalhados na pasta logs/ para análise.
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// =========================================================================
// SISTEMA DE LOGS
// =========================================================================

const logsDir = path.resolve(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, `test_${Date.now()}.log`);
const logStream = fs.createWriteStream(logFile, { flags: "a" });

function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Escreve log formatado no arquivo e console.
 * @param {string} emoji - Emoticon indicador
 * @param {string} funcName - Nome da função/teste
 * @param {number} line - Linha aproximada do teste
 * @param {string} message - Mensagem descritiva
 * @param {object} [params] - Parâmetros relevantes
 */
function log(emoji, funcName, line, message, params = {}) {
  const paramsStr = Object.keys(params).length > 0
    ? ` | params: ${JSON.stringify(params)}`
    : "";
  const logLine = `${emoji} [${getTimestamp()}] [RegistroDeUsuariosComRecompensa.test.js] [${funcName}] [L${line}] ${message}${paramsStr}`;
  console.log(logLine);
  logStream.write(logLine + "\n");
}

// =========================================================================
// TESTES
// =========================================================================

describe("RegistroDeUsuariosComRecompensa", function () {
  let contract;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    log("🔧", "beforeEach", 63, "Obtendo signers", {
      owner: owner.address,
      addr1: addr1.address,
      addr2: addr2.address,
    });

    const Factory = await ethers.getContractFactory("RegistroDeUsuariosComRecompensa");
    contract = await Factory.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    log("✅", "beforeEach", 72, "Contrato deployado para testes", { address: contractAddress });
  });

  // =========================================================================
  // DEPLOY E ESTADO INICIAL
  // =========================================================================

  describe("Deploy e Estado Inicial", function () {
    it("Deve definir o deployer como owner", async function () {
      const contractOwner = await contract.owner();
      log("🔑", "deploy:owner", 83, "Verificando owner", {
        esperado: owner.address,
        obtido: contractOwner,
      });
      expect(contractOwner).to.equal(owner.address);
      log("✅", "deploy:owner", 88, "Owner confirmado corretamente");
    });

    it("Deve ter VALOR_RECOMPENSA igual a 100", async function () {
      const valor = await contract.VALOR_RECOMPENSA();
      log("🎁", "deploy:valorRecompensa", 93, "Verificando valor de recompensa", {
        esperado: 100,
        obtido: valor.toString(),
      });
      expect(valor).to.equal(100n);
      log("✅", "deploy:valorRecompensa", 98, "Valor de recompensa correto");
    });

    it("Deve iniciar com zero usuários", async function () {
      const total = await contract.totalUsuarios();
      log("📊", "deploy:totalUsuarios", 103, "Verificando total inicial", {
        esperado: 0,
        obtido: total.toString(),
      });
      expect(total).to.equal(0n);
      log("✅", "deploy:totalUsuarios", 108, "Total inicial correto");
    });
  });

  // =========================================================================
  // RF-02: REGISTRO DE USUÁRIOS
  // =========================================================================

  describe("RF-02: Registro de Usuários", function () {
    it("Deve registrar um novo usuário com sucesso", async function () {
      log("📝", "registro:sucesso", 119, "Tentando registrar usuário", {
        nome: "Alice",
        carteira: addr1.address,
      });

      const tx = await contract.connect(addr1).registrarUsuario("Alice");
      const receipt = await tx.wait();

      log("⛽", "registro:sucesso", 127, "Gas consumido no registro", {
        gasUsed: receipt.gasUsed.toString(),
      });

      // Verifica os dados armazenados
      const usuario = await contract.consultarUsuario(addr1.address);
      log("📋", "registro:sucesso", 133, "Dados do usuário registrado", {
        nome: usuario.nome,
        carteira: usuario.carteira,
        ativo: usuario.ativo,
        dataRegistro: usuario.dataRegistro.toString(),
      });

      expect(usuario.nome).to.equal("Alice");
      expect(usuario.carteira).to.equal(addr1.address);
      expect(usuario.ativo).to.equal(true);
      expect(usuario.dataRegistro).to.be.greaterThan(0n);

      // Verifica mapping auxiliar
      const existe = await contract.usuarioExiste(addr1.address);
      expect(existe).to.equal(true);

      // Verifica contador
      const total = await contract.totalUsuarios();
      expect(total).to.equal(1n);

      log("✅", "registro:sucesso", 152, "Usuário registrado e verificado com sucesso");
    });

    it("Deve emitir evento UsuarioRegistrado ao registrar", async function () {
      log("📡", "registro:evento", 156, "Verificando emissão de evento UsuarioRegistrado");

      await expect(contract.connect(addr1).registrarUsuario("Bob"))
        .to.emit(contract, "UsuarioRegistrado")
        .withArgs(addr1.address, "Bob", (value) => {
          log("📡", "registro:evento", 161, "Evento emitido", {
            carteira: addr1.address,
            nome: "Bob",
            timestamp: value.toString(),
          });
          return value > 0n;
        });

      log("✅", "registro:evento", 169, "Evento UsuarioRegistrado emitido corretamente");
    });

    it("Deve rejeitar registro com nome vazio", async function () {
      log("🚫", "registro:nomeVazio", 173, "Tentando registrar com nome vazio");

      await expect(
        contract.connect(addr1).registrarUsuario("")
      ).to.be.revertedWith("Nome nao pode ser vazio");

      log("✅", "registro:nomeVazio", 179, "Rejeição por nome vazio confirmada");
    });

    it("Deve rejeitar registro duplicado", async function () {
      log("🚫", "registro:duplicado", 183, "Registrando usuário e tentando duplicar");

      await contract.connect(addr1).registrarUsuario("Alice");
      log("📝", "registro:duplicado", 186, "Primeiro registro OK");

      await expect(
        contract.connect(addr1).registrarUsuario("Alice Dois")
      ).to.be.revertedWith("Usuario ja registrado");

      log("✅", "registro:duplicado", 192, "Rejeição de duplicata confirmada");
    });

    it("Deve registrar múltiplos usuários distintos", async function () {
      log("👥", "registro:multiplos", 196, "Registrando múltiplos usuários");

      await contract.connect(addr1).registrarUsuario("Alice");
      await contract.connect(addr2).registrarUsuario("Bob");
      await contract.connect(addr3).registrarUsuario("Carlos");

      const total = await contract.totalUsuarios();
      log("📊", "registro:multiplos", 203, "Total de usuários registrados", {
        total: total.toString(),
      });

      expect(total).to.equal(3n);

      const u1 = await contract.consultarUsuario(addr1.address);
      const u2 = await contract.consultarUsuario(addr2.address);
      const u3 = await contract.consultarUsuario(addr3.address);

      expect(u1.nome).to.equal("Alice");
      expect(u2.nome).to.equal("Bob");
      expect(u3.nome).to.equal("Carlos");

      log("✅", "registro:multiplos", 217, "Múltiplos registros verificados com sucesso");
    });
  });

  // =========================================================================
  // RF-03: CONSULTA DE USUÁRIOS
  // =========================================================================

  describe("RF-03: Consulta de Usuários", function () {
    beforeEach(async function () {
      await contract.connect(addr1).registrarUsuario("Alice");
      log("📝", "consulta:beforeEach", 229, "Usuário Alice registrado para testes de consulta");
    });

    it("Deve retornar informações completas do usuário", async function () {
      log("🔍", "consulta:completa", 233, "Consultando usuário Alice");

      const usuario = await contract.consultarUsuario(addr1.address);

      log("📋", "consulta:completa", 237, "Dados retornados", {
        nome: usuario.nome,
        carteira: usuario.carteira,
        ativo: usuario.ativo,
        dataRegistro: usuario.dataRegistro.toString(),
      });

      expect(usuario.nome).to.equal("Alice");
      expect(usuario.carteira).to.equal(addr1.address);
      expect(usuario.ativo).to.equal(true);
      expect(usuario.dataRegistro).to.be.greaterThan(0n);

      log("✅", "consulta:completa", 249, "Consulta retornou dados corretos");
    });

    it("Deve rejeitar consulta de usuário inexistente", async function () {
      log("🚫", "consulta:inexistente", 253, "Tentando consultar usuário não registrado", {
        carteira: addr2.address,
      });

      await expect(
        contract.consultarUsuario(addr2.address)
      ).to.be.revertedWith("Usuario nao encontrado");

      log("✅", "consulta:inexistente", 261, "Rejeição de consulta inexistente confirmada");
    });

    it("Deve verificar registro via estaRegistrado()", async function () {
      log("🔍", "consulta:estaRegistrado", 265, "Verificando função auxiliar estaRegistrado");

      const registrado = await contract.estaRegistrado(addr1.address);
      const naoRegistrado = await contract.estaRegistrado(addr2.address);

      log("📋", "consulta:estaRegistrado", 270, "Resultados", {
        addr1: registrado,
        addr2: naoRegistrado,
      });

      expect(registrado).to.equal(true);
      expect(naoRegistrado).to.equal(false);

      log("✅", "consulta:estaRegistrado", 278, "Verificação de registro funcionando");
    });
  });

  // =========================================================================
  // RF-04: SISTEMA DE RECOMPENSAS
  // =========================================================================

  describe("RF-04: Sistema de Recompensas", function () {
    beforeEach(async function () {
      await contract.connect(addr1).registrarUsuario("Alice");
      log("📝", "recompensa:beforeEach", 290, "Usuário Alice registrado para testes de recompensa");
    });

    it("Deve recompensar usuário ativo com sucesso", async function () {
      log("🎁", "recompensa:sucesso", 294, "Recompensando usuário Alice", {
        carteira: addr1.address,
      });

      const tx = await contract.connect(owner).recompensarUsuario(addr1.address);
      const receipt = await tx.wait();

      log("⛽", "recompensa:sucesso", 301, "Gas consumido na recompensa", {
        gasUsed: receipt.gasUsed.toString(),
      });

      const saldo = await contract.saldos(addr1.address);
      log("💰", "recompensa:sucesso", 306, "Saldo após recompensa", {
        saldo: saldo.toString(),
        esperado: "100",
      });

      expect(saldo).to.equal(100n);
      log("✅", "recompensa:sucesso", 312, "Recompensa aplicada corretamente");
    });

    it("Deve emitir evento RecompensaEnviada", async function () {
      log("📡", "recompensa:evento", 316, "Verificando emissão de evento RecompensaEnviada");

      await expect(contract.connect(owner).recompensarUsuario(addr1.address))
        .to.emit(contract, "RecompensaEnviada")
        .withArgs(addr1.address, 100n, (value) => {
          log("📡", "recompensa:evento", 321, "Evento emitido", {
            carteira: addr1.address,
            quantidade: "100",
            timestamp: value.toString(),
          });
          return value > 0n;
        });

      log("✅", "recompensa:evento", 329, "Evento RecompensaEnviada emitido corretamente");
    });

    it("Deve acumular recompensas (cumulativo)", async function () {
      log("🎁", "recompensa:cumulativo", 333, "Aplicando múltiplas recompensas");

      await contract.connect(owner).recompensarUsuario(addr1.address);
      const saldo1 = await contract.saldos(addr1.address);
      log("💰", "recompensa:cumulativo", 337, "Saldo após 1ª recompensa", { saldo: saldo1.toString() });

      await contract.connect(owner).recompensarUsuario(addr1.address);
      const saldo2 = await contract.saldos(addr1.address);
      log("💰", "recompensa:cumulativo", 341, "Saldo após 2ª recompensa", { saldo: saldo2.toString() });

      await contract.connect(owner).recompensarUsuario(addr1.address);
      const saldo3 = await contract.saldos(addr1.address);
      log("💰", "recompensa:cumulativo", 345, "Saldo após 3ª recompensa", { saldo: saldo3.toString() });

      expect(saldo1).to.equal(100n);
      expect(saldo2).to.equal(200n);
      expect(saldo3).to.equal(300n);

      log("✅", "recompensa:cumulativo", 351, "Acumulação de recompensas confirmada");
    });

    it("Deve rejeitar recompensa de não-owner", async function () {
      log("🚫", "recompensa:naoOwner", 355, "Tentando recompensar sem ser owner", {
        caller: addr2.address,
      });

      await expect(
        contract.connect(addr2).recompensarUsuario(addr1.address)
      ).to.be.revertedWith("Apenas o owner pode executar esta funcao");

      log("✅", "recompensa:naoOwner", 363, "Rejeição de não-owner confirmada");
    });

    it("Deve rejeitar recompensa para usuário inexistente", async function () {
      log("🚫", "recompensa:inexistente", 367, "Tentando recompensar usuário não registrado", {
        carteira: addr2.address,
      });

      await expect(
        contract.connect(owner).recompensarUsuario(addr2.address)
      ).to.be.revertedWith("Usuario nao encontrado");

      log("✅", "recompensa:inexistente", 375, "Rejeição de usuário inexistente confirmada");
    });

    it("Deve consultar saldo via consultarSaldo()", async function () {
      log("🔍", "recompensa:consultarSaldo", 379, "Verificando função consultarSaldo");

      const saldoAntes = await contract.consultarSaldo(addr1.address);
      expect(saldoAntes).to.equal(0n);
      log("💰", "recompensa:consultarSaldo", 383, "Saldo antes da recompensa", {
        saldo: saldoAntes.toString(),
      });

      await contract.connect(owner).recompensarUsuario(addr1.address);

      const saldoDepois = await contract.consultarSaldo(addr1.address);
      expect(saldoDepois).to.equal(100n);
      log("💰", "recompensa:consultarSaldo", 391, "Saldo após recompensa", {
        saldo: saldoDepois.toString(),
      });

      log("✅", "recompensa:consultarSaldo", 395, "consultarSaldo funcionando corretamente");
    });
  });

  // =========================================================================
  // RF-06: SEGURANÇA
  // =========================================================================

  describe("RF-06: Segurança e Validações", function () {
    it("Deve prevenir registro duplicado (segurança)", async function () {
      log("🔒", "seguranca:duplicado", 406, "Testando prevenção de registro duplicado");

      await contract.connect(addr1).registrarUsuario("Alice");

      await expect(
        contract.connect(addr1).registrarUsuario("OutroNome")
      ).to.be.revertedWith("Usuario ja registrado");

      log("✅", "seguranca:duplicado", 414, "Proteção contra duplicatas OK");
    });

    it("Deve prevenir recompensa para inexistente (segurança)", async function () {
      log("🔒", "seguranca:recompensaInexistente", 418, "Testando proteção contra recompensa inválida");

      await expect(
        contract.connect(owner).recompensarUsuario(addr1.address)
      ).to.be.revertedWith("Usuario nao encontrado");

      log("✅", "seguranca:recompensaInexistente", 424, "Proteção contra recompensa inválida OK");
    });

    it("Deve validar entrada de dados (nome vazio)", async function () {
      log("🔒", "seguranca:nomeVazio", 428, "Testando validação de nome vazio");

      await expect(
        contract.connect(addr1).registrarUsuario("")
      ).to.be.revertedWith("Nome nao pode ser vazio");

      log("✅", "seguranca:nomeVazio", 434, "Validação de nome vazio OK");
    });

    it("Deve implementar controle de acesso (owner only)", async function () {
      log("🔒", "seguranca:controleAcesso", 438, "Testando controle de acesso do owner");

      await contract.connect(addr1).registrarUsuario("Alice");

      // addr1 tenta recompensar (não é owner)
      await expect(
        contract.connect(addr1).recompensarUsuario(addr1.address)
      ).to.be.revertedWith("Apenas o owner pode executar esta funcao");

      // addr2 tenta recompensar (não é owner)
      await expect(
        contract.connect(addr2).recompensarUsuario(addr1.address)
      ).to.be.revertedWith("Apenas o owner pode executar esta funcao");

      // owner consegue recompensar
      await expect(
        contract.connect(owner).recompensarUsuario(addr1.address)
      ).to.not.be.reverted;

      log("✅", "seguranca:controleAcesso", 458, "Controle de acesso funcionando corretamente");
    });
  });

  // =========================================================================
  // TESTES DE INTEGRAÇÃO
  // =========================================================================

  describe("Testes de Integração: Fluxo Completo", function () {
    it("Deve executar fluxo completo: registro -> consulta -> recompensa -> saldo", async function () {
      log("🔄", "integracao:fluxoCompleto", 469, "Iniciando teste de fluxo completo");

      // 1. Registro
      log("1️⃣", "integracao:fluxoCompleto", 472, "Passo 1: Registrando usuário");
      await contract.connect(addr1).registrarUsuario("Alice");

      const existeAposRegistro = await contract.estaRegistrado(addr1.address);
      expect(existeAposRegistro).to.equal(true);
      log("✅", "integracao:fluxoCompleto", 477, "Passo 1 OK: Usuário registrado");

      // 2. Consulta
      log("2️⃣", "integracao:fluxoCompleto", 480, "Passo 2: Consultando usuário");
      const usuario = await contract.consultarUsuario(addr1.address);
      expect(usuario.nome).to.equal("Alice");
      expect(usuario.ativo).to.equal(true);
      log("✅", "integracao:fluxoCompleto", 484, "Passo 2 OK: Dados corretos", {
        nome: usuario.nome,
        ativo: usuario.ativo,
      });

      // 3. Recompensa
      log("3️⃣", "integracao:fluxoCompleto", 490, "Passo 3: Enviando recompensa");
      await contract.connect(owner).recompensarUsuario(addr1.address);
      log("✅", "integracao:fluxoCompleto", 492, "Passo 3 OK: Recompensa enviada");

      // 4. Verificação de saldo
      log("4️⃣", "integracao:fluxoCompleto", 495, "Passo 4: Verificando saldo");
      const saldo = await contract.consultarSaldo(addr1.address);
      expect(saldo).to.equal(100n);
      log("✅", "integracao:fluxoCompleto", 498, "Passo 4 OK: Saldo correto", {
        saldo: saldo.toString(),
      });

      // 5. Múltiplas recompensas
      log("5️⃣", "integracao:fluxoCompleto", 503, "Passo 5: Recompensas cumulativas");
      await contract.connect(owner).recompensarUsuario(addr1.address);
      await contract.connect(owner).recompensarUsuario(addr1.address);
      const saldoFinal = await contract.consultarSaldo(addr1.address);
      expect(saldoFinal).to.equal(300n);
      log("✅", "integracao:fluxoCompleto", 508, "Passo 5 OK: Acumulação correta", {
        saldoFinal: saldoFinal.toString(),
      });

      log("🏁", "integracao:fluxoCompleto", 512, "Fluxo completo executado com sucesso!");
    });

    it("Deve suportar múltiplos usuários com recompensas independentes", async function () {
      log("🔄", "integracao:multiplosUsuarios", 516, "Testando múltiplos usuários");

      // Registra 3 usuários
      await contract.connect(addr1).registrarUsuario("Alice");
      await contract.connect(addr2).registrarUsuario("Bob");
      await contract.connect(addr3).registrarUsuario("Carlos");

      const total = await contract.totalUsuarios();
      expect(total).to.equal(3n);
      log("📊", "integracao:multiplosUsuarios", 525, "3 usuários registrados", {
        total: total.toString(),
      });

      // Recompensa diferenciada
      await contract.connect(owner).recompensarUsuario(addr1.address); // Alice: 100
      await contract.connect(owner).recompensarUsuario(addr1.address); // Alice: 200
      await contract.connect(owner).recompensarUsuario(addr2.address); // Bob: 100

      const saldoAlice = await contract.consultarSaldo(addr1.address);
      const saldoBob = await contract.consultarSaldo(addr2.address);
      const saldoCarlos = await contract.consultarSaldo(addr3.address);

      log("💰", "integracao:multiplosUsuarios", 538, "Saldos independentes", {
        alice: saldoAlice.toString(),
        bob: saldoBob.toString(),
        carlos: saldoCarlos.toString(),
      });

      expect(saldoAlice).to.equal(200n);
      expect(saldoBob).to.equal(100n);
      expect(saldoCarlos).to.equal(0n);

      log("✅", "integracao:multiplosUsuarios", 548, "Saldos independentes confirmados");
    });
  });

  // =========================================================================
  // CLEANUP
  // =========================================================================

  after(function () {
    log("🏁", "after", 558, "Todos os testes finalizados");
    logStream.end();
    console.log(`\n📄 Log completo salvo em: ${logFile}\n`);
  });
});
