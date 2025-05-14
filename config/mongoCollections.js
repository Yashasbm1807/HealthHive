// Import the function to establish a database connection.
import { dbConnection } from './mongoConnection.js';

// This function creates and returns a function that, when called, provides access to a specific MongoDB collection.
const getCollectionFn = (collection) => {
  let _col = undefined; // Initialize a variable to hold the collection object. It will be undefined initially.
  return async () => {
    // Check if the collection object (_col) has not been initialized yet.
    if (!_col) {
      // If not, establish a database connection.
      const db = await dbConnection();
      // Get the specified collection from the database and store it in _col. This ensures the collection is only fetched once.
      _col = await db.collection(collection);
    }
    // Return the MongoDB collection object.
    return _col;
  };
};
// Export a function 'places'. When called, this function will return the 'places' MongoDB collection.
export const places = getCollectionFn('places');