import mongoose from "mongoose";
import { createClient } from "redis";

export async function connectToMongoDB(url) {
  return mongoose.connect(url);
}

export const client = createClient({
  url: process.env.REDIS_HOST_URL,
});

export async function connectToRedis() {
  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();
  console.log("Redis connected");
}
