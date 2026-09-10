const { checkDuplicate } =
require("./duplicateService");

const complaints = [
  {
    category: "Pothole",
    lat: 12.9350,
    lng: 77.6240
  },
  {
    category: "Pothole",
    lat: 12.9353,
    lng: 77.6242
  },
  {
    category: "Pothole",
    lat: 12.9800,
    lng: 77.6500
  }
];

console.log(
  checkDuplicate(
    complaints,
    "Pothole",
    12.9351,
    77.6241
  )
);