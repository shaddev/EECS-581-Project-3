/**
 * Like Pictures API Handler
 * 
 * An API endpoint handler that handles liking by a specific user,
 * identified by their username.
 * Author: Team 7
 * Created:10/27/2024
 
 * Preconditons: 
 * Valid database connection must be available
 *   - Input:
 *     - username (string): Valid username passed as query parameter
 *     - Must be URL-encoded if contains special characters
 *   - Database tables 'users', 'images', and 'likes' must exist
 
 * Postconditions:Returns JSON object with:
 *     - success (boolean): Indicating operation status
 *     - likedPictures (array): Array of image objects if successful
 *     - message (string): Error message if unsuccessful
 
 * Errors: Database query errors
 *   - Invalid parameter
 *   - Connection errors
 * SideEffects: Logs errors to console in case of failure
 *   - Creates and closes database connection
 * Invariants: Query results deal with liking/unliking
 *   - Response structure remains consistent regardless of success/failure
 **/

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