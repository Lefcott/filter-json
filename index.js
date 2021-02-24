const helper = require("./helper");

let prefix = "$";
let originalObj = null;
/**
 * Configures the package
 * @param {object} Config - Configuration.
 * @param {string} [Config.prefix] - String prefix for checking things like $gt, $in, etc. Default to '$'
 */
const configure = (Config) => Config.prefix && (prefix = Config.prefix);

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
const getRegexOrValue = (str) =>
  typeof str === "string" && str[0] === str[str.length - 1] && str[0] === "/"
    ? new RegExp(str.substring(1, str.lastIndexOf("/")))
    : str;

const compare = (a, b) => {
  // Test RegExp if indicated in condition
  if (b instanceof RegExp) return b.test(a);
  if (b instanceof Object) {
    b = { ...b };
    let A;
    const transform = `${prefix}transform`;
    if (b[transform] instanceof Function) A = b[transform](a);
    else if (typeof b[transform] === "string") A = eval(`(${b[transform]})`)(a);
    delete b[transform];
    A = A || a;
    const keys = Object.keys(b);
    const opKeys = keys.filter(
      (key) => key.substring(0, prefix.length) === prefix
    );
    if (opKeys.length > 0) {
      for (let k = 0; k < opKeys.length; k += 1) {
        const key = opKeys[k];
        if (!helper.compareValues(originalObj, A, key, b[key], prefix, check))
          return false;
      }
      return true;
    }
    return helper.compareObjects(a, b, []);
  }
  return a === b;
};

const getValue = (search, obj) => {
  const splittedKey = search.split(".");
  let currObj = obj;
  for (let m = 0; m < splittedKey.length; m += 1) {
    currObj = currObj[splittedKey[m]];
    if ([null, undefined].includes(currObj) && m < splittedKey.length - 1)
      return null;
  }
  return currObj;
};
const setValue = (search, obj, value) => {
  const splittedKey = typeof search === "string" ? search.split(".") : search;
  if ([null, undefined].includes(obj)) obj = {};
  if (splittedKey.length > 0)
    obj[splittedKey[0]] = setValue(
      splittedKey.slice(1),
      obj[splittedKey[0]],
      value
    );
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
    if (condition[conditionKey] === undefined) continue;
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
    if (conditionKey === prefix) {
      if (!compare(obj, condition[conditionKey])) {
        originalObj = null;
        return false;
      }
      continue;
    }
    const splittedKey = conditionKey.split(".");
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

const aggregate = (objs = [], search, type) => {
  if (!objs.length) return [];
  let last = getValue(search, objs[0] || {});
  let [lastObj] = objs;
  for (let k = 0; k < objs.length; k += 1) {
    const curr = getValue(search, objs[k]);
    if (type === "max") {
      if (curr > last) {
        last = curr;
        lastObj = objs[k];
      }
      continue;
    }
    if (type === "min") {
      if (curr < last) {
        last = curr;
        lastObj = objs[k];
      }
      continue;
    }
    console.error(`filter-json: Unknown aggregate type: "${type}"`);
    return objs;
  }
  return [lastObj];
};

const filter = (objects, condition = {}, ...subFilters) => {
  const objs = Array.isArray(objects) ? objects : [objects];
  let agg;
  if (condition._aggregate) {
    agg = condition._aggregate;
    delete condition._aggregate;
    if (!agg.field) {
      console.error(`filter-json: Invalid aggregate field: "${agg.field}"`);
      return objects;
    }
    if (!agg.type) {
      console.error(`filter-json: Invalid aggregate type: "${agg.type}"`);
      return objects;
    }
  }
  let after = objs.filter((obj) => check(obj, condition));
  if (agg) after = aggregate(objs, agg.field, agg.type);
  for (let k = 1; k < subFilters.length; k += 2) {
    for (let m = 0; m < after.length; m += 1) {
      const search = subFilters[k - 1];
      const condition = subFilters[k];
      let value;
      if (!search) value = JSON.parse(JSON.stringify(after));
      else if (search === prefix) value = after[m];
      else value = getValue(search, after[m]);
      if (!Array.isArray(value)) continue;
      value = filter(value, condition);
      if (!search) after = value;
      else if (search === prefix) after[m] = value;
      else setValue(search, after[m], value);
    }
  }
  return after;
};

/**
 * Parses a JSON from a string that may contain single quotes or no quotes on keys
 * @param {string} str
 */
const parse = (str) => {
  const ignoredRanges = helper.quoteIgnoreRanges(str, null);
  const dotIndexes = helper.getIndexesIgnoring(str, ":", ignoredRanges);
  const keyCharsRange = [
    [48, 57],
    [65, 90],
    [97, 122],
  ];
  const spaceChars = ["\n", "\t", " "];
  var newQuotesIndexes = [];
  var strOkQuotes = "",
    ignoredIndexes = [];
  for (var k = 0; k < ignoredRanges.length; k++) {
    for (var m = 0; m < ignoredRanges[k].length; m++) {
      ignoredIndexes[ignoredIndexes.length] = ignoredRanges[k][m];
    }
  }
  for (var k = 0; k < str.length; k++) {
    strOkQuotes += ignoredIndexes.indexOf(k) == -1 ? str[k] : '"';
  }
  str = strOkQuotes;
  // Search and saves corresponding quotes indexes
  for (var k = 0; k < dotIndexes.length; k++) {
    var wasKeyChar = false;
    for (var m = 1; true; m++) {
      if (
        helper.insideSomeRange(
          str[dotIndexes[k] - m].charCodeAt(0),
          keyCharsRange
        )
      ) {
        if (
          str[dotIndexes[k] - m + 1] != "'" &&
          str[dotIndexes[k] - m + 1] != '"' &&
          !wasKeyChar
        ) {
          newQuotesIndexes[newQuotesIndexes.length] = dotIndexes[k] - m;
        }
        wasKeyChar = true;
      } else {
        if (spaceChars.indexOf(str[dotIndexes[k] - m]) == -1) {
          if (str[dotIndexes[k] - m] != "'" && str[dotIndexes[k] - m] != '"') {
            newQuotesIndexes[newQuotesIndexes.length] = dotIndexes[k] - m;
          }
          break;
        } else {
          if (wasKeyChar) {
            newQuotesIndexes[newQuotesIndexes.length] = dotIndexes[k] - m;
            break;
          }
        }
        wasKeyChar = false;
      }
    }
  }
  try {
    return JSON.parse(helper.addCharsAfterIndexes(str, '"', newQuotesIndexes));
  } catch (error) {
    return error;
  }
};

module.exports = {
  configure,
  checkJsonCondition: check,
  filter,
  compareN: compareNObjects,
  parse,
  getValue,
};
