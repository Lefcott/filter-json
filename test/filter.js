const { filter } = require('..');

const helper = require('../helper');

const OriginalObjects = [
  { a: 123 },
  { a: { b: 1 } },
  { a: { b: 2 } },
  { a: { b: 3 }, c: { d: [{ z: 9}, { z: 8 }, { z: 7 }, { z: 6 }] } },
  { a: { b: 4 } },
  { a: { b: 5 } }
];

const filtered = filter(OriginalObjects, { 'a.b': { $gte: 3 } }, 'c.d', { z: { $lt: 8 } });

const result = helper.compareObjects(filtered, [{ a: { b: 3 }, c: { d: [{ z: 7 }, { z: 6 }] } }, { a: { b: 4 } }, { a: { b: 5 } }]);

if (!result) console.error(`filter() failed!!!\n\nFiltered:\n${JSON.stringify(filtered, null, 2)}`);

module.exports = result;
