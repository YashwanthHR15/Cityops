const { checkDuplicate } = require("./duplicateService");
const { calculatePriority } = require("./priorityService");
const { getEscalationLevel } = require("./escalationService");

function getSmartPriority(
  complaints,
  category
) {
  const duplicateInfo =
    checkDuplicate(
      complaints,
      category
    );

  const priority =
    calculatePriority(
      category,
      duplicateInfo.duplicateCount
    );

  const escalation =
    getEscalationLevel(priority);

  return {
    priority,
    ...duplicateInfo,
    ...escalation
  };
}

module.exports = {
  getSmartPriority
};