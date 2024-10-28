import { initDb } from '../db';
import { promises as fs } from 'fs';
import path from 'path';
import * as formidable from 'formidable';

export default defineEventHandler(async event => {
  const form = new formidable.IncomingForm();
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  await fs.mkdir(uploadDir, { recursive: true });

  const fields = await readMultipartFormData(event);
  //console.log(fields)

  const bodyFields = {}


  fields.forEach(field=> {
    if (field.name !== 'image'){
      bodyFields[field.name] = field.data.toString()
    } else {
      bodyFields[field.name] = {data: field.data, filename: field.filename, type: field.type}
    }
    
  })

  console.log(bodyFields)

  // Access the file uploaded
  const file = bodyFields.image;

  const newImageFilename = file.filename.split(".").join("-" + Date.now() + ".") // add timestamp to original file name
  
  const newPath = path.join(uploadDir, newImageFilename);

  const { title, description, keywords, userId } = bodyFields;
  console.log("title is ", title)

  try{
    await fs.writeFile(newPath, file.data)
    const db = await initDb();
      await db.run(
        'INSERT INTO images (userId, title, description, keywords, path) VALUES (?, ?, ?, ?, ?)',
        [userId, title, description, keywords, newImageFilename]
      );
  } catch (err) {
    console.log(err);

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