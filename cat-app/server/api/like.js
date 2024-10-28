import { initDb } from '../db';

export default defineEventHandler(async (event) => {


   const db = await initDb();

   const body = await readBody(event);
   const {username, imageId, isLiking} = body;
   console.log(username, imageId, isLiking);
   console.log("(un)liking something")

   try{
    if (isLiking){
        await db.run('INSERT INTO likes (userId, imageId) VALUES ((SELECT id FROM users WHERE username = ?), ?) ',
            [username, imageId]
        );
    } else {
        await db.run('DELETE FROM likes WHERE userId=(SELECT id FROM users WHERE username = ?) AND imageId=?',
            [username, imageId]
        );
    }
    return {success:true, message: 'Liked successfully'}
   }catch (err) {
    console.log(err);
    return {success: false, message: 'Like failed'}
    
   }



//   console.log(username)

//   try {
//     const userPictures = await db.all(
//       'SELECT * FROM images WHERE userId = (SELECT id from users where username = ?)',
//       [username]
//     );

//     const globalPictures = await db.all(
//       'SELECT * FROM images WHERE userId != (SELECT id from users where username = ?)',
//       [username]
//     );

//     return {
//       success: true,
//       userPictures,
//       globalPictures
//     };
//   } catch (error) {
//     console.error('Error fetching feed data:', error);
//     return {
//       success: false,
//       message: 'Error fetching feed data'
//     };
//   }
});