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

    it("Check drain", function() {
        var ownerBalance = web3.fromWei(web3.eth.getBalance(accounts[0]), "ether").valueOf();
        var contractBalance;
        var inst;
        return GranitePreIco.deployed().then(function(instance) {
            inst = instance;
            contractBalance  = web3.fromWei(web3.eth.getBalance(instance.address), "ether").valueOf();
            return inst.drain({from: accounts[0]});
        }).then(function() {
            assert(ownerBalance < web3.fromWei(web3.eth.getBalance(accounts[0]), "ether").valueOf());
            assert.equal(web3.fromWei(web3.eth.getBalance(inst.address), "ether").valueOf(),0);
            assert.equal(contractBalance, Math.round(web3.fromWei(web3.eth.getBalance(accounts[0]), "ether").valueOf() -  ownerBalance));
        })
     })


    it("Check not owner assertion", function() {
        var inst;
        return GranitePreIco.deployed().then(function(instance) {
            inst = instance;
            return inst.setActive(true, {from: accounts[0]})
        }).then(function() {
            return chai.assert.isRejected(inst.setActive(true, {from: accounts[1]}));
        }).then(function() {
            return inst.setMinAmount(web3.toWei(1,"ether"), {from: accounts[0]});
        }).then(function() {
            return chai.assert.isRejected(inst.setMinAmount(web3.toWei(1,"ether"), {from: accounts[1]}));
        }).then(function() {
            return inst.drain({from: accounts[0]});
        }).then(function() {
            return chai.assert.isRejected(inst.drain({from: accounts[1]}));
        }).then(function() {
            return inst.setPersonalBonus(accounts[1], 90, {from: accounts[0]});
        }).then(function() {
            return chai.assert.isRejected(inst.setPersonalBonus(accounts[1], 90, {from: accounts[1]}));
        })
    })
});