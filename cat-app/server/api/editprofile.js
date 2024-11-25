/**
 * Edit Profile API Handler
 * 
 * An API endpoint handler that handles editing profiles
 * Author: Team 7
 * Created:11/10/2024
 **/

import { initDb } from '../db';

export default defineEventHandler(async (event) => {
   // Initialize database connection
  const db = await initDb();

  const body = await readBody(event);
  const { username, description, address } = body;

  console.log(`Editing ${username} - description ${description}, address ${address}`)

  try {

    await db.run(
    `UPDATE users SET address = ?, description = ? WHERE username = ?`,
      [address, description, username]
    );

     // Return successful response
     return { success: true, message: 'Profile edited successfully' };
  } catch (error) {
    console.error('Error editing profile data:', error);
    // Return error response to client
    return { success: false, message: 'Profile edit failed' };
  }
});