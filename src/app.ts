import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import classifyRouter from "./routes/classify.route";

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  next();
});

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api/classify", classifyRouter);

app.use(errorHandler);

export default app;
