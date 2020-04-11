# Filter Json
Functions related to object comparing.

### Optional Initialization:
```js
const { configure } = require('@lefcott/filter-json');

// Define custom prefix for operators, default to '$'.
configure({ prefix: '$' });
```

### Checking an object with a condition:
```js
const { check } = require('@lefcott/filter-json');

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

// Some examples

const Condition1 = { 'a.b.c.g': { $exists: true } }; // Checks that a.b.c.g exists
check(ObjToCheck, Condition1); // returns false

const Condition2 = { h: { $field: 'a.b.c' } }; // Checks that h equals a.b.c
check(ObjToCheck, Condition2); // returns true

const Condition3 = { 'a.b.e': true }; // Checks a.b.e equals true
check(ObjToCheck, Condition3); // returns true

const Condition4 = { i: { j: 1234 } }; // Checks i equals json: { j: 1234 }
check(ObjToCheck, Condition4); // returns true

const Condition5 = { 'a.b.d.length': 4 }; // Checks that length of array a.b.d equals 4
check(ObjToCheck, Condition5); // returns true

const Condition6 = { 'a.b.d.3': 4 }; // Checks a.b.d[3] equals 4
check(ObjToCheck, Condition6); // returns true

const Condition7 = { 'a.b.d.0': { $transform: d => d + 2, $field: 'a.b.d.2' } }; // Sums 2 to a.b.d[0] and checks if result is equal to a.b.d[2]
check(ObjToCheck, Condition7); // returns true
```

### Filtering an array of objects with a condition:
```js
const { filter } = require('@lefcott/filter-json');

const OriginalObjects = [
  { a: 123 },
  { a: { b: 1 } },
  { a: { b: 2 } },
  { a: { b: 3 } },
  { a: { b: 4 } },
  { a: { b: 5 } }
];

filter(OriginalObjects, { 'a.b': { $gte: 3 } });
// Returns [{ a: { b: 3 } }, { a: { b: 4 } }, { a: { b: 5 } }]
```

### Checking if all objects of an array are equal
```js
const { compareN } = require('@lefcott/filter-json');

const ObjectList = [
  { a: { b: 1, c: 2 } },
  { a: { b: 1, c: 3 } },
  { a: { b: 1, c: 4, d: null } }
];
const FieldsToIgnore = ['a.c', 'a.d'];

// Calling compareN without fields to ignore
compareN(ObjectList); // returns false

// Calling compareN with a list of fields to ignore
compareN(ObjectList, FieldsToIgnore); // returns true
```