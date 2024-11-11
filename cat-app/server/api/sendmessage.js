/**
 * Send Message API Handler
 * 
 * An API endpoint handler that handles liking by a specific user,
 * identified by their username.
 * Author: Team 7
 * Created:11/10/2024
 **/

import { initDb } from '../db';

export default defineEventHandler(async (event) => {


   const db = await initDb();

   const body = await readBody(event);
   const {sourceUsername, receivingUsername, message} = body;
   const timestamp = Date.now();
   console.log(sourceUsername, receivingUsername);
   console.log("\nsending something\n")

   try{

    await db.run(`INSERT INTO chat (sourceUserId, receivingUserId, message, sentTime)
         VALUES ((SELECT id FROM users WHERE username = ?), (SELECT id FROM users WHERE username = ?), ?, ?) `,
            [sourceUsername, receivingUsername, message, timestamp]
        );

    return {success:true, message: 'Sent successfully'}
   }catch (err) {
    console.log(err);
    return {success: false, message: 'Message failed'}
    
   }

});