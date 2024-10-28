/**
Database Initialization Module
A module that initializes an SQLite database with tables for users, images, and likes.
Author: Team 7
Created: 10/27/2024
 Preconditions: Node.js environment with sqlite3 and sqlite packages installed
                Write permissions in the current directory for database file creation
                Valid sqlite3 and sqlite import statements

Postconditions: Returns a database connection object if successful
                Creates database.sqlite file if it doesn't exist
                Creates users, images, and likes tables if they don't exist

Errors
      May throw SQLite errors if database creation/connection fails
      May throw file system errors if lacking write permissions   
      
sideEffects
      Creates or modifies database.sqlite file in current directory
      Establishes active database connection

invariants
    Database schema structure remains consistent across executions
    Foreign key relationships maintain referential integrity
 **/

// Import required SQLite modules
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

/**
 * Initializes the SQLite database and creates required tables if they don't exist
 * @returns {Promise<Database>} Database connection object
 */
export const initDb = async () => {
  // Open database connection with specified configuration
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
// Execute SQL to create necessary tables if they don't exist
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
     CREATE TABLE IF NOT EXISTS likes (
      userId INTEGER,
      imageId INTEGER, 
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (imageID) REFERENCES images(id),
      PRIMARY KEY (userId, imageId) );
  `);

  return db;
};