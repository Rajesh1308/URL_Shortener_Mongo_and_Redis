import express from "express";
import {
  handleCustomIdCheck,
  handleCustomShortId,
  handleDeleteUrl,
  handleGenerateNewShortURL,
  handleGetAnalytics,
  handleGetUrls,
  handleUpdateRedirectUrl,
} from "../controllers/url.js";
import { client } from "../connect.js";
import URL from "../models/url.js";
import { Queue } from "bullmq";
import userAuth from "../middlewares/userAuth.js";
import shortIdValidate from "../middlewares/validateShortUrl.js";

// Create a new connection in every instance
const dbUpdateQueue = new Queue("db-update", {
  connection: {
    host: process.env.REDIS_HOST,
    port: 6379,
  },
});

const router = express.Router();

router.post("/", userAuth, handleGenerateNewShortURL);

router.get(
  "/analytics/:shortId",
  userAuth,
  shortIdValidate,
  handleGetAnalytics
);

router.get("/get-urls", userAuth, handleGetUrls);

router.delete("/delete", userAuth, shortIdValidate, handleDeleteUrl);

router.put("/updateUrl", userAuth, shortIdValidate, handleUpdateRedirectUrl);

router.post("/custom", userAuth, handleCustomShortId);

router.post("/custom-id-check", userAuth, handleCustomIdCheck);

export default router;

/*

search in redis

cache hit - return and push to queue

cache miss - find and update in mongo

*/
