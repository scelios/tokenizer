// SPDX-License-Identifier: MIT
// This script demonstrates the full workflow of the Chaos42 and SmartWallet contracts.
// To run, right-click the file in the Remix file explorer and select "Run".
// It will deploy both contracts, fund the wallet, and execute a multi-signature transfer.

import { ethers } from 'ethers';
// Import contract artifacts directly to bypass Remix environment issues.
import chaos42Artifact from '../artifacts/Chaos42.json';
import smartWalletArtifact from '../artifacts/SmartWallet.json';

(async () => {
    console.log('Starting full contract workflow demonstration...');

    try {
        // 1. Setup Environment and Accounts
        if (typeof web3Provider === 'undefined') {
            throw new Error('web3Provider is not available. Please ensure you are in a Remix VM or connected wallet environment.');
        }
        console.log('web3Provider is available.');

        console.log('Creating ethers provider (v5 syntax)...');
        const provider = new ethers.providers.Web3Provider(web3Provider);
        console.log('Provider created. Fetching accounts...');

        const addresses = await provider.listAccounts();
        console.log(`Found ${addresses.length} accounts.`);

        if (addresses.length < 6) {
            throw new Error(`Please make sure you have at least 6 accounts. Found: ${addresses.length}`);
        }

        const owner = provider.getSigner(0);
        const signer1 = provider.getSigner(1);
        const signer2 = provider.getSigner(2);
        const signer3 = provider.getSigner(3);
        const recipient = provider.getSigner(4);
        const requestor = provider.getSigner(5);

        console.log('Accounts setup:');
        console.log('  - Owner/Deployer:', await owner.getAddress());
        console.log('  - Signer 1:', await signer1.getAddress());
        console.log('  - Signer 2:', await signer2.getAddress());
        console.log('  - Signer 3:', await signer3.getAddress());
        console.log('  - Recipient:', await recipient.getAddress());
        console.log('  - Requestor:', await requestor.getAddress());
        console.log('---------------------------------');

        // 2. Deploy Chaos42 contract
        // Note: The artifact's bytecode is often an object; we need the 'object' property.
        const chaos42Bytecode = chaos42Artifact.data.bytecode.object;
        const chaos42Factory = new ethers.ContractFactory(chaos42Artifact.abi, chaos42Bytecode, owner);
        console.log('Deploying Chaos42 token contract...');
        const chaos42 = await chaos42Factory.deploy();
        await chaos42.deployed();
        const chaos42Address = chaos42.address;
        console.log(`Chaos42 deployed at: ${chaos42Address}`);
        console.log('---------------------------------');

        // 3. Deploy SmartWallet contract
        const smartWalletBytecode = smartWalletArtifact.data.bytecode.object;
        const smartWalletFactory = new ethers.ContractFactory(smartWalletArtifact.abi, smartWalletBytecode, owner);
        const initialSigners = [await signer1.getAddress(), await signer2.getAddress(), await signer3.getAddress()];
        console.log('Deploying SmartWallet with signers:', initialSigners.join(', '));
        const smartWallet = await smartWalletFactory.deploy(chaos42Address, initialSigners);
        await smartWallet.deployed();
        const smartWalletAddress = smartWallet.address;
        console.log(`SmartWallet deployed at: ${smartWalletAddress}`);
        console.log('---------------------------------');

        // 4. Fund the SmartWallet with Chaos42 tokens
        const fundAmount = ethers.BigNumber.from(1000);
        console.log(`Funding SmartWallet with ${fundAmount.toString()} K42 tokens...`);
        const fundTx = await chaos42.connect(owner).transfer(smartWalletAddress, fundAmount);
        await fundTx.wait();
        const walletBalance = await chaos42.balanceOf(smartWalletAddress);
        console.log(`SmartWallet balance is now: ${walletBalance.toString()} K42`);
        console.log('---------------------------------');
        
        // 5. Request a transfer from the SmartWallet
        const transferAmount = ethers.BigNumber.from(100);
        const recipientAddress = await recipient.getAddress();
        console.log(`Account ${await requestor.getAddress()} is requesting a transfer of ${transferAmount.toString()} K42 to ${recipientAddress}...`);
        const requestTx = await smartWallet.connect(requestor).requestTransfer(recipientAddress, transferAmount);
        const requestReceipt = await requestTx.wait();
        
        // Find the TransferRequested event to get the transferId
        const eventInterface = new ethers.utils.Interface(smartWalletArtifact.abi);
        const eventLog = requestReceipt.logs.find(log => {
             try {
                const parsedLog = eventInterface.parseLog(log);
                return parsedLog?.name === 'TransferRequested';
            } catch (error) {
                return false;
            }
        });
        
        if (!eventLog) {
            throw new Error('TransferRequested event not found!');
        }
        const parsedEvent = eventInterface.parseLog(eventLog);
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

        if (finalRecipientBalance.eq(transferAmount)) {
            console.log('\n✅ Workflow demonstration successful!');
        } else {
            console.error('\n❌ Workflow demonstration failed! Recipient balance is incorrect.');
        }

    } catch (e) {
        console.error('An error occurred during the workflow demonstration:', e);
    }
})();
