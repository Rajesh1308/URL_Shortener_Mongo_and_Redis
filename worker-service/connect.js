import mongoose from "mongoose";
import { createClient } from "redis";

export async function connectToMongoDB(url) {
  return mongoose.connect(url);
}

export const client = createClient({
  url: "redis://localhost:6379",
});

export async function connectToRedis() {
  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();

  console.log("Redis connected");
}
