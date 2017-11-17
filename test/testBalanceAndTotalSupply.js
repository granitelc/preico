// Specifically request an abstraction for MetaCoin
var GranitePreIco = artifacts.require("GranitePreIco");
var BigNumber = require('bignumber.js');

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

contract('GranitePreIco', function(accounts) {

    it("Check empty balance", function() {
        var inst;
        return GranitePreIco.deployed().then(function(instance) {
            inst = instance;                
            return instance.balanceOf.call(accounts[0])
        })
        .then(function(balance) {
            assert.equal(balance.valueOf(), 0, "Not empty balance");
            return inst.totalSupply.call();
        })
        .then(function(totalSupply) {
            assert.equal(totalSupply.valueOf(), 0, "Not empty totalSupply");
        })
    });

    it("Check  token price and totalSupply", function() {
        return GranitePreIco.deployed().then(function(instance) {
            var ammount = Math.round(Math.random() * 80);
            return instance
            .sendTransaction({
                from: accounts[0],
                to: instance.address,
                value: web3.toWei(ammount, "ether")
            }).then(function() {
                return instance.balanceOf.call(accounts[0]);
            }).then(function(balance) {
                assert.equal(balance.valueOf(), ammount * 600 * Math.pow(10,18), "Not correct balance");
                return instance.totalSupply.call();
            }).then(function(totalSupply) {
                assert.equal(totalSupply.valueOf(), ammount * 600 * Math.pow(10,18), "Not correct totalSupply");
            })
        })
    });


});