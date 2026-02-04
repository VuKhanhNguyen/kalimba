import createError from "http-errors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import path from "node:path";
import cookieParser from "cookie-parser";
import logger from "morgan";

import indexRouter from "./routes/index";
import usersRouter from "./routes/users";
import authRouter from "./routes/auth";
import songsRouter from "./routes/songs";
import tabsRouter from "./routes/tabs";

import "./core/config";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const models = require("./models");

const app = express();

// Behind Render (and most PaaS), the app sits behind a reverse proxy.
// Trust X-Forwarded-* headers so req.protocol/req.secure are correct (important for OAuth + cookies).
app.set("trust proxy", 1);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));

// Basic CORS for API (useful when frontend runs on a different origin, e.g. Vite dev server)
app.use(function (req: Request, res: Response, next: NextFunction) {
  if (req.path && req.path.startsWith("/api/")) {
    const origin = process.env.CORS_ORIGIN || "*";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
  }
  return next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/songs", songsRouter);
app.use("/api/tabs", tabsRouter);

models.sequelize
  .authenticate()
  .then(function () {
    if (String(process.env.DB_SYNC || "").toLowerCase() === "true") {
      return models.sequelize.sync();
    }
  })
  .catch(function (err: unknown) {
    // eslint-disable-next-line no-console
    console.error("Database connection failed:", err);
  });

// catch 404 and forward to error handler
app.use(function (_req: Request, _res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function (err: any, req: Request, res: Response, _next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
