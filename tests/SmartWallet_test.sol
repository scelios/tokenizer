// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "remix_tests.sol";
import "remix_accounts.sol";
import "../code/SmartWallet.sol";
import "../code/Chaos42.sol";

contract SmartWalletTest {

    Chaos42 public token;
    SmartWallet public wallet;
    address owner;
    address signer1;
    address signer2;
    address signer3;
    address recipient;
    address nonSigner;
    bytes32 public transferId;

    function beforeAll() public {
        owner = TestsAccounts.getAccount(0);
        signer1 = TestsAccounts.getAccount(1);
        signer2 = TestsAccounts.getAccount(2);
        signer3 = TestsAccounts.getAccount(3);
        recipient = TestsAccounts.getAccount(4);
        nonSigner = TestsAccounts.getAccount(5);

        token = new Chaos42();
        
        address[] memory initialSigners = new address[](3);
        initialSigners[0] = signer1;
        initialSigners[1] = signer2;
        initialSigners[2] = signer3;

        wallet = new SmartWallet(address(token), initialSigners);

        // Fund the smart wallet with tokens for testing
        token.transfer(address(wallet), 1000);
    }

    function testInitialState() public {
        Assert.equal(wallet.owner(), address(this), "Owner is not the deployer");
        Assert.equal(wallet.getSignerCount(), 3, "Initial signer count is incorrect");
        Assert.ok(wallet.signers(signer1), "Signer 1 is not registered");
        Assert.ok(wallet.signers(signer2), "Signer 2 is not registered");
        Assert.ok(wallet.signers(signer3), "Signer 3 is not registered");
        Assert.equal(wallet.getBalance(), 1000, "Initial wallet balance is incorrect");
    }

    /// #sender: owner
    function testSignerManagement() public {
        address newSigner = TestsAccounts.getAccount(6);
        
        // Add a new signer
        wallet.addSigner(newSigner);
        Assert.equal(wallet.getSignerCount(), 4, "Signer count should be 4 after adding");
        Assert.ok(wallet.signers(newSigner), "New signer was not added correctly");

        // Remove a signer
        wallet.removeSigner(signer3);
        Assert.equal(wallet.getSignerCount(), 3, "Signer count should be 3 after removing");
        Assert.ok(!wallet.signers(signer3), "Signer 3 was not removed correctly");
    }

    /// #sender: nonSigner
    function testRequestTransfer() public {
        uint256 transferAmount = 100;
        transferId = wallet.requestTransfer(recipient, transferAmount);
        Assert.notEqual(transferId, 0, "Transfer request should return a valid ID");
    }

    /// #sender: signer1
    function testApproveTransfer1() public {
        Assert.notEqual(transferId, 0, "Transfer ID should be set before approving");
        wallet.ownerApproveTransfer(transferId, signer1);
        // After 1 approval, balance should not have changed yet
        Assert.equal(token.balanceOf(recipient), 0, "Recipient balance should be 0 after one approval");
    }

    /// #sender: signer2
    function testApproveTransfer2AndExecute() public {
        Assert.notEqual(transferId, 0, "Transfer ID should be set before approving");
        uint256 initialRecipientBalance = token.balanceOf(recipient);
        
        // This second approval (out of 3 total signers) reaches the majority and should trigger the transfer
        wallet.ownerApproveTransfer(transferId, signer2);

        uint256 finalRecipientBalance = token.balanceOf(recipient);
        Assert.equal(finalRecipientBalance, initialRecipientBalance + 100, "Recipient did not receive the tokens");

        uint256 finalWalletBalance = token.balanceOf(address(wallet));
        Assert.equal(finalWalletBalance, 900, "Wallet balance was not updated correctly after transfer");
    }

    /// #sender: nonSigner
    function testSecurityRules() public {
        // Request a new transfer to have a valid ID for this test
        bytes32 localTransferId = wallet.requestTransfer(recipient, 50);

        // Try to approve it as a non-signer (should fail)
        // We use a low-level call to catch the expected revert.
        (bool success, ) = address(wallet).call(abi.encodeWithSignature("approveTransfer(bytes32)", localTransferId));
        Assert.ok(!success, "Non-signer should not be able to approve a transfer");
    }
}