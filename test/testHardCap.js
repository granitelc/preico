// Specifically request an abstraction for MetaCoin
var GranitePreIco = artifacts.require("GranitePreIco");
var BigNumber = require('bignumber.js');

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);



contract('GranitePreIco', function(accounts) {

    it("Check hardcap assertion", function() {
        var inst;
        return GranitePreIco.deployed().then(function(instance) {
            inst = instance;
            var ps = [];
            for (var i = 1; i < 10; ++i) {
                ps.push(web3.eth.sendTransaction({
                    from: accounts[i],
                    to: accounts[0],
                    value: web3.toWei(80, "ether")
                }));
            }
            return Promise.all(ps)
        }).then(function() {                
            return chai.assert.isRejected(inst
                .sendTransaction({
                    from: accounts[0],
                    to: inst.address,
                    value: web3.toWei(500, "ether")
                }));
        })
    });
});