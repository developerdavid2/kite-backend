import express from "express";
import cors from "cors";
import classifyRouter from "./routes/classify.route";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api/v1", classifyRouter);

app.use(errorHandler);

export default app;
