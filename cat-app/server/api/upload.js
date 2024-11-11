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
      bodyFields[field.name] = {data: field.data, filename: field.filename, type: field.type}
    }
    
  })

  console.log(bodyFields)
  // Extract file data from processed fields
  const file = bodyFields.image;
// Generate unique filename using timestamp
  const newImageFilename = file.filename.split(".").join("-" + Date.now() + ".") // add timestamp to original file name
  // Create complete path for new file
  const newPath = path.join(uploadDir, newImageFilename);
// Extract metadata from form fields
  var { title, description, keywords, userId } = bodyFields;
  keywords=Array.from(new Set(keywords.split(","))).join(",");
  console.log("title is ", title)
  console.log("description is ", description)
  console.log("keywords is ", keywords)
  console.log("userId is ", userId)

  try{
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

  }

  //const userId = getQuery(event).userId || (await readBody(event)).userId;

  // console.log(getQuery(event).userId);
  // console.log(readBody(event).userId);

  // const body = await readBody(event);
  // const { title, description, keywords, userId, image } = body;

  // console.log(userId);

  // return new Promise((resolve, reject) => {
  //   form.parse(req, (err, fields, files) => {
  //     if (err) {
  //       console.error("Error parsing the file:", err);
  //       res.status(500).json({ error: "Error processing file" });
  //       return;
  //     }
  
  //     // Access the file uploaded
  //     const file = files.file;
  //     const oldPath = file.filepath;
  //     const newPath = path.join(uploadDir, file.originalFilename);
  
  //     const { title, description, keywords, userId, image } = fields;
  //     console.log(fields)
  
  //     // Move the file to the 'uploads' directory and process it
  //     fs.rename(oldPath, newPath, (err) => {
  //       if (err) {
  //         console.error("Error moving file:", err);
  //         res.status(500).json({ error: "Error processing file" });
  //         return;
  //       }
  
  //       // File processing code goes here
  //       console.log("File uploaded and moved to:", newPath);
  //       res.status(200).json({ message: "File processed successfully", filename: file.originalFilename });
  //     });
  //   });
  // })
  

  // try {
  //   await fs.rename(file.filepath, filePath);

  //   const db = await initDb();
  //   await db.run(
  //     'INSERT INTO images (userId, title, description, keywords, path) VALUES (?, ?, ?, ?, ?)',
  //     [userId, title, description, keywords, filePath]
  //   );

  //   return ({ success: true, message: 'File uploaded successfully' });
  // } catch (error) {
  //   console.error('File upload error:', error);
  //   return ({ success: false, message: 'File upload failed' });
  // }


  //return {success: true, message: 'File uploaded lmao'}



  // return new Promise((resolve, reject) => {
    /*
    form.parse(event.req, async (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        return ({ success: false, message: 'File upload failed' });
        //return;
      }

      const { title, description, keywords, userId } = fields;
      console.log(userId);
      let file = files.image;

      if (!file) {
        return ({ success: false, message: 'No file uploaded' });
        //return;
      }

      if (Array.isArray(file)) {
        file = file[0];
      }

      console.log('File details:', file);

      const filePath = path.join(uploadDir, file.newFilename || file.originalFilename);

      try {
        await fs.rename(file.filepath, filePath);

        const db = await initDb();
        await db.run(
          'INSERT INTO images (userId, title, description, keywords, path) VALUES (?, ?, ?, ?, ?)',
          [userId, title, description, keywords, filePath]
        );

        return ({ success: true, message: 'File uploaded successfully' });
      } catch (error) {
        console.error('File upload error:', error);
        return ({ success: false, message: 'File upload failed' });
      }
    });
    */
  // });
});