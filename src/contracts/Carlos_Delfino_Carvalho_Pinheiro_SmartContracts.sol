// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Projeto Capacitação Web3 
 * @author Carlos Delfino {consultoria@carlosdelfino.eti.br}
 * @notice Contrato para registro de usuarios e distribuição de recompensas em tokens simulados.
 *
 * @dev === CONCEITOS FUNDAMENTAIS ===
 *
 * ## O que é a EVM (Ethereum Virtual Machine)?
 * A EVM é a máquina virtual descentralizada que executa Smart Contracts na rede Ethereum.
 * Cada nó da rede possui uma cópia da EVM, garantindo que todos executem o mesmo código
 * e cheguem ao mesmo resultado (consenso). A EVM é "Turing-complete", ou seja, pode
 * executar qualquer lógica computacional, limitada apenas pelo gas disponível.
 *
 * ## O que é Gas?
 * Gas é a unidade de medida do esforço computacional necessário para executar operações
 * na EVM. Cada instrução (opcode) tem um custo em gas. O usuario paga gas em ETH para
 * compensar os mineradores/validadores pelo processamento. Isso previne loops infinitos
 * e abuso da rede. Operações de escrita (SSTORE) custam mais gas que operações de leitura
 * (SLOAD), por isso otimizamos o armazenamento.
 *
 * ## Diferença para Contratos Tradicionais
 * Diferente de contratos legais tradicionais (papel/digital):
 * - Smart Contracts são auto-executáveis: as regras são aplicadas automaticamente pelo código
 * - São imutáveis: uma vez implantados, nao podem ser alterados
 * - São transparentes: qualquer pessoa pode verificar o código na blockchain
 * - São trustless: nao dependem de intermediários para execução
 * - São determinísticos: dada a mesma entrada, sempre produzem a mesma saída
 *
 * ## Caso de Uso Real
 * Este contrato pode ser aplicado em plataformas educacionais descentralizadas,
 * onde alunos se registram e recebem tokens de recompensa ao completar cursos,
 * atividades ou desafios. Os tokens acumulados podem ser trocados por certificados,
 * acesso a conteúdo premium ou outros benefícios dentro do ecossistema educacional.
 */
contract RegistroDeUsuariosComRecompensa {

    // =========================================================================
    // ESTRUTURAS DE DADOS
    // =========================================================================

    /**
     * @notice Estrutura que representa um usuario registrado no sistema.
     * @dev Armazenada em storage via mapping. O campo `dataRegistro` usa
     *      block.timestamp (uint256) para registrar o momento do registro.
     *      Gas: structs com tipos fixos (address, uint256, bool) são mais
     *      eficientes que tipos dinâmicos (string). O campo `nome` é dinâmico
     *      e consome mais gas para armazenamento.
     */
    struct Usuario {
        string nome;          // Nome do usuario registrado
        address carteira;     // Endereço Ethereum do usuario
        uint256 dataRegistro; // Timestamp do registro (block.timestamp)
        bool ativo;           // Status do usuario no sistema
    }

    // =========================================================================
    // VARIÁVEIS DE ESTADO
    // =========================================================================

    /**
     * @notice Endereço do administrador (owner) do contrato.
     * @dev Definido no constructor como msg.sender. Apenas o owner pode
     *      distribuir recompensas, implementando controle de acesso básico.
     *      Gas: variáveis immutable são armazenadas no bytecode do contrato,
     *      custando menos gas em leituras do que variáveis de storage comuns.
     */
    address public immutable owner;

    /**
     * @notice Valor de recompensa distribuído por chamada (em tokens simulados).
     * @dev Definido como constante para otimização de gas. Constantes nao
     *      ocupam slot de storage, sendo embutidas diretamente no bytecode.
     */
    uint256 public constant VALOR_RECOMPENSA = 100;

    /**
     * @notice Mapping principal: endereço => dados do usuario.
     * @dev Gas: mappings em Solidity usam hashing (keccak256) para calcular
     *      a posição no storage. Acesso é O(1) mas cada slot custa 20.000 gas
     *      para primeira escrita (SSTORE) e 5.000 gas para atualizações.
     */
    mapping(address => Usuario) public usuarios;

    /**
     * @notice Mapping de saldos de tokens simulados.
     * @dev Simula um token ERC-20 de forma simplificada. Em um cenário real,
     *      seria recomendável implementar a interface IERC20 completa.
     */
    mapping(address => uint256) public saldos;

    /**
     * @notice Mapping auxiliar para verificação rápida de existência.
     * @dev Mais eficiente em gas do que verificar campos da struct,
     *      pois evita carregar toda a struct do storage.
     */
    mapping(address => bool) public usuarioExiste;

    /**
     * @notice Contador total de usuarios registrados.
     * @dev Útil para estatísticas e consultas off-chain.
     */
    uint256 public totalUsuarios;

    // =========================================================================
    // EVENTOS
    // =========================================================================

    /**
     * @notice Emitido quando um novo usuario é registrado com sucesso.
     * @dev O modificador `indexed` no campo `carteira` permite filtrar
     *      eventos por endereço em consultas off-chain (logs do Ethereum).
     *      Gas: eventos são armazenados nos logs da transação, que são mais
     *      baratos que o storage (~375 gas por byte vs ~20.000 gas por slot).
     * @param carteira Endereço Ethereum do usuario registrado
     * @param nome Nome fornecido pelo usuario
     * @param data Timestamp do bloco no momento do registro
     */
    event UsuarioRegistrado(
        address indexed carteira,
        string nome,
        uint256 data
    );

    /**
     * @notice Emitido quando uma recompensa é distribuída a um usuario.
     * @param carteira Endereço do usuario que recebeu a recompensa
     * @param quantidade Quantidade de tokens simulados distribuídos
     * @param data Timestamp do bloco no momento da recompensa
     */
    event RecompensaEnviada(
        address indexed carteira,
        uint256 quantidade,
        uint256 data
    );

    // =========================================================================
    // MODIFICADORES
    // =========================================================================

    /**
     * @notice Restringe execução ao owner do contrato.
     * @dev Padrão de controle de acesso básico. Em produção, considerar
     *      usar OpenZeppelin Ownable para funcionalidades mais robustas.
     */
    modifier apenasOwner() {
        require(msg.sender == owner, "Apenas o owner pode executar esta funcao");
        _;
    }

    /**
     * @notice Verifica se um usuario existe no sistema.
     * @param _carteira Endereço a ser verificado
     */
    modifier usuarioDeveExistir(address _carteira) {
        require(usuarioExiste[_carteira], "Usuario nao encontrado");
        _;
    }

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    /**
     * @notice Inicializa o contrato definindo o deployer como owner.
     * @dev O constructor é executado apenas uma vez durante o deploy.
     *      Gas do deploy: ~200.000-500.000 gas dependendo do tamanho do bytecode.
     *      Usar `immutable` para owner economiza gas em leituras futuras.
     */
    constructor() {
        owner = msg.sender;
    }

    // =========================================================================
    // FUNÇÕES PRINCIPAIS
    // =========================================================================

    /**
     * @notice Registra um novo usuario no sistema.
     * @dev Usa `external` ao invés de `public` para economizar gas quando
     *      chamada externamente, pois parâmetros `calldata` são mais baratos
     *      que `memory`. A função valida: nome nao vazio, usuario nao duplicado,
     *      e endereço válido (nao zero).
     *
     *      Gas estimado: ~60.000-80.000 gas (3 SSTOREs + evento)
     *
     * @param _nome Nome do usuario a ser registrado (nao pode ser vazio)
     *
     * Emite evento {UsuarioRegistrado}
     */
    function registrarUsuario(string calldata _nome) external {
        // Validação: endereço zero nao pode registrar (RN-03)
        require(msg.sender != address(0), "Endereco invalido");

        // Validação: nome nao pode ser vazio (RF-02, RN-03)
        require(bytes(_nome).length > 0, "Nome nao pode ser vazio");

        // Validação: prevenir registros duplicados (RF-06, RN-01)
        require(!usuarioExiste[msg.sender], "usuario ja registrado");

        // Armazenamento dos dados do usuario (RF-01)
        // Gas: cada SSTORE (primeira escrita) custa 20.000 gas
        usuarios[msg.sender] = Usuario({
            nome: _nome,
            carteira: msg.sender,
            dataRegistro: block.timestamp,
            ativo: true
        });

        // Marca existência para consultas rápidas
        usuarioExiste[msg.sender] = true;

        // Incrementa contador de usuarios
        totalUsuarios++;

        // Emissão de evento (RF-05) - mais barato que storage para dados históricos
        emit UsuarioRegistrado(msg.sender, _nome, block.timestamp);
    }

    /**
     * @notice Consulta informações completas de um usuario registrado.
     * @dev Função `view` nao consome gas quando chamada off-chain (via call).
     *      Apenas consome gas quando chamada por outro contrato on-chain.
     *      Retorna a struct completa em memória.
     *
     *      Gas estimado: 0 (off-chain) / ~5.000-10.000 (on-chain)
     *
     * @param _carteira Endereço Ethereum do usuario a ser consultado
     * @return Struct Usuario com todas as informações do usuario
     */
    function consultarUsuario(address _carteira)
        external
        view
        usuarioDeveExistir(_carteira)
        returns (Usuario memory)
    {
        return usuarios[_carteira];
    }

    /**
     * @notice Distribui recompensa em tokens simulados para um usuario.
     * @dev Apenas o owner pode chamar esta função (controle de acesso).
     *      A recompensa é cumulativa - o valor é somado ao saldo existente.
     *      Usa `unchecked` nao é necessário aqui pois Solidity ^0.8.x já
     *      possui verificação de overflow nativa.
     *
     *      Gas estimado: ~30.000-40.000 gas (1 SSTORE + evento)
     *
     * @param _carteira Endereço do usuario a ser recompensado
     *
     * Emite evento {RecompensaEnviada}
     */
    function recompensarUsuario(address _carteira)
        external
        apenasOwner
        usuarioDeveExistir(_carteira)
    {
        // Validação: usuario deve estar ativo (RN-02, RN-03)
        require(usuarios[_carteira].ativo, "Usuario inativo nao pode receber recompensa");

        // Adiciona tokens simulados ao saldo (RF-04)
        // Gas: SSTORE para atualizar valor existente custa ~5.000 gas
        saldos[_carteira] += VALOR_RECOMPENSA;

        // Emissão de evento de recompensa (RF-05)
        emit RecompensaEnviada(_carteira, VALOR_RECOMPENSA, block.timestamp);
    }

    // =========================================================================
    // FUNÇÕES AUXILIARES
    // =========================================================================

    /**
     * @notice Consulta o saldo de tokens simulados de um usuario.
     * @dev Função view - sem custo de gas quando chamada off-chain.
     * @param _carteira Endereço do usuario
     * @return Saldo de tokens simulados do usuario
     */
    function consultarSaldo(address _carteira)
        external
        view
        returns (uint256)
    {
        return saldos[_carteira];
    }

    /**
     * @notice Verifica se um endereço está registrado no sistema.
     * @dev Função view auxiliar para consultas rápidas off-chain.
     * @param _carteira Endereço a ser verificado
     * @return true se o usuario está registrado, false caso contrário
     */
    function estaRegistrado(address _carteira)
        external
        view
        returns (bool)
    {
        return usuarioExiste[_carteira];
    }
}
