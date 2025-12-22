// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

contract Chaos42 is ERC20, ERC20Permit, Ownable, ERC20Capped {
    constructor() ERC20("Chaos42", "K42") ERC20Permit("Chaos42") Ownable(msg.sender) ERC20Capped(1000000 * (10 ** 0)) {
        _mint(msg.sender, 1000000 * (10 ** decimals()));
    }

    function decimals() public pure override returns (uint8) {
        return 0;
    }

    function mint(address account, uint256 amount) public onlyOwner {
        require(account != address(0), "ERC20: mint to the zero address");
        _mint(account, amount);
    }

    function _update(address from, address to, uint256 value) internal virtual override(ERC20, ERC20Capped) {
        super._update(from, to, value);
    }
}