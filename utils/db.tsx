import { MongoClient } from "mongodb";

let cachedClient: MongoClient | null = null;

export async function connectDB() {
  if (cachedClient) {
    return cachedClient;
  }

  let client = new MongoClient(process.env.DB_URI!);
  await client.connect();

  cachedClient = client;

  return cachedClient;
}
