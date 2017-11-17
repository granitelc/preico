import { access } from 'fs';

// Specifically request an abstraction for MetaCoin
var GranitePreIco = artifacts.require("GranitePreIco");
var BigNumber = require('bignumber.js');

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);



contract('GranitePreIco', function(accounts) {

    it("Check drain", function() {
        var ownerBalance = web3.eth.getBalance(accounts[0]);
        var contractBalance;
        var inst;
        return GranitePreIco.deployed().then(function(instance) {
            inst = instance; 
            var ps = [];
            for (var i = 1; i < 10; ++i) {
                ps.push(inst.sendTransaction({
                    from: accounts[i],
                    to: inst.address,
                    value: web3.toWei(1, "ether")
                }));
            }
            return Promise.all(ps)
        })
        .then(function() {
            contractBalance  = web3.eth.getBalance(inst.address)
            return inst.drain({from: accounts[0]});
        })
        .then(function(tx) {
            return new Promise(function(resolve, reject) { 
                web3.eth.getTransaction(tx.tx, function(error, txx) {
                    if (error) {
                        reject();
                    } else {
                        
                        resolve({transaction: tx, gasPrice: txx.gasPrice})
                    }
                });
            });
        })
        .then(function(data) {            
            var currentOwnerBalance = web3.eth.getBalance(accounts[0]);
            assert.isTrue(ownerBalance.lt(currentOwnerBalance));
            assert.isTrue(web3.eth.getBalance(inst.address).equals(0));
            assert.isTrue(contractBalance.equals(currentOwnerBalance.sub(ownerBalance).add(data.gasPrice.mul(data.transaction.receipt.gasUsed))));
        })
    })

});