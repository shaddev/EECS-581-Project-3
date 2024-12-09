/**
Utility Functions Module
A module for utility functions to be used by api handlers. For now, these consist of a distance calculation function to calculate the distance
between any two points on the globe and a function that retrieves the coordinates given an address string
Author: Team 7
Created: 12/08/2024
**/

// Calculate and return distance in km between two points given their coordinates
// Makes use of the Haversine formula to calculate distance
// Input: latitude of first point, longitude of first point, latitude of second point, longitude of second point
// Output: Distance in km
export const distanceCalc = (lat1, lon1, lat2, lon2) => {
    console.log(lat1, lon1, lat2, lon2);
    const r = 6378;
    const lat_1 = lat1 * Math.PI / 180;
    const lat_2 = lat2 * Math.PI / 180;

    const deltaLat = (lat2 - lat1) * Math.PI / 180;
    const deltaLon = (lon2 - lon1) * Math.PI / 180;

    const a1 = Math.sin(deltaLat / 2) ** 2;
    const a2 = Math.cos(lat_1) * Math.cos(lat_2);
    const a3 = Math.sin(deltaLon / 2) ** 2;

    const a = a1 + a2 + a3;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const distance = r * c / 1000;
    return distance;
}

// Retrieve the coordinates (latitude and longitude) of a given address
// Makes use of the Nominatim API (https://nominatim.org/) to find coordinate information
// Input: Address string (of any level of specificity)
// Output: An object {lat, lon}, where lat represents the latitude and lon represents the longitude
// If the address could not be mapped by nominatim, lat and lon will be null
export const getCoords = async (address) => {
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1`;
        console.log("url is", url);
        const response = await fetch(url, {
          method: 'GET',
        });
    
        const data = await response.json();

        if (data.length === 0){
            console.error('Error fetching address details:', error);
            return {lat: null, lon: null}
        }

        return {lat: data[0].lat, lon: data[0].lon}
      } catch (error) {
        console.log("error getting coords", error)
        return {lat: null, lon: null}
    }
}

