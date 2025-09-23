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

export const handleUrlRedirect = async (req, res) => {
  const shortId = req.params.shortId;
  const ip = req.ip;

  try {
    const cachedEntry = await client.get(shortId);
    const cacheIpRequest = await client.get(`${ip}-${shortId}`);
    console.log(cacheIpRequest);

    if (cachedEntry) {
      console.log("Cache hit");
      const redisEntry = JSON.parse(cachedEntry);

      if (cacheIpRequest === null) {
        console.log("Adding");
        await dbUpdateQueue.add("log-visit", {
          shortId: shortId,
          timestamp: Date.now(),
        });
        client.set(`${ip}-${shortId}`, shortId, { EX: 5 });
      } else {
        console.log("No addding because of continuos request");
      }

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
      return res.status(404).json({
        error: "We can't find you the right URL. Please check the URL again.",
      });
    }
    client.set(`${ip}-${shortId}`, shortId, { EX: 5 });
    client.set(shortId, JSON.stringify(entry), { EX: 3600 });
    return res.redirect(entry.redirectUrl);
  } catch (e) {
    console.log("Error fetching or addig data to queue : ", e);
  }
};

export const handleGenerateNewShortURL = async (req, res) => {
  const body = req.body;
  if (!body.url || !body.title) {
    return res.status(400).json({
      success: false,
      error: {
        message: "URL and title is required",
      },
    });
  }
  if (body.url.trim().includes(" ")) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Imporper URL format",
      },
    });
  }
  const shortID = nanoid(8);
  await URL.create({
    title: body.title,
    shortId: shortID,
    redirectUrl: body.url,
    visitHistory: [],
    createdBy: new mongoose.Types.ObjectId(req.userId),
  });

  return res.json({
    success: true,
    message: `Short ID Created - ${shortID}`,
    shortId: shortID,
  });
};

export const handleCustomShortId = async (req, res) => {
  const customId = req.body.customId.trim();
  const redirectUrl = req.body.redirectUrl.trim();
  const title = req.body.title;
  const reserved = [
    "url",
    "updateUrl",
    "delete",
    "login",
    "signup",
    "logout",
    "auth",
    "custom-id-check",
    "custom",
    "get-urls",
    "api",
  ];

  if (!customId || !redirectUrl || !title) {
    return res.json({
      success: false,
      error: {
        message: "Missing required arguments",
      },
    });
  }

  if (customId.includes(" ") || redirectUrl.includes(" ")) {
    return res.json({
      success: false,
      error: {
        message: "Improper format of url or alias",
      },
    });
  }

  if (reserved.includes(customId)) {
    return res.json({
      success: false,
      error: {
        message: "Custom Id not allowed",
      },
    });
  }

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
    title: title,
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

export const handleGetUrls = async (req, res) => {
  const userId = req.userId;
  console.log("USER ID - ", userId);
  if (!userId) {
    return res.json({
      success: false,
      error: {
        message: "User Id required",
      },
    });
  }
  const urls = await URL.find({
    createdBy: new mongoose.Types.ObjectId(userId),
  });
  const transformed = urls.map((urlDoc, index) => ({
    id: urlDoc.shortId, // Or use urlDoc._id.toString() if you want unique
    originalUrl: urlDoc.redirectUrl,
    shortUrl: `${process.env.HOST_URL}${urlDoc.shortId}`, // change domain as per your frontend
    clicks: urlDoc.visitHistory.length,
    createdAt: urlDoc.createdAt,
    title: urlDoc.title, // you could add a proper title extraction later
  }));
  return res.status(200).json({
    success: true,
    message: transformed,
  });
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
  const updatedRedirectUrl = req.body.newUrl.trim();
  if (!shortId || !updatedRedirectUrl) {
    return res.json({
      success: false,
      error: {
        message: "shortId and update Url is required",
      },
    });
  }
  if (updatedRedirectUrl.includes(" ")) {
    return res.json({
      success: false,
      error: {
        message: "Improper URL format",
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
