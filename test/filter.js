const { filter } = require('..');

const helper = require('../helper');

const OriginalObjects = [
  { a: 123 },
  { a: { b: 1 } },
  { a: { b: 2 } },
  { a: { b: 3 } },
  { a: { b: 4 } },
  { a: { b: 5 } }
];

const filtered = filter(OriginalObjects, { 'a.b': { $gte: 3 } })

module.exports = helper.compareObjects(filtered, [{ a: { b: 3 } }, { a: { b: 4 } }, { a: { b: 5 } }])
