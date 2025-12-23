// SPDX-License-Identifier: MIT
// This script demonstrates the full workflow of the Chaos42 and SmartWallet contracts.
// To run, right-click the file in the Remix file explorer and select "Run".
// It will deploy both contracts, fund the wallet, and execute a multi-signature transfer.

import { ethers } from 'ethers';

// Helper function to get contract artifacts
async function getArtifact(contractName: string) {
    try {
        const artifacts = await remix.call('compiler', 'getCompilationResult');
        const contract = artifacts.data.contracts[contractName][contractName];
        return {
            abi: contract.abi,
            bytecode: '0x' + contract.evm.bytecode.object,
        };
    } catch (e) {
        console.error(`Error getting artifact for ${contractName}:`, e);
        throw e;
    }
}

(async () => {
    console.log('Starting full contract workflow demonstration...');

    // 1. Setup accounts
    // The 'web3Provider' is a global object injected by Remix
    const provider = new ethers.BrowserProvider(web3Provider);
    const accounts = await provider.listAccounts();
    const owner = accounts[0];
    const signer1 = accounts[1];
    const signer2 = accounts[2];
    const signer3 = accounts[3];
    const recipient = accounts[4];
    const requestor = accounts[5]; // The account that will request the transfer

    if (accounts.length < 6) {
        console.error('Please make sure you have at least 6 accounts available in your Remix EOA list.');
        return;
    }

    console.log('Accounts setup:');
    console.log('  - Owner/Deployer:', await owner.getAddress());
    console.log('  - Signer 1:', await signer1.getAddress());
    console.log('  - Signer 2:', await signer2.getAddress());
    console.log('  - Signer 3:', await signer3.getAddress());
    console.log('  - Recipient:', await recipient.getAddress());
    console.log('  - Requestor:', await requestor.getAddress());
    console.log('---------------------------------');

    try {
        // 2. Deploy Chaos42 contract
        console.log('Deploying Chaos42 token contract...');
        const chaos42Artifact = await getArtifact('Chaos42');
        const chaos42Factory = new ethers.ContractFactory(chaos42Artifact.abi, chaos42Artifact.bytecode, owner);
        const chaos42 = await chaos42Factory.deploy();
        await chaos42.waitForDeployment();
        const chaos42Address = await chaos42.getAddress();
        console.log(`Chaos42 deployed at: ${chaos42Address}`);
        console.log('---------------------------------');

        // 3. Deploy SmartWallet contract
        console.log('Deploying SmartWallet contract...');
        const initialSigners = [await signer1.getAddress(), await signer2.getAddress(), await signer3.getAddress()];
        const smartWalletArtifact = await getArtifact('SmartWallet');
        const smartWalletFactory = new ethers.ContractFactory(smartWalletArtifact.abi, smartWalletArtifact.bytecode, owner);
        const smartWallet = await smartWalletFactory.deploy(chaos42Address, initialSigners);
        await smartWallet.waitForDeployment();
        const smartWalletAddress = await smartWallet.getAddress();
        console.log(`SmartWallet deployed at: ${smartWalletAddress}`);
        console.log('Initial signers:', initialSigners.join(', '));
        console.log('---------------------------------');

        // 4. Fund the SmartWallet with Chaos42 tokens
        const fundAmount = 1000n;
        console.log(`Funding SmartWallet with ${fundAmount} K42 tokens...`);
        const fundTx = await chaos42.connect(owner).transfer(smartWalletAddress, fundAmount);
        await fundTx.wait();
        const walletBalance = await chaos42.balanceOf(smartWalletAddress);
        console.log(`SmartWallet balance is now: ${walletBalance.toString()} K42`);
        console.log('---------------------------------');
        
        // 5. Request a transfer from the SmartWallet
        const transferAmount = 100n;
        const recipientAddress = await recipient.getAddress();
        console.log(`Account ${await requestor.getAddress()} is requesting a transfer of ${transferAmount} K42 to ${recipientAddress}...`);
        const requestTx = await smartWallet.connect(requestor).requestTransfer(recipientAddress, transferAmount);
        const requestReceipt = await requestTx.wait();
        
        // Find the TransferRequested event to get the transferId
        const eventLog = requestReceipt.logs.find(log => {
             try {
                const parsedLog = smartWallet.interface.parseLog(log);
                return parsedLog?.name === 'TransferRequested';
            } catch (error) {
                return false;
            }
        });
        
        if (!eventLog) {
            throw new Error('TransferRequested event not found!');
        }
        const parsedEvent = smartWallet.interface.parseLog(eventLog);
        const transferId = parsedEvent.args.transferID;
        console.log(`Transfer request sent. TransferID: ${transferId}`);
        console.log('---------------------------------');

        // 6. Approve the transfer with two signers
        console.log('Approving transfer...');
        
        // First approval
        console.log(`Signer 1 (${await signer1.getAddress()}) is approving...`);
        const approveTx1 = await smartWallet.connect(signer1).approveTransfer(transferId);
        await approveTx1.wait();
        console.log('First approval successful. Transfer not yet executed.');

        let recipientBalance = await chaos42.balanceOf(recipientAddress);
        console.log(`Recipient balance is still: ${recipientBalance.toString()} K42`);

        // Second approval (this should trigger the execution)
        console.log(`Signer 2 (${await signer2.getAddress()}) is approving...`);
        const approveTx2 = await smartWallet.connect(signer2).approveTransfer(transferId);
        await approveTx2.wait();
        console.log('Second approval successful. Transfer should now be executed.');
        console.log('---------------------------------');
        
        // 7. Verify the final balances
        console.log('Verifying final balances...');
        const finalWalletBalance = await chaos42.balanceOf(smartWalletAddress);
        const finalRecipientBalance = await chaos42.balanceOf(recipientAddress);

        console.log(`Final SmartWallet balance: ${finalWalletBalance.toString()} K42`);
        console.log(`Final Recipient balance: ${finalRecipientBalance.toString()} K42`);

        if (finalRecipientBalance === transferAmount) {
            console.log('\n✅ Workflow demonstration successful!');
        } else {
            console.error('\n❌ Workflow demonstration failed! Recipient balance is incorrect.');
        }

    } catch (e) {
        console.error('An error occurred during the workflow demonstration:', e);
    }
})();
