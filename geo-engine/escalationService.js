function getEscalationLevel(priority) {

  if (priority > 8) {
    return {
      escalated: true,
      level: "URGENT"
    };
  }

  if (priority >= 5) {
    return {
      escalated: false,
      level: "HIGH"
    };
  }

  return {
    escalated: false,
    level: "NORMAL"
  };
}

module.exports = {
  getEscalationLevel
};