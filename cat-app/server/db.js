import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export const initDb = async () => {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    );
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      title TEXT,
      description TEXT,
      keywords TEXT,
      path TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);

  return db;
};