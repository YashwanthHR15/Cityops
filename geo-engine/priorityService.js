const { CATEGORY_SEVERITY } = require("./constants");

function calculatePriority(category, duplicateCount = 0) {
  const severity = CATEGORY_SEVERITY[category] || 1;

  return severity + duplicateCount;
}

module.exports = {
  calculatePriority
};