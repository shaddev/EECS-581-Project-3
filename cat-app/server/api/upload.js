import { initDb } from '../db';
import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';

export default defineEventHandler(async (event) => {
  const form = formidable({ multiples: true });
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  await fs.mkdir(uploadDir, { recursive: true });

  const userId = getQuery(event).userId || (await readBody(event)).userId;

  return new Promise((resolve, reject) => {
    form.parse(event.req, async (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        reject({ success: false, message: 'File upload failed' });
        return;
      }

      const { title, description, keywords } = fields;
      let file = files.image;

      if (!file) {
        resolve({ success: false, message: 'No file uploaded' });
        return;
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

        resolve({ success: true, message: 'File uploaded successfully' });
      } catch (error) {
        console.error('File upload error:', error);
        reject({ success: false, message: 'File upload failed' });
      }
    });
  });
});