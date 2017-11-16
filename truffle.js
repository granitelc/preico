// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {
    live: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas:1500000
    }
  }
}
