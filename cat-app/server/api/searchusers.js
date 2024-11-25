/**
 * Search Users API Handler
 * 
 * An API endpoint handler that retrieves all users whose usernames match a given substring
 * Author: Team 7
 * Created:11/10/2024
 **/

import { initDb } from '../db';

export default defineEventHandler(async (event) => {
   // Initialize database connection
  const db = await initDb();

  const {username} = getQuery(event);
  const patternMatch = `%${username}%`;

  try {
    // Query to fetch all users that liked a specific post

    const users = await db.all(
    `SELECT u.id as id, u.username as username, u.address as address, u.description as description from users u WHERE u.username LIKE ?`,
      [patternMatch]
    );

     // Return successful response
    return {
      success: true,
      users
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