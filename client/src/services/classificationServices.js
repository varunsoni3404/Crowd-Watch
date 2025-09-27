export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Collect available parts
    const parts = [];
    if (data.locality) parts.push(data.locality);
    if (data.city) parts.push(data.city);
    if (data.principalSubdivision) parts.push(data.principalSubdivision);

    return parts.length > 0 ? parts.join(", ") : null;
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    throw error;
  }
};