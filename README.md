![visitors](https://visitor-badge.laobi.icu/badge?page_id=ArvoreDosSaberes.Capacitacao_Web3_SmartContracts_Elemental)
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
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,50:1a56db,100:10b981&height=220&section=header&text=Smart%20Contract%20Básico&fontSize=42&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Registro%20de%20Usuários%20com%20Recompensa&descSize=18&descAlignY=55&descColor=94a3b8" width="100%" alt="Smart Contract Básico Header"/>
</p>

## Projeto Final: Desenvolvimento de Smart Contract Básico com Registro e Recompensa

### Objetivo
Desenvolver um Smart Contract básico utilizando Solidity na rede Ethereum que permita o registro de usuários e a distribuição de recompensas em tokens simulados. O contrato deve demonstrar, na prática, o funcionamento de Smart Contracts, incluindo armazenamento de dados, execução de funções, emissão de eventos e validações de segurança.

### Propósito
Consolidar os conhecimentos fundamentais do módulo, incluindo:
- Conceito de Smart Contracts
- Funcionamento da Ethereum Virtual Machine
- Estrutura de contratos
- Funções, variáveis e eventos
- Simulação de token (ERC-20 conceitual)
- Segurança básica
- Gas e execução

## Estrutura do Contrato

### Nome do Contrato
`RegistroDeUsuariosComRecompensa`

### Estrutura Obrigatória

#### 1. Estrutura de Dados
- **Struct** para representar o usuário
- **Mapping** para armazenar usuários

#### 2. Funções Obrigatórias
- `registrarUsuario(string nome)`
- `consultarUsuario(address carteira)`
- `recompensarUsuario(address carteira)`

#### 3. Eventos
- Evento de usuário registrado
- Evento de recompensa enviada

#### 4. Simulação de Token
- Criar controle de saldo com `mapping(address => uint)`
- Implementar função de recompensa

#### 5. Segurança
- Utilizar `require()` para validações
- Evitar registros duplicados

#### 6. Comentários Explicativos
- O que é gas
- Como funciona a EVM
- Diferença para contratos tradicionais

#### 7. Caso de Uso Real
- Descrever um caso de uso real ao final do código

## Critérios de Avaliação

| Critério | Pontuação |
|----------|-----------|
| Estrutura do contrato | 2,0 |
| Implementação das funções | 2,0 |
| Uso de eventos | 1,5 |
| Simulação de token | 1,5 |
| Segurança (validações) | 1,5 |
| Comentários e explicações | 1,5 |
| **Total** | **10 pontos** |

## Instruções para Envio

- Desenvolver o contrato utilizando Solidity
- Implementar todas as funcionalidades obrigatórias
- Comentar o código explicando os conceitos
- Garantir que o contrato esteja funcional no ambiente de desenvolvimento
- Nome do arquivo: `nome_sobrenome_smartcontract.sol`

## Arquitetura do Projeto

```text
contracts/
├── RegistroDeUsuariosComRecompensa.sol – Contrato principal
├── README.md                           – Documentação
├── docs/                               – Documentação adicional
└── scripts/                            – Scripts de deploy e teste
```

## Pré-requisitos

- Node.js >= 18
- MetaMask
- ETH de testnet Sepolia ([faucet](https://sepoliafaucet.com/))
- Conhecimento básico de Solidity

## Setup do Ambiente

```bash
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
npx hardhat init
```

## Compilação

```bash
npx hardhat compile
```

## Deploy em Testnet

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Testes

```bash
npx hardhat test
```

## Casos de Uso

1. **Registro de Usuários**: Plataformas educacionais podem registrar alunos e recompensá-los com tokens por conclusão de cursos
2. **Programas de Fidelidade**: Empresas podem registrar clientes e recompensá-los com pontos/tokens por compras
3. **Sistemas de Gamificação**: Aplicações podem registrar jogadores e recompensá-los por conquistas

## Segurança

- Validação de entrada de dados
- Prevenção de registros duplicados
- Controle de acesso adequado
- Otimização de gas

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10b981,50:1a56db,100:0f172a&height=120&section=footer" width="100%" alt="Footer"/>
</p>

---
**Resumo:** Projeto de Smart Contract básico para registro de usuários com sistema de recompensas em tokens simulados, desenvolvido como atividade final do módulo de Solidity.
**Data de Criação:** 2025-04-06
**Autor:** Bruno (Professor) / Projeto Adaptado
**Versão:** 1.0
**Última Atualização:** 2025-04-06
**Atualizado por:** Sistema de Documentação
**Histórico de Alterações:**
- 2025-04-06 - Criado por Sistema de Documentação - Extração e reformatagem do PDF original - Versão 1.0
# Ethereum_Recompensa
