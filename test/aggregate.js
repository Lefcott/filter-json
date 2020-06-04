const { filter, compareN } = require("..");

let result = 1;

result &=
  compareN([
    filter([{ a: 1 }, { a: 3 }, { a: 2 }], {
      _aggregate: { field: "a", type: "min" },
    }),
    [{ a: 1 }],
  ]) === true;
result &=
  compareN([
    filter([{ a: 1 }, { a: 3 }, { a: 2 }], {
      _aggregate: { field: "a", type: "max" },
    }),
    [{ a: 3 }],
  ]) === true;

if (!result) console.error("filter() with aggregate failed!!!");

module.exports = result === 1;
