![visitors](https://visitor-badge.laobi.icu/badge?page_id=ArvoreDosSaberes.Capacitacao_Web3_SmartContracts_Elemental.requisitos)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC_BY--NC--SA_4.0-blue.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
![Language: Portuguese](https://img.shields.io/badge/Language-Portuguese-brightgreen.svg)
![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.20-363636?logo=solidity)
![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?logo=ethereum)
![Machine Learning](https://img.shields.io/badge/Machine%20Learning-Prática-green)
![Status](https://img.shields.io/badge/Status-Educa%C3%A7%C3%A3o-brightgreen)
![Repository Size](https://img.shields.io/github/repo-size/ArvoreDosSaberes/Capacitacao_Web3_SmartContracts_Elemental)
![Last Commit](https://img.shields.io/github/last-commit/ArvoreDosSaberes/Capacitacao_Web3_SmartContracts_Elemental)

<!-- Animated Header -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,50:1a56db,100:10b981&height=220&section=header&text=Requisitos%20do%20Projeto&fontSize=42&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Smart%20Contract%20de%20Registro%20e%20Recompensa&descSize=18&descAlignY=55&descColor=94a3b8" width="100%" alt="Requisitos do Projeto Header"/>
</p>

# Documento de Requisitos - Smart Contract de Registro e Recompensa

## 1. Visão Geral

### 1.1. Objetivo do Projeto
Desenvolver um Smart Contract básico em Solidity para a rede Ethereum que permita o registro de usuários e distribuição de recompensas em tokens simulados, demonstrando conceitos fundamentais de blockchain.

### 1.2. Público Alvo
- Estudantes de desenvolvimento blockchain
- Desenvolvedores iniciantes em Solidity
- Entusiastas de tecnologia Web3

### 1.3. Escopo
Este documento define todos os requisitos funcionais e não funcionais para implementação do contrato `RegistroDeUsuariosComRecompensa`.

## 2. Requisitos Funcionais

### 2.1. RF-01: Estrutura de Dados
**Descrição:** O contrato deve possuir estrutura para armazenar informações dos usuários.

**Critérios de Aceite:**
- [ ] Implementar struct `Usuario` com campos:
  - `nome` (string)
  - `carteira` (address)
  - `dataRegistro` (uint256)
  - `ativo` (bool)
- [ ] Implementar mapping `usuarios` (address => Usuario)
- [ ] Implementar mapping `usuarioExiste` (address => bool)

### 2.2. RF-02: Registro de Usuários
**Descrição:** Permitir que novos usuários se registrem no sistema.

**Critérios de Aceite:**
- [ ] Função `registrarUsuario(string nome)`
- [ ] Validar que o nome não seja vazio
- [ ] Validar que o usuário ainda não existe
- [ ] Armazenar informações do usuário
- [ ] Emitir evento `UsuarioRegistrado`

### 2.3. RF-03: Consulta de Usuários
**Descrição:** Permitir consultar informações de usuários registrados.

**Critérios de Aceite:**
- [ ] Função `consultarUsuario(address carteira)`
- [ ] Retornar informações completas do usuário
- [ ] Validar que o usuário existe
- [ ] Retornar erro se usuário não encontrado

### 2.4. RF-04: Sistema de Recompensas
**Descrição:** Implementar sistema de distribuição de tokens simulados.

**Critérios de Aceite:**
- [ ] Função `recompensarUsuario(address carteira)`
- [ ] Mapping `saldos` (address => uint256)
- [ ] Validar que o usuário existe e está ativo
- [ ] Adicionar tokens ao saldo do usuário
- [ ] Emitir evento `RecompensaEnviada`

### 2.5. RF-05: Eventos
**Descrição:** Emitir eventos para registrar ações importantes.

**Critérios de Aceite:**
- [ ] Evento `UsuarioRegistrado(address indexed carteira, string nome, uint256 data)`
- [ ] Evento `RecompensaEnviada(address indexed carteira, uint256 quantidade, uint256 data)`
- [ ] Todos os eventos devem incluir timestamp

### 2.6. RF-06: Segurança
**Descrição:** Implementar validações e controles de segurança.

**Critérios de Aceite:**
- [ ] Usar `require()` para todas as validações
- [ ] Prevenir registros duplicados
- [ ] Prevenir recompensas para usuários inexistentes
- [ ] Validar entradas de dados
- [ ] Implementar controle de acesso se necessário

## 3. Requisitos Não Funcionais

### 3.1. RNF-01: Performance
- [ ] Otimização de gas consumption
- [ ] Operações devem executar em tempo razoável
- [ ] Evitar loops infinitos

### 3.2. RNF-02: Documentação
- [ ] Comentários explicativos no código
- [ ] Documentação sobre conceitos (EVM, gas, etc.)
- [ ] NatSpec para todas as funções públicas

### 3.3. RNF-03: Padrões
- [ ] Seguir padrões Solidity (^0.8.20)
- [ ] Código limpo e legível
- [ ] Nomenclatura consistente

### 3.4. RNF-04: Testabilidade
- [ ] Código deve ser testável
- [ ] Funções puras para validações
- [ ] Eventos para verificação externa

## 4. Especificações Técnicas

### 4.1. Contrato Principal
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RegistroDeUsuariosComRecompensa {
    // Estruturas e variáveis aqui
}
```

### 4.2. Estrutura de Dados Detalhada
```solidity
struct Usuario {
    string nome;
    address carteira;
    uint256 dataRegistro;
    bool ativo;
}

mapping(address => Usuario) public usuarios;
mapping(address => uint256) public saldos;
mapping(address => bool) public usuarioExiste;
```

### 4.3. Assinaturas de Funções
```solidity
function registrarUsuario(string memory _nome) external;
function consultarUsuario(address _carteira) external view returns (Usuario memory);
function recompensarUsuario(address _carteira) external;
```

### 4.4. Eventos
```solidity
event UsuarioRegistrado(address indexed carteira, string nome, uint256 data);
event RecompensaEnviada(address indexed carteira, uint256 quantidade, uint256 data);
```

## 5. Casos de Uso

### 5.1. UC-01: Registro de Novo Usuário
**Ator:** Usuário
**Pré-condições:** Usuário possui carteira Ethereum
**Fluxo Principal:**
1. Usuário chama `registrarUsuario()` com seu nome
2. Contrato valida os dados
3. Contrato armazena informações
4. Contrato emite evento `UsuarioRegistrado`
**Pós-condições:** Usuário registrado no sistema

### 5.2. UC-02: Consulta de Usuário
**Ator:** Qualquer endereço
**Pré-condições:** Usuário existe no sistema
**Fluxo Principal:**
1. Chamada da função `consultarUsuario()`
2. Contrato retorna informações do usuário
**Pós-condições:** Informações do usuário obtidas

### 5.3. UC-03: Recompensa de Usuário
**Ator:** Administrador/Sistema
**Pré-condições:** Usuário existe e está ativo
**Fluxo Principal:**
1. Chamada da função `recompensarUsuario()`
2. Contrato valida usuário
3. Contrato adiciona tokens ao saldo
4. Contrato emite evento `RecompensaEnviada`
**Pós-condições:** Usuário recebe recompensa

## 6. Regras de Negócio

### 6.1. RN-01: Unicidade de Usuário
- Cada endereço Ethereum pode registrar apenas uma vez
- Não permitido alterar nome após registro

### 6.2. RN-02: Recompensas
- Apenas usuários ativos podem receber recompensas
- Valor da recompensa deve ser definido no contrato
- Recompensas são cumulativas

### 6.3. RN-03: Validações
- Nome não pode ser vazio ou apenas espaços
- Endereço zero não pode registrar
- Usuário inativo não pode receber recompensas

## 7. Critérios de Aceite Gerais

### 7.1. Funcionalidade
- [ ] Todos os requisitos funcionais implementados
- [ ] Sempre que possível, use o `require()` para validações
- [ ] Evite registros duplicados

### 7.2. Qualidade
- [ ] Código compilável sem erros
- [ ] Sem warnings de compilador
- [ ] Código bem documentado

### 7.3. Segurança
- [ ] Sem vulnerabilidades conhecidas
- [ ] Validações adequadas
- [ ] Controle de acesso implementado

## 8. Entrega

### 8.1. Artefatos Obrigatórios
- [ ] Arquivo `.sol` com o contrato completo
- [ ] Nome do arquivo: `nome_sobrenome_smartcontract.sol`
- [ ] Comentários explicativos
- [ ] Caso de uso real descrito

### 8.2. Documentação
- [ ] Comentários sobre gas e EVM
- [ ] Explicação de diferenças para contratos tradicionais
- [ ] Descrição de caso de uso real

## 9. Testes

### 9.1. Testes Unitários
- [ ] Teste de registro de usuário
- [ ] Teste de consulta de usuário
- [ ] Teste de recompensa
- [ ] Teste de validações

### 9.2. Testes de Integração
- [ ] Deploy em testnet
- [ ] Interação via MetaMask
- [ ] Verificação de eventos

## 10. Implantação

### 10.1. Ambiente
- **Rede:** Sepolia Testnet
- **Ferramenta:** Hardhat ou Remix
- **Versão Solidity:** ^0.8.20

### 10.2. Passos
1. Compilar contrato
2. Deploy em Sepolia
3. Verificar no Etherscan
4. Testar funcionalidades

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10b981,50:1a56db,100:0f172a&height=120&section=footer" width="100%" alt="Footer"/>
</p>

---
**Resumo:** Documento completo de requisitos para o desenvolvimento do Smart Contract de Registro e Recompensa, com especificações funcionais, técnicas e critérios de aceite.
**Data de Criação:** 2026-04-06
**Autor:** Sistema de Documentação
**Versão:** 1.0
**Última Atualização:** 2026-04-06
**Atualizado por:** Sistema de Documentação
**Histórico de Alterações:**
- 2026-04-06 - Criado por Sistema de Documentação - Versão inicial completa - Versão 1.0
