import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import logger from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "./config/passport.js";
import { configurePassport } from "./config/passport.js";
import sessionRouter from "./routes/sessionRoute.js";
import chunkRouter from "./routes/chunkRoute.js";
import responseRouter from "./routes/userResponseRoute.js";
import authRouter from "./routes/authRoute.js";

// import apiRouter from "./routes/api.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Session configuration
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/";
app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "metacognition-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URL,
      dbName: "metacognition",
      collectionName: "sessions",
      touchAfter: 24 * 3600, // lazy session update (in seconds)
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  }),
);

// Initialize Passport
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "frontend/dist")));

app.use("/api/auth", authRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/chunks", chunkRouter);
app.use("/api/responses", responseRouter);

// Serve React app for all other routes (must be after API routes)
// This allows React Router to handle client-side routing
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});

export default app;
