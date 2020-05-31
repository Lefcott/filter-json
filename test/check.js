const { check } = require("..");

const ObjToCheck = {
  a: {
    b: {
      c: "someString",
      d: [1, 2, 3, 4],
      e: true,
      f: null,
      g: undefined,
      h: [],
      i: [{ z: 1 }, { z: 2 }],
    },
  },
  h: "someString",
  i: { j: 1234 },
};
let result = true;
let Condition;
Condition = { "a.b.c.g": { $exists: true } }; // Checks that a.b.c.g exists
result = result && check(ObjToCheck, Condition) === false;

Condition = { h: { $field: "a.b.c" } }; // Checks that h equals a.b.c
result = result && check(ObjToCheck, Condition) === true;

Condition = { "a.b.e": true }; // Checks a.b.e equals true
result = result && check(ObjToCheck, Condition) === true;

Condition = { i: { j: 1234 } }; // Checks i equals json: { j: 1234 }
result = result && check(ObjToCheck, Condition) === true;

Condition = { "a.b.d.length": 4 }; // Checks that length of array a.b.d equals 4
result = result && check(ObjToCheck, Condition) === true;

Condition = { "a.b.d.3": 4 }; // Checks a.b.d[3] equals 4
result = result && check(ObjToCheck, Condition) === true;

Condition = {
  "a.b.d.0": { $transform: (d) => d + 2, $field: "a.b.d.2" },
}; // Sums 2 to a.b.d[0] and checks if result is equal to a.b.d[2]
result = result && check(ObjToCheck, Condition) === true;

Condition = { "a.b.i": { $arrayOr: { z: 1 } } }; // Checks OR condition on an array elements
result = result && check(ObjToCheck, Condition) === true;

Condition = { "a.b.i": { $arrayAnd: { z: 1 } } }; // Checks OR condition on an array elements
result = result && check(ObjToCheck, Condition) === false;

Condition = { "a.b.d": { $includes: 2 } }; // Checks whether a.b.d includes 2
result = result && check(ObjToCheck, Condition) === true;

Condition = { "a.b.d": { "$!includes": 3 } }; // Checks whether a.b.d not includes 3
result = result && check(ObjToCheck, Condition) === false;

Condition = { "a.b.f": { $in: [45, null, "test"] } }; // Checks whether a.b.f is included in the array
result = result && check(ObjToCheck, Condition) === true;

Condition = { $: { $gt: 2 } }; // Checks whether the value is greater than 2
result = result && check(3.5, Condition) === true;

Condition = { $: { $gt: 2 } }; // Checks whether the value is greater than 2
result = result && check(1, Condition) === false;

Condition = { $: { $gte: 7, $lt: 3 } }; // Checks whether the value is greater or equal that 7 and less than 3
result = result && check(50, Condition) === false;

if (!result) console.error("check() failed!!!");

module.exports = result;
