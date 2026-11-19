import { MongoClient } from "mongodb";

export async function connectDatabase(uri) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    return { client, database: client.db() };
  } catch (error) {
    await client.close();
    throw error;
  }
}
