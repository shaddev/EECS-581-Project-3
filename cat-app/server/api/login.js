import bcrypt from 'bcrypt';
import { initDb } from '../db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body;

  const db = await initDb();
  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

  if (user && (await bcrypt.compare(password, user.password))) {
    return { success: true, message: 'Login successful' };
  } else {
    return { success: false, message: 'Invalid username or password' };
  }
});