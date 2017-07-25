// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

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
var accounts;
var account;

var coinsPerEth = 200;

var coinsInput;
var ethInput;

window.App = {
    start: function() {
        var self = this;
        coinsInput = document.getElementById("coins");
        ethInput = document.getElementById("eth");
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

            accounts = accs;
            account = accounts[0];
            coinsInput.addEventListener("change", function(e) {
                ethInput.value = parseInt(e.target.value) / coinsPerEth;
            });

            ethInput.addEventListener("change", function(e) {
                coinsInput.value = parseFloat(e.target.value) * coinsPerEth;
            });

            self.refreshBalance();

            setInterval(function() {
                self.refreshBalance();
            }, 1000);
        });
    },

    refreshBalance: function() {
        var self = this;

        GranitePreIco.deployed()
            .then(function(instance) {
                return instance.balanceOf.call(account, { addr: account });
            })
            .then(function(value) {
                document.getElementById("balance").innerHTML = value.valueOf();
            })
            .catch(function(e) {
                console.log(e);
            });

        GranitePreIco.deployed()
            .then(function(instance) {
                return instance.totalSupply.call(account);
            })
            .then(function(value) {
                document.getElementById("totalsupply").innerHTML = value.valueOf();
            })
            .catch(function(e) {
                console.log(e);
            });
    },

    send: function() {
        var self = this;
        var amount = parseFloat(ethInput.value);

        GranitePreIco.deployed().then(function(instance) {
            console.log(web3.eth.accounts[0], instance.address);
            instance
                .sendTransaction({
                    from: web3.eth.accounts[0],
                    to: instance.address,
                    value: web3.toWei(amount, "ether")
                })
                .then(function(e) {
                    console.log(e);
                });
        });
    }
};

window.addEventListener("load", function() {
    // Checking if Web3 has been injected by the browser (Mist/gpiMask)
    if (typeof web3 !== "undefined") {
        console.warn(
            "Using web3 detected from external source. If you find that your accounts don't appear or you have 0 GranitePreIco, ensure you've configured that source properly. If using gpiMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-gpimask"
        );
        // Use Mist/gpiMask's provider
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn(
            "No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to gpimask for development. More info here: http://truffleframework.com/tutorials/truffle-and-gpimask"
        );
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    App.start();
});
