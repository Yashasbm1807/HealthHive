import { MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';

const url = 'mongodb://localhost:27017';
const dbName = 'HealthHiveStats';

async function seedDatabase() {
  let client;
  try {
    client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = client.db(dbName);

    // Clear existing collections
    await db.collection('users').deleteMany({});
    await db.collection('places').deleteMany({});
    await db.collection('reviews').deleteMany({});

    // Seed Users
    const users = [
      { _id: new ObjectId(), username: 'user1', email: 'user1@example.com' },
      { _id: new ObjectId(), username: 'user2', email: 'user2@example.com' },
      { _id: new ObjectId(), username: 'user3', email: 'user3@example.com' },
    ];
    await db.collection('users').insertMany(users);

    // Seed Places
    const places = [
      {
        _id: new ObjectId(),
        name: 'Serenity Spa',
        city: 'New York',
        type: 'Spa',
        tags: ['relaxation', 'massage'],
        averageRating: 4.5,
        reviewCount: 10
      },
      {
        _id: new ObjectId(),
        name: 'Yoga Haven',
        city: 'New York',
        type: 'Yoga Studio',
        tags: ['yoga', 'meditation'],
        averageRating: 4.8,
        reviewCount: 15
      },
      {
        _id: new ObjectId(),
        name: 'Green Gym',
        city: 'Boston',
        type: 'Gym',
        tags: ['fitness', 'cardio'],
        averageRating: 4.2,
        reviewCount: 8
      },
      {
        _id: new ObjectId(),
        name: 'Calm Retreat',
        city: 'Boston',
        type: 'Spa',
        tags: ['relaxation', 'wellness'],
        averageRating: 4.0,
        reviewCount: 5
      },
      {
        _id: new ObjectId(),
        name: 'Fit Studio',
        city: 'Chicago',
        type: 'Gym',
        tags: ['fitness', 'strength'],
        averageRating: 4.6,
        reviewCount: 12
      }
    ];
    await db.collection('places').insertMany(places);

    // Seed Reviews
    const reviews = [
      { _id: new ObjectId(), placeId: places[0]._id, userId: users[0]._id, rating: 4.5, comment: 'Great spa!' },
      { _id: new ObjectId(), placeId: places[0]._id, userId: users[1]._id, rating: 4.0, comment: 'Relaxing experience' },
      { _id: new ObjectId(), placeId: places[1]._id, userId: users[2]._id, rating: 5.0, comment: 'Amazing yoga classes' },
      { _id: new ObjectId(), placeId: places[2]._id, userId: users[0]._id, rating: 4.0, comment: 'Good gym equipment' },
      { _id: new ObjectId(), placeId: places[4]._id, userId: users[1]._id, rating: 4.5, comment: 'Excellent trainers' }
    ];
    await db.collection('reviews').insertMany(reviews);

    console.log('Database seeded successfully!');
  } catch (e) {
    console.error('Error seeding database:', e);
  } finally {
    if (client) await client.close();
  }
}

seedDatabase();