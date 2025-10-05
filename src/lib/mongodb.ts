import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add MONGODB_URI to .env.local');
}

const uri = process.env.MONGODB_URI;

export async function connectToDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(); // Uses database name from connection string
    
    return { client, db };
  } catch (error) {
    await client.close();
    throw error;
  }
}