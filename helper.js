const compareValues = (value1, operator, value2, prefix) => {
  switch (operator) {
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

module.exports = { compareValues };
