import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import logger from "morgan";
import sessionRouter from "./routes/sessionRoute.js";
import chunkRouter from "./routes/chunkRoute.js";
import responseRouter from "./routes/userResponseRoute.js";

// import apiRouter from "./routes/api.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "frontend/dist")));

app.use("/api/sessions", sessionRouter);
app.use("/api/chunks", chunkRouter);
app.use("/api/responses", responseRouter);

export default app;
