import { connectToDb } from './mongoConnection.js';

export async function initCollections() {
  const db = await connectToDb();

  const collections = await db.listCollections().toArray();
  if (!collections.some(c => c.name === 'places')) {
    await db.createCollection('places');
    console.log('Created places collection');
    

    await db.collection('places').createIndex(
      { name: 1, 'location.city': 1 }, 
      { unique: true, name: 'unique_place_city' }
    );
  }
}