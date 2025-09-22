import express from "express";
import { connectToMongoDB, connectToRedis } from "./connect.js";
import router from "./routes/url.js";
import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import { configDotenv } from "dotenv";
configDotenv();
import cookieParser from "cookie-parser";
import { handleUrlRedirect } from "./controllers/url.js";

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:8080", // frontend origin
    credentials: true, // <== allows cookies
  })
);
app.use(cookieParser());

connectToMongoDB(process.env.MONGODB_HOST_URL).then(
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
