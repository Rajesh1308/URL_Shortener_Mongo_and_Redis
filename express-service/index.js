import express from "express";
import { connectToMongoDB, connectToRedis } from "./connect.js";
import router from "./routes/url.js";
import URL from "./models/url.js";

const app = express();
const port = 8000;

app.use(express.json());

connectToMongoDB("mongodb://mongo:27017/short-urls").then(
  console.log("Mongo DB connected")
);

connectToRedis();

app.use("/url", router);

app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
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
  res.redirect(entry.redirectUrl);
});

app.get("/", (req, res) => {
  res.send("All good here");
});

app.listen(port, () => {
  console.log(`Server started in port ${port}`);
});
