// Import the MongoClient class from the MongoDB driver.
import { MongoClient } from 'mongodb';
// Import the MongoDB configuration settings (like server URL and database name).
import { mongoConfig } from './settings.js';
// Initialize a variable to hold the MongoDB connection object. It's initially undefined.
let _connection = undefined;
// Initialize a variable to hold the MongoDB database object. It's initially undefined.
let _db = undefined;

// Asynchronous function to establish and return a database connection.
export const dbConnection = async () => {
  // Check if a connection has already been established.
  if (!_connection) {
    // If no connection exists, create a new one using the MongoClient and the server URL from the configuration.
    _connection = await MongoClient.connect(mongoConfig.serverUrl);
    // Once connected, get the specific database instance from the connection using the database name from the configuration.
    _db = _connection.db(mongoConfig.database);
  }
  // Return the database object. If a connection already existed, this will return the existing database object.
  return _db;
};
// Asynchronous function to close the MongoDB connection if one exists.
export const closeConnection = async () => {
  // Check if a connection object exists.
  if (_connection) await _connection.close();
};