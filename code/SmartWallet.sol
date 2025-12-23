// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SmartWallet is Ownable {
    struct Transfer {
        address to;
        uint256 value;
        uint256 approvals;
        bool executed;
        mapping(address => bool) approvedBy;
    }

    IERC20 public token;
    mapping (bytes32 => Transfer) private transfers;
    mapping (address => bool) public signers;
    address[] public signerList;
    mapping (address => uint256) private nonces;
    
    event TransferRequested(bytes32 indexed transferID, address indexed to, uint256 value);
    event TransferExecuted(bytes32 indexed transferID, address indexed to, uint256 value);
    event TransferApproved(bytes32 indexed transferID, address indexed approver);
    event SignerAdded(address indexed newSigner);
    event SignerRemoved(address indexed oldSigner);

    modifier onlySigner(){
        require(signers[msg.sender], "Sender is not authorized");
        _;
    }   

    constructor (address _tokenAddress, address[] memory _initialSigners) Ownable(msg.sender){
        token = IERC20(_tokenAddress);
        for (uint256 i = 0; i < _initialSigners.length; i++){
            signers[_initialSigners[i]] = true;
            signerList.push(_initialSigners[i]);
        }
    }

    function getBalance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function requestTransfer(address to, uint256 value) public returns (bytes32 transferId) {
        require(to != address(0), "Invalid recipient");
        require(value > 0, "Transfer value must be greater than 0");

        nonces[msg.sender]++;
        transferId = keccak256(abi.encodePacked(msg.sender, to, value, nonces[msg.sender]));
        
        Transfer storage newTransfer = transfers[transferId];
        require(newTransfer.to == address(0), "Transfer with this ID already exists");
        newTransfer.to = to;
        newTransfer.value = value;
        newTransfer.approvals = 0;
        newTransfer.executed = false;

        emit TransferRequested(transferId, to, value);
    }

    function approveTransfer(bytes32 transferId) public onlySigner {
        Transfer storage transfer = transfers[transferId];
        require(transfer.to != address(0), "Transfer does not exist");
        require(!transfer.approvedBy[msg.sender], "Transfer already approved by this signer");
        require(!transfer.executed, "Transfer already executed");

        transfer.approvedBy[msg.sender] = true;
        transfer.approvals += 1;

        emit TransferApproved(transferId, msg.sender);

        if (transfer.approvals > (signerList.length / 2)) {
            executeTransfer(transferId);
        }
    }

    function executeTransfer(bytes32 transferId) internal {
        Transfer storage transfer = transfers[transferId];
        require(transfer.to != address(0), "Transfer does not exist");
        require(transfer.approvals > (signerList.length / 2), "Not enough approvals");
        require(!transfer.executed, "Transfer already executed");
        
        uint256 walletBalance = token.balanceOf(address(this));
        require(walletBalance >= transfer.value, "Insufficient balance in wallet");

        transfer.executed = true;

        require(token.transfer(transfer.to, transfer.value), "Transfer failed");
        emit TransferExecuted(transferId, transfer.to, transfer.value);
    }

    function getSignerCount() public view returns (uint256) {
        return signerList.length;
    }

    function ownerApproveTransfer(bytes32 transferId, address signer) public onlyOwner {
        Transfer storage transfer = transfers[transferId];
        require(transfer.to != address(0), "Transfer does not exist");
        require(signers[signer], "Signer does not exist");
        require(!transfer.approvedBy[signer], "Transfer already approved by this signer");
        require(!transfer.executed, "Transfer already executed");

        transfer.approvedBy[signer] = true;
        transfer.approvals += 1;

        emit TransferApproved(transferId, signer);

        if (transfer.approvals > (signerList.length / 2)) {
            executeTransfer(transferId);
        }
    }

    function addSigner(address _newSigner) public onlyOwner {
        require(_newSigner != address(0), "Signer cannot be the zero address");
        require(!signers[_newSigner], "Signer already exists");

        signers[_newSigner] = true;
        signerList.push(_newSigner);
        emit SignerAdded(_newSigner);
    }

    function removeSigner(address _oldSigner) public onlyOwner {
        require(_oldSigner != address(0), "Signer cannot be the zero address");
        require(signers[_oldSigner], "Signer does not exist");
        require(signerList.length > 1, "Cannot remove the last signer");

        signers[_oldSigner] = false;

        for (uint256 i = 0; i < signerList.length; i++) {
            if (signerList[i] == _oldSigner) {
                signerList[i] = signerList[signerList.length - 1];
                signerList.pop();
                break;
            }
        }
        emit SignerRemoved(_oldSigner);
    }
}
