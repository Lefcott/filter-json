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
  h: 'someString'
};
// Returns true or false
```