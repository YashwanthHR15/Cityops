const {
  resolveWardAndDepartment
} = require("./geoService");

const result =
  resolveWardAndDepartment(
    12.9716,
    77.5946,
    "Pothole",
    2
  );

console.log(result);