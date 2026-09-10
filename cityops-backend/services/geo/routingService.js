const { CATEGORY_DEPARTMENT } = require("./constants");

function getDepartment(category) {
  return CATEGORY_DEPARTMENT[category] || "General Department";
}

module.exports = {
  getDepartment
};