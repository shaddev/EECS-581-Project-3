/**
 * User Registration API Handler
 * 
 * An API endpoint handler that creates new user accounts by storing
 * usernames and securely hashed passwords in the database.
 * 
 * Author: Team 7
 * Created: 10/27/2024
 * 
 * preconditions
 *   - Request body must contain:
 *     - username (string): Desired username
 *     - password (string): Plain text password to be hashed
 *   - Database must be accessible
 *   - Users table must exist with columns:
 *     - username (TEXT UNIQUE)
 *     - password (TEXT)
 * 
 * postconditions
 *   - Returns JSON object with:
 *     - success (boolean): Registration result
 *     - message (string): Status message
 *   - If successful, creates new user record in database
 * 
 * errors
 *   - Database errors (e.g., duplicate username)
 *   - Invalid request body format
 *   - Bcrypt hashing failures
 *   - Database connection errors
 * 
 * sideEffects
 *   - Creates new user record in database
 *   - Creates and closes database connection
 *   - CPU usage for password hashing
 * 
 * invariants
 *   - Passwords are always hashed before storage
 *   - Username uniqueness is enforced by database
 *   - Consistent bcrypt work factor (10 rounds)
 **/

import bcrypt from 'bcrypt';
import { initDb } from '../db';

export default defineEventHandler(async (event) => {
  // Extract registration credentials from request body
  const body = await readBody(event);
  const { username, password } = body;
 // Hash password with bcrypt using 10 rounds of salt
  const hashedPassword = await bcrypt.hash(password, 10);
  // Initialize database connection
  const db = await initDb();

  try {
    // Attempt to insert new user record
    // Username uniqueness is enforced by database UNIQUE constraint
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
     // Return success response if insert succeeds
    return { success: true, message: 'User registered successfully' };
  } catch (error) {
    return { success: false, message: 'User registration failed' };
  }
});