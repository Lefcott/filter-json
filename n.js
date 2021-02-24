const { filter, configure } = require(".");

configure({ prefix: "_" });

const bills = [
  {
    first_expiration_on: "2020-10-30T00:00:00.000-03:00",
  },
  {
    first_expiration_on: "2021-03-30T00:00:00.000-03:00",
  },
];

const object_filter = {
  first_expiration_on: {
    _transform: "date => new Date(date) - new Date()",
    _gte: 0,
  },
};

const filtered_bills = filter(bills, object_filter);

console.log(filtered_bills);
