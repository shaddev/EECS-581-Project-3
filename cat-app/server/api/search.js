/**
 * Image Upload API Handler
 * 
 * An API endpoint handler that processes multipart form data to upload images
 * and store their metadata in the database. Handles both file system operations
 * and database updates.
 * Author: Team 7
 * Date created: 10/27/2024
 * preconditions
 *   - Multipart form data must contain:
 *     - image (File): The image file to upload
 *     - title (string): Image title
 *     - description (string): Image description
 *     - keywords (string): Image keywords
 *     - userId (string): Username of uploading user
 *   - Database must be accessible
 *   - Write permissions for upload directory
 * 
 * postconditions
 *   - Returns JSON object with:
 *     - success (boolean): Upload result
 *     - message (string): Status message
 *   - If successful:
 *     - Creates image file in uploads directory
 *     - Creates image record in database
 * 
 * errors
 *   - File system errors (permissions, disk space)
 *   - Database errors
 *   - Invalid form data
 *   - Invalid user ID
 * 
 * sideEffects
 *   - Creates file in uploads directory
 *   - Creates database record
 *   - Creates upload directory if it doesn't exist
 * 
 * invariants
 *   - File names are unique via timestamp addition
 *   - Upload directory structure is maintained
 *   - Database records match stored files
 * 
 * knownFaults
 *   - No file type validation
 *   - No file size limits
 *   - No cleanup of failed uploads
 *   - Generic error message doesn't specify failure reason
 **/

import { initDb } from '../db';
import { promises as fs } from 'fs';
import path from 'path';
import * as formidable from 'formidable';

export default defineEventHandler(async event => {
  // Initialize formidable for handling multipart form data
  const form = new formidable.IncomingForm();
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
// Set up upload directory path in public/uploads
  await fs.mkdir(uploadDir, { recursive: true });
 // Read multipart form data from request
  const fields = await readMultipartFormData(event);
  //console.log(fields)
// Process form fields into more manageable object
  const bodyFields = {}

// Separate image data from other fields
  fields.forEach(field=> {
    if (field.name !== 'image'){
      bodyFields[field.name] = field.data.toString()
    } else {
      bodyFields[field.name] = {data: field.data}
    }
    
  })

  console.log(bodyFields)
// Extract metadata from form fields
  var { keywords } = bodyFields;
  keywords=Array.from(new Set(keywords.split(","))).join(",");
  console.log("keywords is ", keywords)

  /*try{
     // Write file to upload directory
    await fs.writeFile(newPath, file.data)
    // Initialize database connection
    const db = await initDb();
    // Insert image metadata into database
    // Uses subquery to get user ID from username
      await db.run(
        'INSERT INTO images (userId, title, description, keywords, path) VALUES ((SELECT id FROM users WHERE username = ?), ?, ?, ?, ?)',
        [userId, title, description, keywords, newImageFilename]
      );
      // Return success response
    return { success: true, message: 'File uploaded successfully' };
  } catch (err) {
    console.log(err);
    return { success: false, message: 'File upload filed' };

  }*/
});