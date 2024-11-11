/**
 * Chat Messages API Handler
 * 
 * An API endpoint handler that retrieves all users that liked a specific image,
 * Author: Team 7
 * Created:11/10/2024
 **/

import { initDb } from '../db';

export default defineEventHandler(async (event) => {
   // Initialize database connection
  const db = await initDb();

  const {sourceUsername, receivingUsername} = getQuery(event);
  console.log('usernames are ', sourceUsername, receivingUsername)

  try {
    // Query to fetch all users that liked a specific post

    const sourceUserIdQuery = await db.all(
    `SELECT u.id from users u WHERE u.username = ?`,
      [sourceUsername]
    );

    console.log("source is ", sourceUserIdQuery);
    const sourceUserId = sourceUserIdQuery[0].id;

    const receivingUserIdQuery = await db.all(
        `SELECT u.id from users u WHERE u.username = ?`,
          [receivingUsername]
        );
    const receivingUserId = receivingUserIdQuery[0].id;

    console.log('id messages', sourceUserId, receivingUserId);


    const messages = await db.all(
        `SELECT * FROM chat c WHERE (c.sourceUserId = ? AND c.receivingUserId = ?) OR (c.sourceUserId = ? AND c.receivingUserId = ?)
            ORDER BY c.sentTime`,
          [sourceUserId, receivingUserId, receivingUserId, sourceUserId]
        );

        console.log('messages are ', messages)

     // Return successful response
    return {
      success: true,
      messages,
      sourceUserId
    };
  } catch (error) {
    console.error('Error fetching messages data:', error);
    // Return error response to client
    return {
      success: false,
      message: 'Error fetching messages data'
    };
  }
});