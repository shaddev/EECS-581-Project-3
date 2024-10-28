import { initDb } from '../db';

export default defineEventHandler(async (event) => {
  const db = await initDb();

  const username = getQuery(event).username;

  try {

    const likedPictures = await db.all(
      'SELECT * FROM images i JOIN likes l on i.id = l.imageId WHERE userId = (SELECT id from users where username = ? )',
      [username]
    );

    return {
      success: true,
      likedPictures
    };
  } catch (error) {
    console.error('Error fetching liked feed data:', error);
    return {
      success: false,
      message: 'Error fetching liked feed data'
    };
  }
});