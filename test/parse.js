const { parse, compareN } = require("..");

let result = 1;

result &= compareN([parse("{test: 1}"), { test: 1 }]) === true;
result &= compareN([parse("{'hello': 'world'}"), { hello: "world" }]) === true;
result &=
  compareN([
    parse(`{'hello': {'w'  :  {o:{r:{"l":{'d':[1, 2, 3]}}}}}}`),
    { hello: { w: { o: { r: { l: { d: [1, 2, 3] } } } } } },
  ]) === true;

if (!result) console.error("parse() failed!!!");

module.exports = result === 1;
