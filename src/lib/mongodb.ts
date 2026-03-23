import "server-only";
import { MongoClient, Db } from "mongodb";

type MongoGlobal = typeof globalThis & {
  __mongoClientPromise?: Promise<MongoClient>;
};

const globalForMongo = globalThis as MongoGlobal;

export async function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (!globalForMongo.__mongoClientPromise) {
    const client = new MongoClient(uri);
    globalForMongo.__mongoClientPromise = client.connect().catch((error) => {
      globalForMongo.__mongoClientPromise = undefined;
      throw error;
    });
  }

  return globalForMongo.__mongoClientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db();
}
