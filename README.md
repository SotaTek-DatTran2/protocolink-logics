# @protocolink/logics

[![Lint](https://github.com/dinngo/protocolink-logics/actions/workflows/lint.yml/badge.svg)](https://github.com/dinngo/protocolink-logics/actions/workflows/lint.yml)
[![Unit Test](https://github.com/dinngo/protocolink-logics/actions/workflows/unit-test.yml/badge.svg)](https://github.com/dinngo/protocolink-logics/actions/workflows/unit-test.yml)
[![E2E Latest Block](https://github.com/dinngo/protocolink-logics/actions/workflows/e2e-test-latest.yml/badge.svg)](https://github.com/dinngo/protocolink-logics/actions/workflows/e2e-test-latest.yml)
[![E2E Pinned Block](https://github.com/dinngo/protocolink-logics/actions/workflows/e2e-test-mainnet-pb.yml/badge.svg)](https://github.com/dinngo/protocolink-logics/actions/workflows/e2e-test-mainnet-pb.yml)
[![E2E OP Pinned Block](https://github.com/dinngo/protocolink-logics/actions/workflows/e2e-test-optimism-pb.yml/badge.svg)](https://github.com/dinngo/protocolink-logics/actions/workflows/e2e-test-optimism-pb.yml)

An SDK that build protocol logics for Protocolink

## How to contribute?

### Initial Setup

1. Fork this repository.
2. Set up your development environment and install the required dependencies.

### Contribution Steps

1. **Create a New Logic:**

- Add a new folder under `src/logics` named after the protocol (protocolId), using Hyphenation format.
- Create a new logic file under `src/logics/{protocolId}`, named with the action name (logicId). Prefix it with `logic.` and use Hyphenation format. The file name should be `logic.{logicId}.ts`.

2. **Implement the Logic:**

- Implement the Logic class in the logic file using PascalCase. Append `Logic` to the action name.
- Extend the `core.Logic` class.
- Implement the following interfaces based on the requirements:
  - `core.LogicTokenListInterface`: The tokens list function.
  - `core.LogicOracleInterface`: The quotation function.
  - `core.LogicBuilderInterface`: The txdata encode function for interacting with contracts.

**Example:**

```typescript
class LogicExampleLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface {
  // Your implementation here
}
```

3. **Reference Examples:**

- Explore reference examples for different categories:
  - Lending: [Aave V3](src/logics/aave-v2/), [Compound V3](src/logics/comopound-v3/)
  - Swap: [Uniswap V3](src/logics/uniswap-v3/), [ParaSwap V5](src/logics/paraswap-v5/)
  - FlashLoan: [Aave V3](src/logics/aave-v3/), [Balancer V2](src/logics/balancer-v2/)
- More: [GO](src/logics/)

4. **Unit Testing:**

- Write tests that won't fail based on block number increments.
- Test files are in the same path as the logic files, named `logic.{logicId}.test.ts`.
- Write tests for functions like `getTokenList()` and `build()` as needed.

5. **Integration Testing:**

- Write tests that interact with the Router contract in real time.
- Test files are in `test/logics/{protocolId}/`, named `{logicId}.test.ts`.
- Utilize Logic's quotation functions to generate Logic Data for contract interactions.
- Verify transaction success and expected changes in user asset balances.

6. **Submit a Pull Request (PR)**:

- Use the [PR template](PULL_REQUEST_TEMPLATE.md) for PR content. Fill in the template and submit the PR.
- Enable "Allow edits by maintainers" when creating the PR.
- If your PR isn't merged promptly, feel free to ask for assistance on our Discord.

### Get Involved and Learn More

- Discord: [Join Our Community](https://discord.furucombo.app/)

## CLI

- Install the required dependencies

  ```sh
  yarn install
  ```

- Generate protocol's abi TypeScript classes

  ```sh
  # - abi files: src/{protocol}/abis/*.json
  # - contracts dir: src/{protocol}/contracts
  yarn cli typechain
  ```

- Run protocol's tests

  ```sh
  yarn cli test
  ```

- Run protocol's script

  ```sh
  yarn cli script
  ```

## Hardhat e2e testing

```sh
yarn hardhat test [test file]
```

## Install

Install the package via `npm`:

```sh
npm install --save-dev @protocolink/logics
```

or `yarn`:

```sh
yarn add --dev @protocolink/logics
```

## Contribute to BEX Berachain
1. Append the following JSON existing array in **node_modules/@protocolink/common/dist/networks/data.json**

```json
{
        "id": "berachain",
        "chainId": 80084,
        "name": "Avalanche",
        "explorerUrl": "https://snowtrace.io/",
        "rpcUrl": "https://bartio.rpc.berachain.com/",
        "nativeToken": {
            "chainId": 80084,
            "address": "0x0000000000000000000000000000000000000000",
            "decimals": 18,
            "symbol": "BERA",
            "name": "Berachain Token",
            "logoUri": "https://artio-static-asset-public.s3.ap-southeast-1.amazonaws.com/assets/bera.png"
        },
        "wrappedNativeToken": {
            "chainId": 80084,
            "address": "0x7507c1dc16935B82698e4C63f2746A2fCf994dF8",
            "decimals": 18,
            "symbol": "WBERA",
            "name": "Wrapped Berachain Token",
            "logoUri":"https://artio-static-asset-public.s3.ap-southeast-1.amazonaws.com/assets/wbera.png"
        },
        "multicall3Address": ""
    }

  ```
2. Add Berachain to chainId && networkId in **node_modules/@protocolink/common/dist/networks/index.d.ts**

  Those enums should be:
  ```typescript
export declare enum ChainId {
    mainnet = 1,
    optimism = 10,
    bnb = 56,
    gnosis = 100,
    polygon = 137,
    zksync = 324,
    metis = 1088,
    polygonZkevm = 1101,
    base = 8453,
    iota = 8822,
    arbitrum = 42161,
    avalanche = 43114,
    berachain = 80084
}
export declare enum NetworkId {
    mainnet = "mainnet",
    optimism = "optimism",
    bnb = "bnb",
    gnosis = "gnosis",
    polygon = "polygon",
    zksync = "zksync",
    metis = "metis",
    polygonZkevm = "polygonZkevm",
    base = "base",
    iota = "iota",
    arbitrum = "arbitrum",
    avalanche = "avalanche",
    berachain = "berachain"
}
  ```

3. Run test with Hardhat
  
```sh 
npx hardhat test src/logics/bex/logic.swap-token.test.ts 
```