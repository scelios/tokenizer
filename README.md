# Tokenizer Project: Chaos42 (K42) Token & SmartWallet

This repository contains the source code and documentation for the "Tokenizer" project, which includes an ERC20 token named `Chaos42` (K42) and a multi-signature wallet, `SmartWallet`, to securely manage it.

The project has been deployed and verified on the **Sepolia Testnet**.

## Deployed Contract Addresses (Sepolia)

- **Chaos42 (K42) Token:** `0xDA0bab807633f07f013f94DD0E6A4F96F8742B53`
- **SmartWallet:** `0x358AA13c52544ECCEF6B0ADD0f801012ADAD5eE3`

You can view the contracts on a block explorer like [Sepolia Etherscan](https://sepolia.etherscan.io/).

## Project Overview

This project fulfills both the mandatory and bonus requirements of the subject.

1.  **`Chaos42.sol`**: An ERC20-compliant token built on the Ethereum blockchain. It is designed with security and standard practices in mind, inheriting from OpenZeppelin's battle-tested contracts.
2.  **`SmartWallet.sol`**: A multi-signature wallet that provides enhanced security for managing the `Chaos42` tokens (or any other ERC20 token). It requires a majority of registered signers to approve a transaction before it can be executed, preventing any single point of failure or control.

## Technological Choices

- **Blockchain Platform**: We chose an **EVM-compatible public blockchain (Sepolia Testnet)**. This allows for a realistic deployment and testing environment that mirrors the Ethereum mainnet without incurring any financial cost. It provides robust public infrastructure, including block explorers for verification.

- **Token Standard**: **ERC20** is the definitive standard for fungible tokens on the Ethereum network. Adhering to this standard ensures our `Chaos42` token is compatible with the vast ecosystem of wallets (like MetaMask), decentralized exchanges, and other dApps.

- **Development Language & Environment**:
    - **Solidity**: The premier language for smart contract development on the EVM.
    - **Remix IDE**: Chosen for its integrated, all-in-one environment. It provides a seamless workflow for writing, compiling, deploying, testing, and debugging smart contracts directly in the browser, making it ideal for rapid development and demonstration.

- **Security and Libraries**: To ensure a high level of security and to follow best practices, the project heavily relies on **OpenZeppelin Contracts**. By using `ERC20`, `Ownable`, `ERC20Capped`, and `ERC20Permit`, we build upon a foundation of community-audited and battle-tested code, significantly reducing the risk of common vulnerabilities.

## How It Works

For a detailed guide on compiling, testing, deploying, and interacting with the contracts, please refer to the documentation folder.

- **[Full Usage Guide](./documentation/UsageGuide.md)**

---
This project was developed to meet the requirements of the "Tokenizer" subject, demonstrating proficiency in blockchain technology, smart contract development, and security principles.
