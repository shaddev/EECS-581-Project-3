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

    const user = await db.get('SELECT id FROM users WHERE username = ?', [username]);
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



    if (matches.length === 0) {
      console.log('No mutual likes found.');
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
