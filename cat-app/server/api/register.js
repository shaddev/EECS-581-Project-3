import bcrypt from 'bcrypt';
import { initDb } from '../db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const db = await initDb();

  try {
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    return { success: true, message: 'User registered successfully' };
  } catch (error) {
    return { success: false, message: 'User registration failed' };
  }
});