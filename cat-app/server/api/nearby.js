`
Feed of nearby pictures
`

import { initDb } from '../db';
import { distanceCalc, getCoords } from '../util';

// calculate distance between 2 points using Haversine formula
// const distanceCalc = (lat1, lon1, lat2, lon2) => {
//     console.log(lat1, lon1, lat2, lon2);
//     const r = 6378;
//     const lat_1 = lat1 * Math.PI / 180;
//     const lat_2 = lat2 * Math.PI / 180;

//     const deltaLat = (lat2 - lat1) * Math.PI / 180;
//     const deltaLon = (lon2 - lon1) * Math.PI / 180;

//     const a1 = Math.sin(deltaLat / 2) ** 2;
//     const a2 = Math.cos(lat_1) * Math.cos(lat_2);
//     const a3 = Math.sin(deltaLon / 2) ** 2;

//     const a = a1 + a2 + a3;

//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

//     const distance = r * c / 1000;
//     return distance;
// }

export default defineEventHandler(async (event) => {

  const NEARBY_DISTANCE = 20; // anything within 20 km is considered 'nearby'

  const db = await initDb();

  const username = getQuery(event).username;

  console.log(`Fetching nearby posts for ${username}`)

  try {

    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    const userAddress = user.address;

    // return all pictures if user does not have address specified
    if (userAddress === null || userAddress === undefined || typeof userAddress !== 'string') {
        return {
            success: true,
            globalPictures
        };
    }

    const userCoords = await getCoords(userAddress);
    const userLat = userCoords.lat;
    const userLon = userCoords.lon;

    if (userLat === null || userLon === null){
        console.error('Error fetching user address details:', error);
        return {success: false}
    }

    // try {
    //     const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(userAddress)}&format=json&addressdetails=1`;
    //     console.log("url is", url);
    //     const response = await fetch(url, {
    //       method: 'GET',
    //     });
    
    //     const data = await response.json();
    //     //console.log('Response Data:', data);

    //     if (data.length === 0){
    //         console.error('Error fetching address details:', error);
    //         return {success: false}
    //     }

    //     userLat = data[0].lat;
    //     userLon = data[0].lon;

    //     console.log("User lat & lon", userLat, userLon);
    //   } catch (error) {
    //     console.error('Error fetching user address details:', error);
    //     return {success: false}
    // }



    const globalPictures = await db.all(
        `SELECT i.id AS id, i.userId as userId, i.title AS title, i.description AS description, i.keywords AS keywords, i.path as path
        , CASE WHEN l.userId IS NOT NULL THEN TRUE ELSE FALSE END AS liked, COUNT(l.imageId) AS likes, u.username as username, u.address as address
        FROM images i LEFT JOIN likes l ON i.id = l.imageId
        JOIN users u ON i.userId = u.id WHERE i.userId != (SELECT id from users where username = ?) GROUP BY i.id`,
        [username]
      );

    const nearbyPosts = [];

    for (const picture of globalPictures) {
        let address = picture.address;

        if (address === null || address === undefined || typeof address !== 'string') {
            continue;
        }

        let coords = await getCoords(address);
        let lat = coords.lat;
        let lon = coords.lon;

        if (lat === null || lon === null){
            continue;
        }

        let distance = distanceCalc(lat, lon, userLat, userLon);
        console.log("distance is", distance)

        if (distance <= NEARBY_DISTANCE){
            nearbyPosts.push(picture);
        }
    }

    console.log("nearby posts are", nearbyPosts);

    return {
      success: true,
      nearbyPosts
    };
  } catch (error) {
    console.error('Error fetching feed data:', error);
    return {
      success: false,
      message: 'Error fetching feed data'
    };
  }
});