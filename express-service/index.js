import express from "express";
import { connectToMongoDB, connectToRedis } from "./connect.js";
import router from "./routes/url.js";
import URL from "./models/url.js";
import authRouter from "./routes/authRoutes.js";
import { configDotenv } from "dotenv";
configDotenv();
import cookieParser from "cookie-parser";
import { handleUrlRedirect } from "./controllers/url.js";

const app = express();
const port = 8001;

app.use(express.json());
app.use(cookieParser());

connectToMongoDB("mongodb://localhost:27017/short-urls").then(
  console.log("Mongo DB connected")
);

connectToRedis();

app.use("/url", router);
app.use("/auth", authRouter);

app.get("/:shortId", handleUrlRedirect);

app.get("/", (req, res) => {
  res.send("All good here");
});

app.listen(port, () => {
  console.log(`Server started in port ${port}`);
});
