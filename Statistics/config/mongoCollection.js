import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017';
const dbName = 'HealthHiveStats';
let dbConnection = null;

async function dbConnect() {
  if (dbConnection) return dbConnection;
  try {
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    dbConnection = client.db(dbName);
    return dbConnection;
  } catch (e) {
    throw new Error(`MongoDB connection error: ${e.message}`);
  }
}

export const users = async () => (await dbConnect()).collection('users');
export const places = async () => (await dbConnect()).collection('places');
export const reviews = async () => (await dbConnect()).collection('reviews');