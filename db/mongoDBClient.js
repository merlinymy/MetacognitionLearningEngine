import { MongoClient } from "mongodb";

export const mongoClient = async () => {
  const client = await MongoClient.connect(
    process.env.MONGO_URL || "mongodb://localhost:27017/"
  );
  return client;
};
