import { MongoClient, ServerApiVersion } from "mongodb";

export const DBClient = new MongoClient(process.env.DB_URI!);
