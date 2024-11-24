/**
 * Get Profile API Handler
 * 
 * An API endpoint handler that retrieves all users that liked a specific image,
 * Author: Team 7
 * Created:11/10/2024
 **/

import { initDb } from '../db';

export default defineEventHandler(async (event) => {
   // Initialize database connection
  const db = await initDb();

  const {username} = getQuery(event);

  try {
    // Query to fetch all users that liked a specific post

    const profile = await db.all(
    `SELECT u.username as username, u.address as address, u.description as description from users u WHERE u.username = ?`,
      [username]
    );

    const userImages = await db.all(
      `SELECT i.id AS id, i.userId as userId, i.title AS title, i.description AS description, i.keywords AS keywords, i.path as path
      , CASE WHEN l.userId IS NOT NULL THEN TRUE ELSE FALSE END AS liked, COUNT(l.imageId) AS likes, u.username as username
      FROM images i LEFT JOIN likes l ON i.id = l.imageId
      JOIN users u ON i.userId = u.id WHERE u.username=? GROUP BY i.id`,
      [username]
    );

     // Return successful response
    return {
      success: true,
      profile,
      userImages
    };
  } catch (error) {
    console.error('Error fetching profile data:', error);
    // Return error response to client
    return {
      success: false,
      message: 'Error fetching profile data'
    };
  }
});