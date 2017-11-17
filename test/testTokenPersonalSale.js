// Specifically request an abstraction for MetaCoin
var GranitePreIco = artifacts.require("GranitePreIco");
var BigNumber = require('bignumber.js');

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

contract('GranitePreIco', function(accounts) {

    it("Check correct token personal price", function() {
        var inst;
        return GranitePreIco.deployed().then(function(instance) {
            inst = instance;
            return inst.setPersonalSale(accounts[1], 90, {from: accounts[0]});
        })
        .then(function() {
            return inst.getPersonalSale.call(accounts[1]).then(function(pb) {
                assert.isTrue(pb.equals(90));
            });
        })
        .then(function() {
            return inst
                .sendTransaction({
                    from: accounts[1],
                    to: inst.address,
                    value: web3.toWei(1, "ether")
                })
        })
        .then(function() {            
            return inst.balanceOf.call(accounts[1]);
        })
        .then(function(balance) {
            assert.isTrue(balance.equals((new BigNumber(web3.toWei(1, "ether"))).mul(400 * 1.9)));           
        })
    });

})