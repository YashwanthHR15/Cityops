const { resolveWard } = require("./wardResolver");
const { getDepartment } = require("./routingService");
const { calculatePriority } = require("./priorityService");

function resolveWardAndDepartment(
  lat,
  lng,
  category,
  duplicateCount = 0
) {
  const wardInfo = resolveWard(lat, lng);

  const department = getDepartment(category);

  const priority = calculatePriority(
    category,
    duplicateCount
  );

  return {
    ward: wardInfo.ward,
    zone: wardInfo.zone,
    department,
    priority
  };
}

module.exports = {
  resolveWardAndDepartment
};