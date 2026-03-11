import { config, initalize as initConfig } from "./config.ts";
initConfig();

import express, { json, Request, Response, urlencoded } from "express";
import fileUpload from "express-fileupload";
import logger from "./logger.ts";
import postRouter from "./post/post-router.ts";
import userRouter from "./user/user-router.ts";
import reserveRouter from "./reserve/reserve-router.ts";
import imageRouter from "./image/image-router.ts";
import errorHandler from "./middleware/error-handler.ts";
import userAuthentication from "./middleware/user-authentication.ts";
import fileSizeLimitHandler from "./middleware/file-size-limit-handler.ts";
import notFoundHandler from "./middleware/not-found-handler.ts";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world!");
});

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
app.use("/post", postRouter);
app.use("/user", userRouter);
app.use("/image", imageRouter);
app.use("/reserve", reserveRouter);
app.use(notFoundHandler());
app.use(errorHandler());

export default app;
