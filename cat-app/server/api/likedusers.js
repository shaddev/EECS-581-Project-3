/**
 * Liked Pictures API Handler
 * 
 * An API endpoint handler that retrieves all users that liked a specific image,
 * Author: Team 7
 * Created:11/10/2024
 
 * Preconditons: 
 * Valid database connection must be available
 *   - Input:
 *     - postId (string): Valid postid passed as query parameter
 *     - Must be URL-encoded if contains special characters
 *   - Database tables 'users', 'images', and 'likes' must exist
 
 * Postconditions:Returns JSON object with:
 *     - success (boolean): Indicating operation status
 *     - likedUsers (array): Array of users if successful
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

  const postId = getQuery(event).postId;

  console.log('here', postId);

  try {
    // Query to fetch all users that liked a specific post

    const likedUsers = await db.all(
    `SELECT u.id as id, u.username as username FROM likes l JOIN users u ON l.userId = u.id WHERE l.imageId = ?`,
      [postId]
    );

    console.log('here lol', likedUsers);

     // Return successful response with liked pictures
    return {
      success: true,
      likedUsers
    };
  } catch (error) {
    console.error('Error fetching liked users data:', error);
    // Return error response to client
    return {
      success: false,
      message: 'Error fetching liked users data'
    };
  }
});