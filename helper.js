const compareObjects = (Obj1, Obj2, excludeFields = []) => {
  const obj1 = { ...Obj1 };
  const obj2 = { ...Obj2 };
  if (obj1 instanceof Object && obj2 instanceof Object) {
    for (let k = 0; k < excludeFields.length; k += 1) {
      const splitted = excludeFields[k].split(".");
      let currObj1 = obj1;
      let currObj2 = obj2;
      for (let m = 0; m < splitted.length; m += 1) {
        if (currObj1) {
          if (m === splitted.length - 1) {
            delete currObj1[splitted[m]];
          } else {
            currObj1 = currObj1[splitted[m]];
          }
        }
        if (currObj2) {
          if (m === splitted.length - 1) {
            delete currObj2[splitted[m]];
          } else {
            currObj2 = currObj2[splitted[m]];
          }
        }
      }
    }
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

const compareValues = (obj, value1, operator, value2, prefix, check) => {
  const value2Split = typeof value2 === "string" && value2.split(".");
  switch (operator) {
    case `${prefix}field`:
      for (let k = 0; k < value2Split.length; k += 1) obj = obj[value2Split[k]];
      return compareObjects(value1, obj);
    case `${prefix}exists`:
      return (value1 !== undefined) === value2;
    case `${prefix}arrayAnd`:
      if (!Array.isArray(value1)) return false;
      for (let k = 0; k < value1.length; k += 1)
        if (!check(value1[k], value2)) return false;
      return true;
    case `${prefix}arrayOr`:
      if (!Array.isArray(value1)) return false;
      for (let k = 0; k < value1.length; k += 1)
        if (check(value1[k], value2)) return true;
      return false;
    case `${prefix}eq`:
      return value1 === value2;
    case `${prefix}!neq`:
      return value1 === value2;
    case `${prefix}!eq`:
      return value1 !== value2;
    case `${prefix}neq`:
      return value1 !== value2;
    case `${prefix}gt`:
      return value1 > value2;
    case `${prefix}!lte`:
      return value1 > value2;
    case `${prefix}gte`:
      return value1 >= value2;
    case `${prefix}!lt`:
      return value1 >= value2;
    case `${prefix}lt`:
      return value1 < value2;
    case `${prefix}!gte`:
      return value1 < value2;
    case `${prefix}lte`:
      return value1 <= value2;
    case `${prefix}!gt`:
      return value1 <= value2;
    case `${prefix}in`:
      return value2 && value2.includes && value2.includes(value1);
    case `${prefix}!nin`:
      return value2 && value2.includes && value2.includes(value1);
    case `${prefix}!in`:
      return !value2 || !value2.indexOf ? true : value2.indexOf(value1) === -1;
    case `${prefix}nin`:
      return !value2 || !value2.indexOf ? true : value2.indexOf(value1) === -1;
    case `${prefix}includes`:
      if (!Array.isArray(value1)) return false;
      return value1.includes(value2);
    case `${prefix}!notIncludes`:
      if (!Array.isArray(value1)) return false;
      return value1.includes(value2);
    case `${prefix}notIncludes`:
      if (!Array.isArray(value1)) return true;
      return !value1.includes(value2);
    case `${prefix}!includes`:
      if (!Array.isArray(value1)) return true;
      return !value1.includes(value2);
    default:
      console.error(
        `filter-json: Unknown operator "${operator}"\n\nCompared value:\n${JSON.stringify(
          value1,
          null,
          2
        )}\n\nExpression:\n"${operator}" "${value2}"`
      );
      return false;
  }
};

const addCharsAfterIndexes = (str, char, indexes) => {
  var newStr = "";
  for (var k = 0; k < str.length; k++) {
    newStr += str[k];
    if (indexes.indexOf(k) != -1) {
      newStr += char;
    }
  }
  return newStr;
};
const quoteIgnoreRanges = (str, quote) => {
  var insideQuotes = false;
  quote = quote || '"';
  var ranges = [];
  for (var k = 0; k < str.length; k++) {
    if (str[k] == quote && str[k - 1] != "\\") {
      if (insideQuotes) {
        ranges[ranges.length - 1][1] = k;
        insideQuotes = false;
      } else {
        ranges[ranges.length] = [];
        ranges[ranges.length - 1][0] = k;
        insideQuotes = true;
      }
    }
  }
  return quote == "'" ? ranges : ranges.concat(quoteIgnoreRanges(str, "'"));
};
const insideSomeRange = (num, ranges) => {
  for (var k = 0; k < ranges.length; k++) {
    if (num === ranges[k] || (num >= ranges[k][0] && num <= ranges[k][1])) {
      return true;
    }
  }
  return false;
};
const getIndexesIgnoring = (str, char, ignores) => {
  var indexes = [];
  for (var k = 0; k < str.length; k++) {
    if (str[k] == char && !insideSomeRange(k, ignores)) {
      indexes[indexes.length] = k;
    }
  }
  return indexes;
};

module.exports = {
  compareValues,
  compareObjects,
  insideSomeRange,
  getIndexesIgnoring,
  quoteIgnoreRanges,
  addCharsAfterIndexes,
};
