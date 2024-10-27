import { initDb } from '../db';

export default defineEventHandler(async (event) => {
  const db = await initDb();

  const userId = getQuery(event).userId || (await readBody(event)).userId;

  try {
    const userPictures = await db.all(
      'SELECT * FROM images WHERE userId = ?',
      [userId]
    );

    const globalPictures = await db.all(
      'SELECT * FROM images WHERE userId != ?',
      [userId]
    );

    return {
      success: true,
      userPictures,
      globalPictures
    };
  } catch (error) {
    console.error('Error fetching feed data:', error);
    return {
      success: false,
      message: 'Error fetching feed data'
    };
  }
});