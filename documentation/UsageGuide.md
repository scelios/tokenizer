# Full Usage and Demonstration Guide

This document provides a comprehensive guide to understanding, deploying, and interacting with the `Chaos42` token and `SmartWallet` contracts.

## 1. Contract Overview

### `Chaos42.sol`
This is an ERC20 token with the following properties:
- **Name**: Chaos42
- **Symbol**: K42
- **Decimals**: 0 (meaning the token is not divisible)
- **Total Supply**: 1,000,000 (fixed cap)

The contract uses OpenZeppelin's `Ownable` to restrict sensitive functions (like `mint`) to the contract owner and `ERC20Capped` to enforce the maximum supply. The entire initial supply is minted to the address that deploys the contract.

### `SmartWallet.sol`
This is a multi-signature wallet designed to hold and manage ERC20 tokens securely.
- **Security Model**: Funds cannot be moved by a single person. A transfer must first be proposed via `requestTransfer`. Then, a majority of registered "signers" must approve the transfer by calling `approveTransfer`.
- **Owner Privileges**: The owner of the `SmartWallet` contract (the address that deployed it) has the exclusive right to add and remove authorized signers, but cannot bypass the multi-signature requirement for transfers.

## 2. Development and Testing in Remix

The project is designed to be run in the Remix IDE.

### Compiling
1. Open the **Solidity Compiler** plugin in Remix.
2. Select `code/Chaos42.sol` and compile it. Ensure the compiler version is `^0.8.20`.
3. Select `code/SmartWallet.sol` and compile it.

### Running Tests
1. Go to the **Solidity Unit Testing** plugin.
2. Select `tests/Chaos42_test.sol` and click "Run" to test the token contract.
3. Select `tests/SmartWallet_test.sol` and click "Run" to test the multi-sig wallet functionality.

## 3. Deployment & Interaction on a Public Testnet (Sepolia)

This guide explains how to manually deploy and demonstrate the full workflow using MetaMask.

### Prerequisites
1. **MetaMask**: A web3 wallet browser extension.
2. **Sepolia ETH**: Free testnet Ether obtained from a faucet (e.g., `sepoliafaucet.com`).
3. **Multiple Accounts**: Create at least 4 accounts in MetaMask: `Owner`, `Signer1`, `Signer2`, and `Recipient`.

### Step-by-Step Guide

1.  **Connect Remix to MetaMask**:
    *   In Remix, navigate to the "Deploy & Run Transactions" tab.
    *   Set the "ENVIRONMENT" dropdown to **"Injected Provider - MetaMask"**.
    *   Approve the connection in the MetaMask pop-up and ensure your network is set to **Sepolia**.

2.  **Deploy `Chaos42` (as Owner)**:
    *   Ensure your `Owner` account is active in MetaMask.
    *   In Remix, select the `Chaos42` contract and click **Deploy**. Confirm the transaction.
    *   Copy the deployed contract address.

3.  **Deploy `SmartWallet` (as Owner)**:
    *   In Remix, select the `SmartWallet` contract.
    *   For the `_tokenAddress` constructor parameter, paste the deployed `Chaos42` address.
    *   For the `_initialSigners` parameter, provide the addresses of your `Signer1` and `Signer2` accounts in an array, e.g., `["0xSigner1Address...", "0xSigner2Address..."]`.
    *   Click **Deploy** and confirm the transaction.
    *   Copy the deployed `SmartWallet` address.

4.  **View Tokens in MetaMask**:
    *   Open MetaMask, click the "Tokens" tab, and select "Import tokens".
    *   Paste the `Chaos42` contract address. The symbol (K42) and decimals (0) should auto-fill.
    *   After importing, you will see your 1,000,000 K42 balance in your `Owner` account.

5.  **Fund the SmartWallet**:
    *   In Remix, expand your deployed `Chaos42` contract instance.
    *   Use the `transfer` function to send tokens (e.g., `1000`) to your deployed `SmartWallet` address. Confirm in MetaMask.

6.  **Execute a Multi-Sig Transfer**:
    *   **Request**: Using any account, call `requestTransfer` on the `SmartWallet` instance. Specify the `Recipient` address and an amount (e.g., `100`). Copy the `transferID` from the transaction logs in the Remix console.
    *   **Approve (Signer 1)**: In MetaMask, switch to your `Signer1` account. In Remix, call `approveTransfer` on the `SmartWallet`, pasting in the `transferID`. Confirm the transaction.
    *   **Approve (Signer 2)**: In MetaMask, switch to your `Signer2` account. In Remix, call `approveTransfer` again with the same `transferID`. Confirm. This second approval meets the majority and automatically executes the transfer.

7.  **Verify the Outcome**:
    *   You can check the `Recipient`'s token balance by calling `balanceOf` on the `Chaos42` contract.
    *   Alternatively, search for the `SmartWallet` and `Recipient` addresses on a block explorer like [Sepolia Etherscan](https://sepolia.etherscan.io/) to view their token balances publicly.

## 4. Automated Demonstration Script

For quick demonstrations within the Remix VM, the `deployment/demonstrate_workflow.ts` script automates the entire process described above. To use it:

1. In Remix, set the "ENVIRONMENT" to **"Remix VM"**.
2. Right-click the `deployment/demonstrate_workflow.ts` file in the explorer and select "Run".
3. Observe the output in the Remix console.

This provides a complete, verifiable, and secure system for managing a custom digital asset on the blockchain.
