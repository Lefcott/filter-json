const { compareN } = require('..');

const ObjectList = [
  { a: { b: 1, c: 2 } },
  { a: { b: 1, c: 3 } },
  { a: { b: 1, c: 4, d: null } }
];
const FieldsToIgnore = ['a.c', 'a.d'];
let result = true;

// Calling compareN without fields to ignore
result = result && compareN(ObjectList) === false;

// Calling compareN with a list of fields to ignore
result = compareN(ObjectList, FieldsToIgnore) === true;

if (!result) console.error('compareN() failed!!!');

module.exports = result;
