function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}

function checkDuplicate(
  existingComplaints,
  category,
  lat,
  lng
) {

  const duplicates =
    existingComplaints.filter(
      complaint => {

        const sameCategory =
          complaint.category === category;

        const distance =
          calculateDistance(
            lat,
            lng,
            complaint.lat,
            complaint.lng
          );

        return (
          sameCategory &&
          distance <= 100
        );
      }
    );

  return {
    duplicateCount: duplicates.length,
    isDuplicate: duplicates.length > 0
  };
}

module.exports = {
  checkDuplicate
};