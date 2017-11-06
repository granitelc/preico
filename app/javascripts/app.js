// Import libraries we need.
import { default as Web3 } from "web3";
import { default as contract } from "truffle-contract";

// Import our contract artifacts and turn them into usable abstractions.
import granitepreico_artifacts from "../../build/contracts/GranitePreIco.json";

// GranitePreIco is our usable abstraction, which we'll use through the code below.
var GranitePreIco = contract(granitepreico_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.

var account;
var ethPerCoin;
var coinsInput;
var ethInput;
var accountSelect;
window.App = window.App || {};
window.App.start =  function() {
    var self = this;
    coinsInput = document.getElementsByName("coin_ammount")[0];
    ethInput = document.getElementsByName("eth_ammount")[0];
    accountSelect = document.getElementsByName("account")[0];
    // Bootstrap the GranitePreIco abstraction for Use.
    GranitePreIco.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
        if (err != null) {
            alert("There was an error fetching your accounts.");
            return;
        }

        if (accs.length == 0) {
            alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
            return;
        }

        for (var i = 0; i < accountSelect.options.length; ++i) {
            accountSelect.remove(i);
        }

        for (var i in accs) {
            var opt = document.createElement("option");
            opt.text = accs[i];
            opt.value = accs[i];
            accountSelect.appendChild(opt);
        };
        account = accs[0];

        accountSelect.addEventListener("change", function(e) {
            account = e.target.value;
        });

        coinsInput.addEventListener("input", function(e) {
            ethInput.value = parseInt(e.target.value) * ethPerCoin;
        });

        ethInput.addEventListener("input", function(e) {
            coinsInput.value = parseFloat(e.target.value) / ethPerCoin;
        });

        GranitePreIco.deployed()
        .then(function(instance) {
            if (App.Deployed) {
                App.Deployed();
            }
            self.refreshBalance();
            setInterval(function() {
                self.refreshBalance();
            }, 1000);
            return instance.coinPrice.call(account);
        }).then(function(coinPrice) {
            GranitePreIco.deployed()
            .then(function(instance) {
                return instance.bonus.call(account);
            }).then(function(bonus) {
                if (App.UpdateBonus) {
                    App.UpdateBonus(bonus.valueOf());
                }
                ethPerCoin = web3.fromWei(coinPrice, "ether" ).toNumber() / (1.0 + 0.01 * parseInt(bonus.valueOf()));
                if (App.UpdateEthPerCoin) {
                    App.UpdateEthPerCoin(ethPerCoin);
                }
                GranitePreIco.deployed()
                .then(function(instance) {
                    return instance.minAmmount.call(account);
                }).then(function(minAmmount) {
                    ethInput.value = web3.fromWei(minAmmount, "ether" ).toNumber();
                    coinsInput.value = ethInput.value / ethPerCoin;
                })
            })
        }).catch(function(err) {
            if (App.DeployedError) {
                App.DeployedError(err);
            }
        })
    });
}

window.App.refreshBalance = function() {
    var self = this;

    GranitePreIco.deployed()
        .then(function(instance) {
            return instance.balanceOf.call(account, { addr: account });
        })
        .then(function(value) {
            if (App.UpdateBalance) {
                App.UpdateBalance(value.valueOf());
            }
        })
        .catch(function(e) {
            console.log(e);
        });

    GranitePreIco.deployed()
        .then(function(instance) {
            return instance.totalSupply.call(account);
        })
        .then(function(value) {
            if (App.UpdateTotalSupply) {
                App.UpdateTotalSupply(value.valueOf());
            }
        })
        .catch(function(e) {
            console.log(e);
        });
}

window.App.send =  function(success) {
    var self = this;
    var amount = parseFloat(ethInput.value);

    GranitePreIco.deployed().then(function(instance) {
        instance
            .sendTransaction({
                from: web3.eth.accounts[0],
                to: instance.address,
                value: web3.toWei(amount, "ether")
            })
            .then(function(e) {
                console.log(e);
                if (success) {
                    success(e);
                }
            });
    });
}

window.addEventListener("load", function() {
    if (typeof web3 !== "undefined") {
        window.web3 = new Web3(web3.currentProvider);
        App.start();
    } else {
        if (App.web3Fallback) {
            App.web3Fallback();
        }
    }
});
