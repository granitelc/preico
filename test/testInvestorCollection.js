// Specifically request an abstraction for MetaCoin
var GranitePreIco = artifacts.require("GranitePreIco");
var BigNumber = require('bignumber.js');

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);



contract('GranitePreIco', function(accounts) {
    
    it("Check investors collection", function() {
        var inst
        return GranitePreIco.deployed().then(function(instance) {
            inst = instance;
            return instance
                .sendTransaction({
                    from: accounts[1],
                    to: instance.address,
                    value: web3.toWei(1, "ether")
                })
            }).then(function() {
                return inst
                    .sendTransaction({
                        from: accounts[2],
                        to: inst.address,
                        value: web3.toWei(2, "ether")
                    })
            }).then(function() {
                return inst.investorsCount.call();
            }).then(function(investors) {
                assert.equal(investors.valueOf(), 2);
            }).then(function() {
                return inst.getInvestorAddress.call(0)
            }).then(function(addr) {
                return assert.equal(addr.valueOf(), accounts[1])
            }).then(function() {
                return inst.getInvestorAddress.call(1)
            }).then(function(addr) {
                return assert.equal(addr.valueOf(), accounts[2])
            }).then(function() {
                return inst.getInvestorBalance.call(0)
            }).then(function(balance) {
                var p = (new BigNumber(10)).pow(18);
                return assert(balance.equals((new BigNumber(600)).mul(p)))
            }).then(function() {
                return inst.getInvestorBalance.call(1)
            }).then(function(balance) {
                var p = (new BigNumber(10)).pow(18);
                return assert(balance.equals((new BigNumber(1200)).mul(p)))
            });
    })
});