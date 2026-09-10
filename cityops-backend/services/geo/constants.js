const CATEGORY_SEVERITY = {
  "Pothole": 3,
  "Damaged Streetlights": 2,
  "Drainage/Waterlogging": 4,
  "Water Leaks": 4,
  "Garbage Overflow": 2,
  "Broken Public Assets": 3,
  "Unsafe Public Spaces": 5
};

const CATEGORY_DEPARTMENT = {
  "Pothole": "BBMP Roads Wing",
  "Damaged Streetlights": "BESCOM",
  "Drainage/Waterlogging": "BBMP Storm Water Drain",
  "Water Leaks": "BWSSB",
  "Garbage Overflow": "BBMP SWM",
  "Broken Public Assets": "BBMP General Works",
  "Unsafe Public Spaces": "BBMP General Works"
};

module.exports = {
  CATEGORY_SEVERITY,
  CATEGORY_DEPARTMENT
};