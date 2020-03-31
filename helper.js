const compareValues = (value1, operator, value2) => {
  switch (operator) {
    case '$exists':
      return value1 !== undefined === value2;
    case '$eq':
      return value1 === value2;
    case '$gt':
      return value1 > value2;
    case '$gte':
      return value1 >= value2;
    case '$lt':
      return value1 < value2;
    case '$lte':
      return value1 <= value2;
    case '$in':
      return value2 && value2.includes && value2.includes(value1);
    case '$nin':
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
