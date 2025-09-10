import "dotenv/config";
import cors from "cors";
import express from "express";
import passport from "passport";
import "./config/passport.config";
import compression from "compression";
import session from "express-session";
import MongoStore from "connect-mongo";
import appRoutes from "./routes/index.route";
import { HTTPSTATUS } from "./config/http.config";
import loggerMiddleware from "./middlewares/logger.middleware";
import { getSessionConfig, getCorsConfig, config } from "./config/app.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";

const app = express();

// define middlewares
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));
app.use(express.static("uploads"));

app.use(cors(getCorsConfig()));
app.use(
  session(
    getSessionConfig({
      store: MongoStore.create({
        mongoUrl: config.MONGO_URI,
        collectionName: "sessions",
      }),
    })
  )
);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(loggerMiddleware);

// Debug auth middleware (development only)
if (config.NODE_ENV === "development") {
  const debugAuth = require("./middlewares/debugAuth.middleware").default;
  app.use(debugAuth);
}

app.use("/api", appRoutes);

// handle not found
app.use("*", (req, res) => {
  return res.status(HTTPSTATUS.NOT_FOUND).json({
    error: "NOT_FOUND",
    message: "Not found!",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// global error handler
app.use(errorHandler);

export default app;
