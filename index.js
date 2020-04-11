const helper = require('./helper');

let prefix = '$';
/**
 * Configures the package
 * @param {object} Config - Configuration.
 * @param {string} [Config.prefix] - String prefix for checking things like $gt, $in, etc. Default to '$'
 */
const configure = Config => Config.prefix && (prefix = Config.prefix);

/* eslint-disable guard-for-in */
const compareObjects = (obj1, obj2, excludeFields = []) => {
  if (obj1 instanceof Object && obj2 instanceof Object) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    for (let k = 0; k < keys1.length; k += 1) {
      if (keys2.indexOf(keys1[k]) === -1) {
        return false;
      }
    }
    for (let k = 0; k < keys2.length; k += 1) {
      if (keys1.indexOf(keys2[k]) === -1) {
        return false;
      }
    }
    for (let k = 0; k < keys1.length; k += 1) {
      if (excludeFields.indexOf(keys1[k]) !== -1) {
        continue;
      }
      if (obj1[keys1[k]] instanceof Object) {
        if (!compareObjects(obj1[keys1[k]], obj2[keys1[k]], [])) {
          return false;
        }
      } else if (obj1[keys1[k]] !== obj2[keys1[k]]) {
        return false;
      }
    }
    return true;
  }
  return obj1 === obj2;
};

// Example: ([{k: 1}, {k: 1}, {k: 1}])
//   -----> true
// Example: ([{k: 1}, {k: 1, j: 1}, {k: 1}])
//   -----> false
const compareNObjects = (objects, excludeFields) => {
  for (let k = 0; k < objects.length - 1; k += 1) {
    if (!compareObjects(objects[k], objects[k + 1], excludeFields)) {
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
  if (b instanceof RegExp) {
    return b.test(a);
  }
  if (b instanceof Object) {
    let A;
    const transform = `${prefix}transform`; 
    if (b[transform] instanceof Function) {
      A = b[transform](a);
      delete b[transform];
    }
    A = A || a;
    const keys = Object.keys(b);
    const opKeys = keys.filter(key => key.substring(0, prefix.length) === prefix);
    if (opKeys.length > 0) {
      for (let k = 0; k < opKeys.length; k += 1) {
        const key = opKeys[k];
        if (!helper.compareValues(A, key, b[key], prefix)) {
          return false;
        }
      }
      return true;
    }
    return compareObjects(a, b, []);
  }
  return a === b;
};

// USE EXAMPLES:
// {"k1": {"k2": "hello word"}}, {"k1.k2": "/word/"} ---> true
// {"k1": {"k2": "hello word"}}, {"k1.k2": "asdf"} ---> false
const check = (obj, condition) => {
  if (!(condition instanceof Object)) {
    obj = getRegexOrValue(obj);
    return obj === condition;
  }

  // eslint-disable-next-line no-restricted-syntax
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
        return false;
      }
      continue;
    }
    if (conditionKey === `${prefix}and`) {
      for (let k = 0; k < condition[conditionKey].length; k += 1) {
        if (!check(obj, condition[conditionKey][k])) {
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
        return false;
      }
    }
    condition[conditionKey] = getRegexOrValue(condition[conditionKey]);

    if (!compare(currObj, condition[conditionKey])) {
      return false;
    }
  }
  return true;
};

const filter = (objects, condition) => {
  const objs = Array.isArray(objects) ? objects : [objects];
  return objs.filter(obj => check(obj, condition));
};

module.exports = { configure, check, filter, compareN: compareNObjects };
