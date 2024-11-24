/**
 * Liked Pictures API Handler
 * 
 * An API endpoint handler that retrieves all images liked by a specific user,
 * identified by their username.
 * Author: Team 7
 * Created:10/27/2024
 
 * Preconditons: 
 * Valid database connection must be available
 *   - Input:
 *     - username (string): Valid username passed as query parameter
 *     - Must be URL-encoded if contains special characters
 *   - Database tables 'users', 'images', and 'likes' must exist
 
 * Postconditions:Returns JSON object with:
 *     - success (boolean): Indicating operation status
 *     - likedPictures (array): Array of image objects if successful
 *     - message (string): Error message if unsuccessful
 
 * Errors: Database query errors
 *   - Invalid username parameter
 *   - Connection errors
 * SideEffects: Logs errors to console in case of failure
 *   - Creates and closes database connection
 * Invariants: Query results maintain referential integrity between users and images
 *   - Response structure remains consistent regardless of success/failure
 **/


import { initDb } from '../db';

export default defineEventHandler(async (event) => {
   // Initialize database connection
  const db = await initDb();

  const username = getQuery(event).username;

  try {
    // Query to fetch all images liked by the specified user
    // Uses JOIN to combine image data with likes and subquery to resolve username to userId

    const likedPictures = await db.all(
      `SELECT i.id AS id, i.userId as userId, i.title AS title, i.description AS description, i.keywords AS keywords, i.path as path
      , CASE WHEN l.userId IS NOT NULL THEN TRUE ELSE FALSE END AS liked, COUNT(l.imageId) AS likes, ? as username
      FROM images i JOIN likes l ON i.id = l.imageId WHERE l.userId = (SELECT id from users where username = ?)
      GROUP BY i.id`,
      [username, username]
    );

    // SELECT i.id AS id, i.userId as userId, i.title AS title, i.description AS description, i.keywords AS keywords, i.path as path, CASE WHEN l.userId IS NOT NULL THEN TRUE ELSE FALSE END AS liked, COUNT(l.imageId) AS likes FROM images i JOIN likes l ON i.id = l.imageId WHERE l.userId = (SELECT id from users where username = 'shad') GROUP BY i.id

     // Return successful response with liked pictures
    return {
      success: true,
      likedPictures
    };
  } catch (error) {
    console.error('Error fetching liked feed data:', error);
    // Return error response to client
    return {
      success: false,
      message: 'Error fetching liked feed data'
    };
  }
});