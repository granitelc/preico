// Import libraries we need.
import { default as Eth } from "ethjs";
import { default as contract } from "truffle-contract";

import { default as BigNumber } from 'bignumber.js'

// Import our contract artifacts and turn them into usable abstractions.
import granitepreico_artifacts from "../../build/contracts/GranitePreIco.json";




(function() {
// GranitePreIco is our usable abstraction, which we'll use through the code below.
var GranitePreIco = contract(granitepreico_artifacts);


window.Granite = {
    Errors: {
        WALLET_IS_NOT_FOUND:1,
        WALLET_IS_LOCKED:2,
        WALLET_INTERNAL_ERROR:3,
        WALLET_DEPLOY_ERROR:4
    },
    Start: function() {
        return new Promise(function(resolve,reject) {

            var context = {};

            if (typeof window.web3 !== "undefined") {
                context.eth = new Eth(window.web3.currentProvider);
            } else {
                reject({error:window.Granite.WALLET_IS_NOT_FOUND, message:"Wallet not found"});
                return;
            }
            GranitePreIco.setProvider(window.web3.currentProvider);

            context.eth.accounts(function(err, accs) {
                if (err != null) {
                    reject(window.Granite.WALLET_INTERNAL_ERROR, err)
                    return
                }

                if (accs.length == 0) {
                    reject({error: window.Granite.WALLET_IS_LOCKED, message:"Wallet is locked"});
                    return
                }
                context.accounts = accs;
                GranitePreIco.deployed().then(function(instance) {
                    context.instance = instance;
                    instance.decimals.call(0).then(function(decimals) {
                        context.decimals = new BigNumber(10).pow(decimals);
                        resolve(new PreICO(context));
                    })
                }).catch(function(err) {
                    reject({error:window.Granite.WALLET_DEPLOY_ERROR, message:err})
                })
            });
        });
    }
}

function PreICO(context) {

    function checkAccount(account) {
        return (context.accounts.find(function(acc) {
            return acc == account;
        }))
    }

    this.GetAccounts = function() {
        return context.accounts;
    }

    this.GetAddress = function() {
        return context.instance.address;
    }

    this.Investor = function(account) {
        return checkAccount(account) ? new Investor(account, context) : false;
    }

    this.Owner = function(account) {
        return checkAccount(account) ? new Owner(account, context) : false;
    }

}

function Investor(account, context) {

    this.GetBalance = function() {
        return new Promise(function(resolve, reject) {
            if (!context.accounts.find(function(acc) {
                return acc == account;
            })) {
                reject()
                return;
            }
            context.instance.balanceOf.call(account).then(function(balance) {
                resolve(balance.div(context.decimals).valueOf())
            }).catch(function() {
                 reject();
            })
        });
    }

    this.GetMinAmount = function() {
        return new Promise(function(resolve, reject) {
            return context.instance.minAmount.call(account).then(function(minAmount) {
                resolve(minAmount.div(self.decimals).valueOf());
            });
        });
    }

    this.GetBonus = function() {
        return new Promise(function(resolve, reject) {
            return context.instance.getPersonalBonus.call(account).then(function(bonus) {
                resolve(bonus.valueOf())
            })
        });
    }

    this.GetCoinsPerETH =  function() {
        return new Promise(function(resolve, reject) {
            return context.instance.coinPrice.call(account).then(function(coinPrice) {
                return context.instance.getPersonalBonus.call(account).then(function(bonus) {
                    var counts = new BigNumber(Eth.toWei(1, "ether")).div(coinPrice)
                    resolve(counts.add(counts.div(100).mul(bonus)).valueOf());
                })
            })
        });
    }

    this.SendETH = function(amount) {
        return context.instance
                .sendTransaction({
                    from: account,
                    to: context.instance.address,
                    value: Eth.toWei(amount, "ether")
                })
    }
}


function Owner(account, context)
{
    this.SetPersonalBonus = function(inverstorAccount, bonus) {
        return context.instance.setMinAmount(inverstorAccount, bonus, {from:account})
    }

    this.SetMinAmount  = function(minAmount) {
        return context.instance.setMinAmount(web3.toWei(minAmount,"ether"), {from:account})
    }

    this.Drain =  function() {
        return context.instance.drain({from: account});
    }
}

})();