pragma solidity ^0.4.18;

library SafeMath {
  function mul(uint a, uint b) internal pure returns (uint) 
  {
    uint c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }
  
  function div(uint a, uint b) internal pure returns (uint) 
  {
    assert(b > 0);
    uint c = a / b;
    assert(a == b * c + a % b);
    return c;
  }
  function sub(uint a, uint b) internal pure returns (uint) {
    assert(b <= a);
    return a - b;
  }
  function add(uint a, uint b) internal pure returns (uint) {
    uint c = a + b;
    assert(c >= a);
    return c;
  }
  function max64(uint64 a, uint64 b) internal pure returns (uint64) {
    return a >= b ? a : b;
  }
  function min64(uint64 a, uint64 b) internal pure returns (uint64) {
    return a < b ? a : b;
  }
  function max256(uint256 a, uint256 b) internal pure returns (uint256) {
    return a >= b ? a : b;
  }
  function min256(uint256 a, uint256 b) internal pure returns (uint256) {
    return a < b ? a : b;
  }
}

contract Ownable {
    address public owner;
    function Ownable() public {
        owner = msg.sender;
    }
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    function  transferOwnership(address newOwner) onlyOwner public {
        if (newOwner != address(0)) {
            owner = newOwner;
        }
    }
}

contract GranitePreICO is Ownable {
    using SafeMath for uint;
    string public constant name = "Pre-ICO Granite Learning Coin";
    string public constant symbol = "PGLC";
    uint public constant coinPrice = 25 * 10 ** 14;
    uint public constant bonus = 50;
    uint public constant decimals = 18;
    uint public minAmmount = 10 ** 18;
    uint public totalSupply = 0;
    bool public isActive = true;
    uint public investorsCount = 0;
    uint public constant hardCap = 250000 * 10 ** 18;

    mapping(address => uint256) balances;
    mapping(address => uint) personalSales;
    mapping(uint => address) investors;

    event Paid(address indexed from, uint value);

    function() payable public {
        receiveETH();
    }

    function receiveETH() internal {
        require(isActive); // can receive ETH only if pre-ICO is active
        
        require(msg.value >= minAmmount);
        
        uint coinsCount = msg.value.div(coinPrice).mul(10 ** 18); // counts ammount
        coinsCount = coinsCount.add(coinsCount.div(100).mul(personalSales[msg.sender] > 0 ? personalSales[msg.sender] : bonus)); // bonus

        require((totalSupply + coinsCount) <= hardCap);

        if (balances[msg.sender] == 0) {
            investors[investorsCount] = msg.sender;
            investorsCount++;
        }

        balances[msg.sender] += coinsCount;
        totalSupply += coinsCount;

        Paid(msg.sender, coinsCount);
    }

    function balanceOf(address _addr) constant public returns(uint256)
    {
        return balances[_addr];    
    }

    function getPersonalSale(address _addr) constant public returns(uint) {
        return personalSales[_addr] > 0 ? personalSales[_addr] : bonus;
    }

    function setPersonalSale(address _addr, uint8 _value) onlyOwner public {
        require(_value > 0 && _value <=100);
        personalSales[_addr] = _value;
    }
 
    function getInvestorAddress(uint index) constant public returns(address)
    {
        require(investorsCount > index);
        return investors[index];
    }
    
    function getInvestorBalance(uint index) constant public returns(uint256) 
    {
        address addr = investors[index];
        require(addr != 0);
        return  balances[addr];
    }

    function setActive(bool _value) onlyOwner public {
        isActive = _value;
    }
    
    function setMinAmmount(uint ammount) onlyOwner public {
        require(ammount > 0);
        minAmmount = ammount;
    }

    function drain() onlyOwner public {
        msg.sender.transfer(this.balance);
    }
 }
