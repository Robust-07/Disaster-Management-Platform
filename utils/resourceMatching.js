const EARTH_RADIUS_KM = 6371;

const getDistanceKm = ([lon1, lat1], [lon2, lat2]) => {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

const scoreResourceMatch = (resource, request) => {
  let score = 0;

  const stillNeeded = request.quantityNeeded - request.quantityFulfilled;
  if (resource.quantity >= stillNeeded) {
    score += 40; // fully covers the request
  } else {
    score += 20 * (resource.quantity / stillNeeded); // partial coverage, scaled
  }

  // Distance — closer is better, max 30 points, tapering off after 50km
  const distanceKm = getDistanceKm(
    resource.location.coordinates,
    request.location.coordinates
  );
  score += Math.max(30 - distanceKm * 0.6, 0);

  // Transport availability — matters more the further away it is
  if (resource.transportAvailable) score += 20;

  // Type must match exactly — hard filter, not scored (handled in the query)

  return { score: Math.round(score), distanceKm: Math.round(distanceKm * 10) / 10 };
};

module.exports = { scoreResourceMatch, getDistanceKm };