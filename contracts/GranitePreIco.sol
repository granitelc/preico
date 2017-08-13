pragma solidity ^0.4.11;

library SafeMath {
  function mul(uint a, uint b) internal returns (uint) {
    uint c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }
  function div(uint a, uint b) internal returns (uint) {
    assert(b > 0);
    uint c = a / b;
    assert(a == b * c + a % b);
    return c;
  }
  function sub(uint a, uint b) internal returns (uint) {
    assert(b <= a);
    return a - b;
  }
  function add(uint a, uint b) internal returns (uint) {
    uint c = a + b;
    assert(c >= a);
    return c;
  }
  function max64(uint64 a, uint64 b) internal constant returns (uint64) {
    return a >= b ? a : b;
  }
  function min64(uint64 a, uint64 b) internal constant returns (uint64) {
    return a < b ? a : b;
  }
  function max256(uint256 a, uint256 b) internal constant returns (uint256) {
    return a >= b ? a : b;
  }
  function min256(uint256 a, uint256 b) internal constant returns (uint256) {
    return a < b ? a : b;
  }
}

contract Ownable {
    address public owner;
    function Ownable() {
        owner = msg.sender;
    }
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    function transferOwnership(address newOwner) onlyOwner {
        if (newOwner != address(0)) {
            owner = newOwner;
        }
    }
}

contract GranitePreICO is Ownable {
    using SafeMath for uint;
    string public constant name = "Granite Learning Coin";
    string public constant symbol = "GLC";
    uint public coinPrice = 10 finney;
    uint public bonus = 50;
    uint public decimals = 18;
    uint public totalSupply = 0;
    bool public isActive = true;
    
    mapping(address => uint256) balances;

    event Paid(address indexed from, uint value);

    function() payable {
        receiveETH();
    }

    function receiveETH() internal {
        require(isActive); // can receive ETH only if pre-ICO is active

        uint coinsCount = msg.value.div(coinPrice); // counts ammount
        coinsCount = coinsCount.add(coinsCount.div(100).mul(bonus)); 

        balances[msg.sender] += coinsCount;
        totalSupply += coinsCount;

        Paid(msg.sender, coinsCount);
    }

    function balanceOf(address _addr) constant returns(uint256)
    {
        return balances[_addr];
    }

    function setCoinPrice(uint _value) onlyOwner {
        require(_value > 0);
        coinPrice = _value;
    }

    function setBonus(uint _value) onlyOwner {
        require(_value >= 0 && _value <= 100);
        bonus = _value;
    }

    function setActive(bool _value) onlyOwner {
        isActive = _value;
    }

    function drain() onlyOwner {
        msg.sender.transfer(this.balance);
    }
 }
