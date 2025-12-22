# GEMINI Project Context: Solidity Token & Multisig Wallet

This document provides context for the Gemini AI agent to understand and assist with this project.

## Project Overview

This is a Solidity smart contract project developed in what appears to be a Remix IDE environment. The project consists of two main contracts:

1.  **`Chaos42.sol`**: An ERC20 token that adheres to the project subject requirements. It is built using OpenZeppelin's secure contracts (`ERC20`, `Ownable`, `ERC20Permit`, `ERC20Capped`).
    *   **Name**: Chaos42
    *   **Symbol**: K42
    *   **Decimals**: 0
    *   **Total Supply**: 1,000,000 (capped)

2.  **`SmartWallet.sol`**: A multi-signature wallet used to securely manage the `Chaos42` token (or any other ERC20 token). It requires a majority of registered signers to approve a transaction before it can be executed. The contract owner holds the privilege to add or remove signers.

## Building and Running

The project seems to be configured for use within the **Remix IDE**.

### Compilation

*   **Action**: Select a `.sol` file in the `code/` directory.
*   **Tool**: Use the "Solidity Compiler" plugin in Remix.
*   **Configuration**: Ensure the compiler version is set to `0.8.20` or compatible.
*   **Outcome**: Successful compilation generates JSON artifacts in the `artifacts/` directory. These artifacts are required for testing and deployment.

### Testing

*   **Action**: Select a `_test.sol` file from the `tests/` directory.
*   **Tool**: Use the "Solidity Unit Testing" plugin in Remix.
*   **Execution**: Click the "Run" button in the plugin to execute the tests against the contracts. The tests use the `remix_tests.sol` library.

### Deployment

*   **Action**: Select a deployment script from the `deployment/` directory (e.g., `deploy_with_ethers.ts`).
*   **Tool**: In Remix, right-click the script in the File Explorer and select "Run" (or use a similar execution method for TypeScript/JavaScript files).
*   **Dependencies**: The scripts rely on the global `remix` and `web3Provider` objects provided by the Remix environment. They deploy the contract specified in the script (e.g., `Chaos42`).

**Example Deployment Command (within Remix):**
```
// Right-click on 'deployment/deploy_with_ethers.ts' and select 'Run'
```

## Development Conventions

*   **Contract Location**: All primary Solidity source code resides in the `code/` directory.
*   **Testing Framework**: Tests are written in Solidity and use the `remix_tests.sol` and `remix_accounts.sol` libraries. Test files are located in the `tests/` directory.
*   **Deployment Scripts**: TypeScript scripts for deployment are located in the `deployment/` folder.
*   **Code Style**: Code formatting is managed by Prettier. The configuration can be found in `.prettierrc.json`. For Solidity files, the print width is 80 characters and indentation is 4 spaces.
*   **Security**: The project prioritizes security by using OpenZeppelin's battle-tested contract library.
