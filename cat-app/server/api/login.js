/**
 * User Login API Handler
 * 
 * An API endpoint handler that authenticates users by verifying their username
 and password against stored credentials in the database.

Author: Team 7
Created: 10/27/2024
preconditions
 *   - Request body must contain:
 *     - username (string): User's username
 *     - password (string): User's plain text password
 *   - Database must be accessible
 *   - Users table must exist with columns:
 *     - username (TEXT)
 *     - password (TEXT): Bcrypt hashed password
 * 
 *  postconditions
 *   - Returns JSON object with:
 *     - success (boolean): Authentication result
 *     - message (string): Status message
 * 
 *   errors
 *   - Database query errors
 *   - Invalid request body format
 *   - Bcrypt comparison errors
 * 
 * sideEffects
 *   - Creates and closes database connection
 *   - No permanent state changes
 * 
 * invariants
 *   - Password comparison is timing-safe (via bcrypt)
 *   - Error messages don't reveal whether username or password was incorrect
 * 
 **/

import bcrypt from 'bcrypt';
import { initDb } from '../db';

export default defineEventHandler(async (event) => {
   // Extract username and password from request body
  const body = await readBody(event);
  const { username, password } = body;
// Initialize database connection
  const db = await initDb();
  // Query database for user with matching username
  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
 // Verify password if user exists using secure bcrypt comparison
  if (user && (await bcrypt.compare(password, user.password))) {
     // Return success response for valid credentials
    return { success: true, message: 'Login successful' };
  } else {
    return { success: false, message: 'Invalid username or password' };
  }
});