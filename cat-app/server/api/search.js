/**
 * Image Search API Handler
 * 
 * An API endpoint handler that retrieves image records from the database
 * based on a search keyword provided as a query parameter.
 * 
 * Author: Team 7
 * Created: 11/10/2024
 * 
 * preconditions
 *   - Request must contain:
 *     - keyword (string): The search keyword to filter images
 *   - Database must be accessible
 *   - Images table must exist with columns:
 *     - id (INTEGER)
 *     - userId (INTEGER)
 *     - title (TEXT)
 *     - description (TEXT)
 *     - keywords (TEXT)
 *     - path (TEXT)
 * 
 * postconditions
 *   - Returns JSON object with:
 *     - success (boolean): Search result status
 *     - images (array): Array of image records matching the keyword
 *     - message (string): Status message if search fails
 *   - If successful, retrieves image records from the database that match the keyword
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
 *   - Keyword search is performed using SQL LIKE operator
 *   - Images are filtered based on the provided keyword
 **/

import { initDb } from '../db';

export default defineEventHandler(async event => {
  const db = await initDb();
  const { keyword } = getQuery(event);

  if (!keyword) {
    return {
      success: false,
      message: 'Keyword is required'
    };
  }

  try {
    const images = await db.all(
      `SELECT * FROM images WHERE keywords LIKE ?`,
      [`%${keyword}%`]
    );

    return {
      success: true,
      images
    };
  } catch (error) {
    console.error('Error fetching images:', error);
    return {
      success: false,
      message: 'Error fetching images'
    };
  }
});