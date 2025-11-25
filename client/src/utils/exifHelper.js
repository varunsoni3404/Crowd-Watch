import exifr from 'exifr';

export const extractLocationFromImage = async (file) => {
  try {
    // Parse GPS data from image
    const gps = await exifr.gps(file);
    
    if (gps && gps.latitude && gps.longitude) {
      return {
        latitude: gps.latitude,
        longitude: gps.longitude,
        hasGPS: true
      };
    } else {
      return {
        latitude: null,
        longitude: null,
        hasGPS: false
      };
    }
  } catch (error) {
    console.error('Error reading EXIF data:', error);
    return {
      latitude: null,
      longitude: null,
      hasGPS: false
    };
  }
};  