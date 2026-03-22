import { config, initalize as initConfig } from "./config.ts";
initConfig();

import cors from "cors";
import express, { json, urlencoded } from "express";
import fileUpload from "express-fileupload";
import { ok } from "./api-result.ts";
import imageRouter from "./image/image-router.ts";
import logger from "./logger.ts";
import errorHandler from "./middleware/error-handler.ts";
import fileSizeLimitHandler from "./middleware/file-size-limit-handler.ts";
import notFoundHandler from "./middleware/not-found-handler.ts";
import userAuthentication from "./middleware/user-authentication.ts";
import postRouter from "./post/post-router.ts";
import reserveRouter from "./reserve/reserve-router.ts";
import testRouter from "./test-router.ts";
import userRouter from "./user/user-router.ts";

const app = express();

// middleware
app.use(
  cors({
    origin: config.CORS_ALLOW_ORIGIN,
  }),
);
if ("*" in config.CORS_ALLOW_ORIGIN && config.ENVIRONMENT === "prod") {
  logger.warn(
    "CORS policy is configured to allow all origins. If this is not intended, please shut down the server now and define the `CORS_ALLOW_ORIGIN` environment variable.",
  );
}
app.use(json());
app.use(urlencoded({ extended: true }));
const fileUploadLogger = logger.child({ module: "FileUpload" });
app.use(
  fileUpload({
    logger: { log: (msg) => fileUploadLogger.debug(msg) },
    limits: { fileSize: config.MAX_IMAGE_SIZE, files: 1 },
    abortOnLimit: true,
    limitHandler: fileSizeLimitHandler, // TODO doesn't seem to do anything
    createParentPath: true,
  }),
);
app.use(userAuthentication());

// routers
app.get("/", (_, res) => {
  res.send(ok());
});
app.use("/post", postRouter);
app.use("/user", userRouter);
app.use("/image", imageRouter);
app.use("/reserve", reserveRouter);
if (config.ENVIRONMENT === "test") {
  logger.warn(
    "Test router is enabled. This gives backdoor access stricting for testing purposes. If this is not intended, please stop the server immediately!",
  );
  app.use("/test", testRouter);
}

// fallback handler
app.use(notFoundHandler());

// error handler
app.use(errorHandler());

export default app;
