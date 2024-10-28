import { initDb } from '../db';

export default defineEventHandler(async (event) => {


  const db = await initDb();

  const username = getQuery(event).username;

  try {
    const userPictures = await db.all(
      'SELECT * FROM images WHERE userId = (SELECT id from users where username = ?)',
      [username]
    );

    const globalPictures = await db.all(
      'SELECT * FROM images WHERE userId != (SELECT id from users where username = ?)?',
      [username]
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