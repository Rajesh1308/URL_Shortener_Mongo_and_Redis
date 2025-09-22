import { nanoid } from "nanoid";
import URL from "../models/url.js";
import { client } from "../connect.js";
import { Queue } from "bullmq";
import mongoose from "mongoose";

// Create a new connection in every instance
const dbUpdateQueue = new Queue("db-update", {
  connection: {
    host: process.env.REDIS_HOST,
    port: 6379,
  },
});

export const handleGenerateNewShortURL = async (req, res) => {
  const body = req.body;
  //   if (!body.url) {
  //     return res.status(400).json({ error: "url is required" });
  //   }
  const shortID = nanoid(8);
  await URL.create({
    shortId: shortID,
    redirectUrl: body.url,
    visitHistory: [],
    createdBy: new mongoose.Types.ObjectId(req.userId),
  });

  return res.json({
    success: true,
    message: `Short ID Created - ${shortID}`,
  });
};

export const handleCustomShortId = async (req, res) => {
  const customId = req.body.customId;
  const redirectUrl = req.body.redirectUrl;

  const isExist = await URL.findOne({ shortId: customId });
  if (isExist) {
    return res.json({
      success: false,
      error: {
        message: "Short ID already exist",
      },
    });
  }
  const entry = await URL.create({
    shortId: customId,
    redirectUrl: redirectUrl,
    visitHistory: [],
    createdBy: new mongoose.Types.ObjectId(req.userId),
  });
  return res.json({
    success: true,
    message: "Custom ID created",
  });
};

export const handleCustomIdCheck = async (req, res) => {
  const customId = req.body.customId;
  const isExist = await URL.findOne({ shortId: customId });
  if (isExist) {
    return res.json({
      success: false,
      error: {
        message: "Short ID already exist",
      },
    });
  }
  return res.json({
    success: true,
    message: "Id does not exist",
  });
};

export const handleGetAnalytics = async (req, res) => {
  const shortId = req.params.shortId;
  const result = await URL.findOne({ shortId });
  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
};

export const handleUrlRedirect = async (req, res) => {
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
      return res.status(404).json({ error: "Short URL not found - In cache" });
    }
    client.set(shortId, JSON.stringify(entry), { EX: 3600 });
    return res.redirect(entry.redirectUrl);
  } catch (e) {
    console.log("Error fetching or addig data to queue : ", e);
  }
};

export const handleGetUrls = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.json({
      success: false,
      error: {
        message: "User Id required",
      },
    });
  }
  console.log("USER-ID = ", userId);
  const urls = await URL.find({ createdBy: userId });
  const message = {
    success: true,
    message: urls,
  };
  return res.json(message);
};

export const handleDeleteUrl = async (req, res) => {
  const shortId = req.body.shortId;
  const entry = await URL.findOneAndDelete({ shortId });
  if (!entry) {
    return res.status(404).json({
      success: false,
      error: {
        message: "Short URL not found",
      },
    });
  }
  return res.json({
    success: true,
    message: "Deleted successfully",
  });
};

export const handleUpdateRedirectUrl = async (req, res) => {
  const shortId = req.body.shortId;
  const updatedRedirectUrl = req.body.newUrl;
  if (!shortId || !updatedRedirectUrl) {
    return res.json({
      success: false,
      error: {
        message: "shortId and update Url is required",
      },
    });
  }
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      redirectUrl: updatedRedirectUrl,
    }
  );
  if (!entry) {
    return res.json({
      success: false,
      error: {
        message: "Short Id not found",
      },
    });
  }
  const message = {
    shortId: shortId,
    redirectUrl: updatedRedirectUrl,
  };
  return res.json({
    success: true,
    message: message,
  });
};
