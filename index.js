const helper = require('./helper');

let prefix = '$';
let originalObj = null;
/**
 * Configures the package
 * @param {object} Config - Configuration.
 * @param {string} [Config.prefix] - String prefix for checking things like $gt, $in, etc. Default to '$'
 */
const configure = Config => Config.prefix && (prefix = Config.prefix);

// Example: ([{k: 1}, {k: 1}, {k: 1}])
//   -----> true
// Example: ([{k: 1}, {k: 1, j: 1}, {k: 1}])
//   -----> false
const compareNObjects = (objects, excludeFields) => {
  for (let k = 0; k < objects.length - 1; k += 1) {
    if (!helper.compareObjects(objects[k], objects[k + 1], excludeFields)) {
      return false;
    }
  }
  return true;
};

// USE EXAMPLES:
// "hwd" ---> "hwd"
// "/hwd/" ---> /hwd/
const getRegexOrValue = str =>
  typeof str === 'string' && str[0] === str[str.length - 1] && str[0] === '/'
    ? new RegExp(str.substring(1, str.lastIndexOf('/')))
    : str;

const compare = (a, b) => {
  // Test RegExp if indicated in condition
  if (b instanceof RegExp) return b.test(a);
  if (b instanceof Object) {
    let A;
    const transform = `${prefix}transform`; 
    if (b[transform] instanceof Function) A = b[transform](a);
    else if(typeof b[transform] === 'string') A = eval(`(${b[transform]})`)(a);
    delete b[transform];
    A = A || a;
    const keys = Object.keys(b);
    const opKeys = keys.filter(key => key.substring(0, prefix.length) === prefix);
    if (opKeys.length > 0) {
      for (let k = 0; k < opKeys.length; k += 1) {
        const key = opKeys[k];
        if (!helper.compareValues(originalObj, A, key, b[key], prefix, check)) return false;
      }
      return true;
    }
    return helper.compareObjects(a, b, []);
  }
  return a === b;
};

const getValue = (search, obj) => {
  const splittedKey = search.split('.');
  let currObj = obj;
  for (let m = 0; m < splittedKey.length; m += 1) {
    currObj = currObj[splittedKey[m]];
    if ([null, undefined].includes(currObj) && m < splittedKey.length - 1) return null;
  }
  return currObj;
};
const setValue = (search, obj, value) => {
  const splittedKey = typeof search === 'string' ? search.split('.') : search;
  if ([null, undefined].includes(obj)) obj = {};
  if (splittedKey.length > 0) obj[splittedKey[0]] = setValue(splittedKey.slice(1), obj[splittedKey[0]], value);
  else obj = value;
  return obj;
};

// USE EXAMPLES:
// {"k1": {"k2": "hello word"}}, {"k1.k2": "/word/"} ---> true
// {"k1": {"k2": "hello word"}}, {"k1.k2": "asdf"} ---> false
const check = (obj, condition) => {
  if (!originalObj) originalObj = obj;
  if (!(condition instanceof Object)) {
    originalObj = null;
    obj = getRegexOrValue(obj);
    return obj === condition;
  }

  for (const conditionKey in condition) {
    if (condition[conditionKey] === undefined) {
      continue;
    }
    if (conditionKey === `${prefix}or`) {
      let checkedOk = false;
      for (let k = 0; k < condition[conditionKey].length; k += 1) {
        if (check(obj, condition[conditionKey][k])) {
          checkedOk = true;
          break;
        }
      }
      if (!checkedOk) {
        originalObj = null;
        return false;
      }
      continue;
    }
    if (conditionKey === `${prefix}and`) {
      for (let k = 0; k < condition[conditionKey].length; k += 1) {
        if (!check(obj, condition[conditionKey][k])) {
          originalObj = null;
          return false;
        }
      }
      continue;
    }
    const splittedKey = conditionKey.split('.');
    let currObj = obj;
    for (let m = 0; m < splittedKey.length; m += 1) {
      currObj = currObj[splittedKey[m]];
      if ([null, undefined].includes(currObj) && m < splittedKey.length - 1) {
        originalObj = null;
        return false;
      }
    }
    condition[conditionKey] = getRegexOrValue(condition[conditionKey]);

    if (!compare(currObj, condition[conditionKey])) {
      originalObj = null;
      return false;
    }
  }
  originalObj = null;
  return true;
};

const filter = (objects, condition, ...subFilters) => {
  const objs = Array.isArray(objects) ? objects : [objects];
  const after = objs.filter(obj => check(obj, condition));
  for (let k = 1; k < subFilters.length; k += 2) {
    for (let m = 0; m < after.length; m += 1) {
      const search = subFilters[k - 1];
      const condition = subFilters[k];
      let value = getValue(search, after[m]);
      if (!Array.isArray(value)) continue;
      value = filter(value, condition);
      setValue(search, after[m], value);
    }
  }
  return after;
};

module.exports = { configure, check, filter, compareN: compareNObjects };
