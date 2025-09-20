import { Worker } from "bullmq";
import URL from "./models/url.js";
import { connectToMongoDB } from "./connect.js";

// mongoose
//   .connect("mongodb://localhost:5010/short-urls")
//   .then(() => console.log("MongoDB connected"))
//   .catch(() => console.log("MongoDB connection failed"));

connectToMongoDB("mongodb://mongo:27017/short-urls").then(
  console.log("Mongo DB connected")
);
const worker = new Worker(
  "db-update",
  async (job) => {
    const { shortId, timestamp } = job.data;
    const entry = await URL.findOneAndUpdate(
      {
        shortId,
      },
      {
        $push: {
          visitHistory: {
            timestamp: timestamp,
          },
        },
      }
    );
    console.log("Visit added for -> ", shortId, timestamp);
  },
  {
    connection: {
      host: "redis",
      port: 6379,
    },
  }
);

worker.on("completed", (job) => {
  console.log(`Job with ID ${job.id} has completed successfully.`);
});

worker.on("failed", (job, err) => {
  console.error(`Job with ID ${job.id} has failed:`, err);
});
