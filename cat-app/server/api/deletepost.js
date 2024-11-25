/**
 * Edit Profile API Handler
 * 
 * An API endpoint handler that handles editing profiles
 * Author: Team 7
 * Created:11/10/2024
 **/

import { initDb } from '../db';
import { promises as fs } from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
   // Initialize database connection
  const db = await initDb();

  const body = await readBody(event);
  const { id } = body; // post id

  console.log(`deleting post id ${id}`);



  try {

    const image = await db.get(`SELECT * FROM images WHERE id = ?`,
        [id]
    );
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filename = image.path;
    const deletePath = path.join(uploadDir, filename);
    await fs.rm(deletePath);

    await db.run(
    `DELETE FROM likes WHERE imageId = ?`,
      [id]
    );

    await db.run(
    `DELETE FROM images WHERE id = ?`,
    [id]
    );

     // Return successful response
     return { success: true, message: 'Image deleted successfully' };
  } catch (error) {
    console.error('Error deleting image:', error);
    // Return error response to client
    return { success: false, message: 'Image deletion failed' };
  }
});