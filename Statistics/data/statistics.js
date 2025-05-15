import { places, users, reviews } from '../config/mongoCollection.js';
import { ObjectId } from 'mongodb';
import xss from 'xss';

const createDatabaseError = (message) => ({
  type: 'DatabaseError',
  message,
});

const exportedMethods = {
  async getStatistics() {
    try {
      const userCollection = await users();
      const placeCollection = await places();
      const reviewCollection = await reviews();

      // Total Users
      const totalUsers = await userCollection.countDocuments();

      // Total Places
      const totalPlaces = await placeCollection.countDocuments();

      // Total Places City-Wise
      const placesByCity = await placeCollection.aggregate([
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray();

      // Total Places Type-Wise
      const placesByType = await placeCollection.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray();

      // Total Reviews
      const totalReviews = await reviewCollection.countDocuments();

      // Most Reviewed Places (Top 5)
      const mostReviewedPlaces = await placeCollection.find({})
        .sort({ reviewCount: -1 })
        .limit(5)
        .toArray();

      // Top-Rated Places (Top 5 with rating >= 0)
      const topRatedPlaces = await placeCollection.find({ averageRating: { $gte: 0 } })
        .sort({ averageRating: -1 })
        .limit(5)
        .toArray();

      return {
        totalUsers,
        totalPlaces,
        placesByCity: placesByCity.map(city => ({ city: city._id || 'Unknown', count: city.count })),
        placesByType: placesByType.map(type => ({ type: type._id || 'Unknown', count: type.count })),
        totalReviews,
        mostReviewedPlaces: mostReviewedPlaces.map(place => ({
          ...place,
          placeId: place._id.toString(),
          name: place.name,
          reviewCount: place.reviewCount
        })),
        topRatedPlaces: topRatedPlaces.map(place => ({
          ...place,
          placeId: place._id.toString(),
          name: place.name,
          averageRating: place.averageRating
        }))
      };
    } catch (e) {
      throw createDatabaseError(`Database error while fetching statistics: ${e.message}`);
    }
  }
};

export default exportedMethods;