const result = require('./check') && require('./filter') && require('./compareN');

if (result === true) console.log('Checks passed!');

module.exports = result;