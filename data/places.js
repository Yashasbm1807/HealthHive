import { places } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import validation from '../helpers/validation.js';
import xss from 'xss';

 //function to create a ValidationError object
const createValidationError = (message) => ({
  type: 'ValidationError',
  message,
});

//function to create a DatabaseError object
const createDatabaseError = (message) => ({
  type: 'DatabaseError',
  message,
});
//function to create a NotFoundError object
const createNotFoundError = (message) => ({
  type: 'NotFoundError',
  message,
});

const exportedMethods = {
  //Retrieves all places with pagination support
  async getAllPlaces(page = 1, limit = 10) {
    try {
      // Get the 'places' collection.
      const placeCollection = await places();
      // Calculate the number of documents to skip for pagination.
      const skip = (page - 1) * limit;
      // Find all documents in the collection.
      const placeList = await placeCollection.find({})
        .skip(skip) // Skip the calculated number of documents.
        .limit(limit) // Limit the number of documents returned per page.
        .toArray(); // Convert the MongoDB documents to a JavaScript array.
      // Count the total number of documents in the collection.
      const total = await placeCollection.countDocuments(); 
      // Return an object with the paginated list of places (with _id converted to placeId) and the total count.
      return { places: placeList.map(place => ({ ...place, placeId: place._id.toString() })), total }; 
    } catch (e) {
      // Throw a standardized database error object.
      throw createDatabaseError(`Database error while fetching places: ${e.message}`);
    }
  },
  //Retrieves a single place by its ID.
  async getPlaceById(id) {
    try {
      // Validate the provided ID using the validation helper.
      id = validation.checkId(id, 'Place ID');
      // Get the 'places' collection.
      const placeCollection = await places();
      // Find a place with the matching MongoDB ObjectId.
      const place = await placeCollection.findOne({ _id: new ObjectId(id) });
      // If no place is found, throw a standardized not found error object.
      if (!place) throw createNotFoundError('Place not found');
      // Convert the MongoDB _id to a string for easier use.
      place.placeId = place._id.toString();
      // Return the found place object.
      return place;
    } catch (e) {
      // Re-throw the validation error object if it occurred during ID validation.
      if (e.type === 'ValidationError') throw e;
      // Re-throw the not found error object if the place wasn't found.
      if (e.type === 'NotFoundError') throw e;
      // Throw a standardized database error object for other database issues.
      throw createDatabaseError(`Database error while fetching place: ${e.message}`);
    }
  },
  // Searches for places based on various criteria with pagination and sorting.
  async searchPlaces({ name, type, city, tags, minRating, sortBy, page = 1, limit = 10 }) {
    try {
      // Get the 'places' collection.
      const placeCollection = await places();
      // Initialize an empty query object to build search conditions.
      const query = {};
      // Add search conditions to the query based on the provided parameters.
      // Case-insensitive regex search for name after sanitizing input.
      if (name) query.name = { $regex: xss(name.trim()), $options: 'i' };
      // Case-insensitive regex search for type after sanitizing input.
      if (type) query.type = { $regex: xss(type.trim()), $options: 'i' };
      // Case-insensitive regex search for city after sanitizing input.
      if (city) query.city = { $regex: xss(city.trim()), $options: 'i' };
      // Find places that have all the specified tags (after sanitizing each tag).
      if (tags && tags.length > 0) query.tags = { $all: tags.map(tag => xss(tag.trim())) };
      // Validate the minimum rating and throw a standardized error if invalid.
      if (minRating !== undefined && !isNaN(minRating)) {
        const rating = parseFloat(minRating);
        // Add a condition to find places with an average rating greater than or equal to the minimum.
        if (rating < 0 || rating > 5) throw createValidationError('Minimum rating must be between 0 and 5');
        query.averageRating = { $gte: rating };
      }
      // Initialize an empty sort options object.
      const sortOptions = {};
      // Sort by name in ascending order.
      if (sortBy === 'name') sortOptions.name = 1;
      // Sort by average rating in descending order.
      else if (sortBy === 'rating') sortOptions.averageRating = -1;
      // Sort by review count in descending order.
      else if (sortBy === 'reviews') sortOptions.reviewCount = -1;
      // Calculate the number of documents to skip for pagination.
      const skip = (page - 1) * limit;
      // Find documents that match the constructed query.
      const placeList = await placeCollection.find(query)
        .sort(sortOptions) // Apply the specified sorting options.
        .skip(skip) // Skip the calculated number of documents for the current page.
        .limit(limit) // Limit the number of documents returned per page.
        .toArray(); // Convert the matching MongoDB documents to a JavaScript array.
      // Count the total number of documents that match the query.
      const total = await placeCollection.countDocuments(query);
      // Return an object with the paginated and sorted list of matching places (with _id converted to placeId) and 
      // the total count of matching places.
      return { places: placeList.map(place => ({ ...place, placeId: place._id.toString() })), total };
    } catch (e) {
      // Re-throw the validation error object if it occurred during rating validation.
      if (e.type === 'ValidationError') throw e;
      // Throw a standardized database error object for other database issues.
      throw createDatabaseError(`Database error while searching places: ${e.message}`);
    }
  },
  // Retrieves all unique tags from the 'places' collection.
  async getAllTags() {
    try {
      // Get the 'places' collection.
      const placeCollection = await places();
      // Use the MongoDB distinct method to get an array of unique values from the 'tags' field.
      const tags = await placeCollection.distinct('tags');
      // Return the array of unique tags.
      return tags;
    } catch (e) {
      // Throw a standardized database error object.
      throw createDatabaseError(`Database error while fetching tags: ${e.message}`);
    }
  }
};
// Export the object containing the data access methods.
export default exportedMethods;