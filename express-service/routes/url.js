import express from "express";
import {
  handleGenerateNewShortURL,
  handleGetAnalytics,
} from "../controllers/url.js";
import { client } from "../connect.js";
import URL from "../models/url.js";
import { Queue } from "bullmq";

// Create a new connection in every instance
const dbUpdateQueue = new Queue("db-update", {
  connection: {
    host: "redis",
    port: 6379,
  },
});

const router = express.Router();

router.post("/", handleGenerateNewShortURL);

router.get("/analytics/:shortId", handleGetAnalytics);

router.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;

  try {
    const cachedEntry = await client.get(shortId);

    if (cachedEntry) {
      console.log("Cache hit");
      const redisEntry = JSON.parse(cachedEntry);

      await dbUpdateQueue.add("log-visit", {
        shortId: shortId,
        timestamp: Date.now(),
      });

      return res.redirect(redisEntry.redirectUrl);
    }

    console.log("Cache Miss");

    const entry = await URL.findOneAndUpdate(
      {
        shortId,
      },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      }
    );
    if (!entry) {
      return res.status(404).json({ error: "Short URL not found" });
    }
    client.set(shortId, JSON.stringify(entry), { EX: 120 });
    return res.redirect(entry.redirectUrl);
  } catch (e) {
    console.log("Error fetching or addig data to queue : ", e);
  }
});

export default router;

/*

search in redis

cache hit - return and push to queue

cache miss - find and update in mongo

*/
