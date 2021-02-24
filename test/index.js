let logOccurred = false;
console.log = () => {
  logOccurred = true;
};

const checkResult =
  require("./checkJsonCondition") &&
  require("./filter") &&
  require("./aggregate") &&
  require("./compareN") &&
  require("./parse");
const result = checkResult && !logOccurred;

if (logOccurred) console.error("Checks failed, console.log is not allowed!");
if (result === true) console.debug("Checks passed!");

module.exports = result;
