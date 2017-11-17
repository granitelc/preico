// Specifically request an abstraction for MetaCoin
var GranitePreIco = artifacts.require("GranitePreIco");
var BigNumber = require('bignumber.js');

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);



contract('GranitePreIco', function(accounts) {

    it("Check active assertion", function() {
        var inst;
        return GranitePreIco.deployed().then(function(instance) {
            inst = instance;            
            return inst.setActive(false, {from: accounts[0]})
        }).then(function() {
            return chai.assert.isRejected(inst
                .sendTransaction({
                    from: accounts[0],
                    to: inst.address,
                    value: web3.toWei(3, "ether")
                }));
        }).then(function() {
            return inst.setActive(true, {from: accounts[0]})
        }).then(function() {
            return inst
                .sendTransaction({
                    from: accounts[0],
                    to: inst.address,
                    value: web3.toWei(3, "ether")
                });
        })
    })
});