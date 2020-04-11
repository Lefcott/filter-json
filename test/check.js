const { check } = require('..');

const ObjToCheck = {
  a: {
    b: {
      c: 'someString',
      d: [1, 2, 3, 4],
      e: true,
      f: null,
      g: undefined
    }
  },
  h: 'someString',
  i: { j: 1234 }
};
let result = true;
const Condition1 = { 'a.b.c.g': { $exists: true } }; // Checks that a.b.c.g exists
result = result && check(ObjToCheck, Condition1) === false;

const Condition2 = { h: { $field: 'a.b.c' } }; // Checks that h equals a.b.c
result = result && check(ObjToCheck, Condition2) === true;

const Condition3 = { 'a.b.e': true }; // Checks a.b.e equals true
result = result && check(ObjToCheck, Condition3) === true;

const Condition4 = { i: { j: 1234 } }; // Checks i equals json: { j: 1234 }
result = result && check(ObjToCheck, Condition4) === true;

const Condition5 = { 'a.b.d.length': 4 }; // Checks that length of array a.b.d equals 4
result = result && check(ObjToCheck, Condition5) === true;

const Condition6 = { 'a.b.d.3': 4 }; // Checks a.b.d[3] equals 4
result = result && check(ObjToCheck, Condition6) === true;

const Condition7 = { 'a.b.d.0': { $transform: d => d + 2, $field: 'a.b.d.2' } }; // Sums 2 to a.b.d[0] and checks if result is equal to a.b.d[2]
result = result && check(ObjToCheck, Condition7) === true;

if (!result) console.error('check() failed!!!');

module.exports = result;
