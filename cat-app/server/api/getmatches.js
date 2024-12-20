/**
 * Get Matches API Handler
 * 
 * An API endpoint handler that retrieves matches based on mutual likes.
 * Matches are usernames of users who have liked a post by some user and
 * some user likes their post.
 * 
 * Author: Team 7
 * Created: 11/10/2024
 * 
 * preconditions
 *   - Request must contain:
 *     - username (string): The username to find matches for
 *   - Database must be accessible
 *   - Tables must exist:
 *     - users (id INTEGER, username TEXT)
 *     - images (id INTEGER, userId INTEGER)
 *     - likes (userId INTEGER, imageId INTEGER)
 * 
 * postconditions
 *   - Returns JSON object with:
 *     - success (boolean): Result status
 *     - matches (array): Array of match objects with metadata
 *     - message (string): Status message if search fails
 * 
 * errors
 *   - Database errors (e.g., query failures)
 *   - Invalid or missing query parameter
 *   - Database connection errors
 * 
 * sideEffects
 *   - Creates and closes database connection
 * 
 * invariants
 *   - Matches are based on mutual likes
 **/


import { initDb } from '../db';
import { getCoords, distanceCalc } from '../util';

export default defineEventHandler(async event => {
  const db = await initDb();
  const { username } = getQuery(event);

  if (!username) {
    return {
      success: false,
      message: 'Username is required'
    };
  }

  try {
    const usersSchema = await db.all('PRAGMA table_info(users)');
    const imagesSchema = await db.all('PRAGMA table_info(images)');
    const likesSchema = await db.all('PRAGMA table_info(likes)');
    // console.log('Users table schema:', JSON.stringify(usersSchema, null, 2));
    // console.log('Images table schema:', JSON.stringify(imagesSchema, null, 2));
    // console.log('Likes table schema:', JSON.stringify(likesSchema, null, 2));

    const user = await db.get('SELECT id, address FROM users WHERE username = ?', [username]);
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    const userId = user.id;
    console.log(`User ID for username ${username}: ${userId}`);

    const likedByUser = await db.all(`
      SELECT l1.imageId, i1.userId AS likedUserId
      FROM likes l1
      JOIN images i1 ON l1.imageId = i1.id
      WHERE l1.userId = ?
    `, [userId]);
    console.log(`Images liked by user ID ${userId}:`, JSON.stringify(likedByUser, null, 2));

    const likedByOthers = await db.all(`
      SELECT l2.userId AS likedByUserId, l2.imageId
      FROM likes l2
      JOIN images i2 ON l2.imageId = i2.id
      WHERE i2.userId = ?
    `, [userId]);
    console.log(`Images liked by others for user ID ${userId}:`, JSON.stringify(likedByOthers, null, 2));

    console.log("Now, we need to find mutual likes...");
    const matchesQuery = `
    SELECT DISTINCT u2.username AS matchUsername, 
                    u2.id AS matchId,
                    i2.title AS matchTitle, 
                    i2.description AS matchDescription, 
                    i2.path AS matchPath
    FROM likes l1
    JOIN images i1 ON l1.imageId = i1.id
    JOIN users u1 ON i1.userId = u1.id
    JOIN likes l2 ON l1.userId = l2.userId
    JOIN images i2 ON l2.imageId = i2.id
    JOIN users u2 ON i2.userId = u2.id
    WHERE l1.userId = ?
    AND l2.userId = ?
    AND l1.imageId = l2.imageId;

        `;
    
    console.log("Executing query for matches with parameters:", userId, userId);
    
    const matches = await db.all(matchesQuery, [userId, userId]);


    // now get matches based on closeness
    const NEARBY_DISTANCE = 20;
    const userAddress = user.address;
    var nearbyUsers = [];

    if (userAddress !== null && userAddress !== undefined && typeof userAddress === 'string'){
      const userCoords = await getCoords(userAddress);
      const userLat = userCoords.lat;
      const userLon = userCoords.lon;

      if (userLat !== null && userLon !== null){
        const otherUsers =  await db.all('SELECT * FROM users WHERE id != ?', [userId]);

        for (const otherUser of otherUsers){
          let address = otherUser.address;
          if (address === null || address === undefined || typeof address !== 'string'){
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
            nearbyUsers.push(otherUser.id);
          }
        }
      }
    }

    console.log('Nearby users are', nearbyUsers);

    const matchUserIds = matches.map((match) => match.matchId);
    nearbyUsers = nearbyUsers.filter((id) => ! matchUserIds.includes(id));

    if (nearbyUsers.length > 0){

      const qMarksString = '(' + nearbyUsers.map(() => '?').join(', ') + ')';
      const nearbyPosts = await db.all(`SELECT DISTINCT u.username AS matchUsername, 
                    u.id AS matchId,
                    i.title AS matchTitle, 
                    i.description AS matchDescription, 
                    i.path AS matchPath
                    FROM users u
                    JOIN images i on u.id = i.userId
                    WHERE u.id in ${qMarksString}`, nearbyUsers);
      
      console.log("Nearby posts are", nearbyPosts);

      matches.push(...nearbyPosts);
    }

    if (matches.length === 0) {
      console.log('No mutual likes / nearby users found.');
    } else {
      console.log('Found matches:', JSON.stringify(matches, null, 2));
    }

    return {
      success: true,
      matches
    };
  } catch (error) {
    console.error('Error fetching matches:', error);
    return {
      success: false,
      message: 'Error fetching matches'
    };
  }
});
