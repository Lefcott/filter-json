const result = require('./check') && require('./filter');

if (result !== true) console.error('Something went wrong!!!');
else console.log('Checks passed!');

module.exports = result;