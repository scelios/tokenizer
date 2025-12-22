// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "remix_tests.sol";
import "../code/Chaos42.sol";

contract Chaos42Test {
    Chaos42 token;

    function beforeAll() public {
        token = new Chaos42();
    }

    function testTokenInitialValues() public {
        Assert.equal(token.name(), "Chaos42", "token name did not match");
        Assert.equal(token.symbol(), "K42", "token symbol did not match");
        Assert.equal(token.decimals(), 0, "token decimals did not match");
        Assert.equal(token.totalSupply(), 1000000, "initial token supply did not match");
    }
}