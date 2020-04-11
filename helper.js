
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

const compareValues = (obj, value1, operator, value2, prefix) => {
  const value2Split = typeof value2 === 'string' && value2.split('.');
  switch (operator) {
    case `${prefix}field`:
      for (let k = 0; k < value2Split.length; k += 1) obj = obj[value2Split[k]];
      return compareObjects(value1, obj);
    case `${prefix}exists`:
      return value1 !== undefined === value2;
    case `${prefix}eq`:
      return value1 === value2;
    case `${prefix}gt`:
      return value1 > value2;
    case `${prefix}gte`:
      return value1 >= value2;
    case `${prefix}lt`:
      return value1 < value2;
    case `${prefix}lte`:
      return value1 <= value2;
    case `${prefix}in`:
      return value2 && value2.includes && value2.includes(value1);
    case `${prefix}nin`:
      return !value2 || !value2.indexOf ? true : value2.indexOf(value1) === -1;
    default:
      console.error(
        `object.js: Unknown operator "${operator}"\n\nCompared value:\n${JSON.stringify(
          value1,
          null,
          2
        )}\n\nExpression:\n"${operator}" "${value2}"`
      );
      return false;
  }
};

module.exports = { compareValues, compareObjects };
