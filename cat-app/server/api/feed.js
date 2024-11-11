`
Get the feed
Both user pictures and global pictures (pictures not uploaded by the user)
include whether each post has been liked by the user or not
`

import { initDb } from '../db';

export default defineEventHandler(async (event) => {


  const db = await initDb();

  const username = getQuery(event).username;

  console.log(username)

  try {
    const userPictures = await db.all(
      `SELECT i.id AS id, i.userId as userId, i.title AS title, i.description AS description, i.keywords AS keywords, i.path as path
      , CASE WHEN l.userId IS NOT NULL THEN TRUE ELSE FALSE END AS liked, COUNT(l.imageId) AS likes
      FROM images i LEFT JOIN likes l ON i.id = l.imageId WHERE i.userId = (SELECT id from users where username = ?) GROUP BY i.id`,
      [username]
    );

    const globalPictures = await db.all(
      `SELECT i.id AS id, i.userId as userId, i.title AS title, i.description AS description, i.keywords AS keywords, i.path as path
      , CASE WHEN l.userId IS NOT NULL THEN TRUE ELSE FALSE END AS liked, COUNT(l.imageId) AS likes
      FROM images i LEFT JOIN likes l ON i.id = l.imageId WHERE i.userId != (SELECT id from users where username = ?) GROUP BY i.id`,
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