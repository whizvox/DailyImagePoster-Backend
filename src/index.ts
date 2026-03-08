import { MAX_IMAGE_SIZE, PORT, initalize as initConfig } from "./config";
initConfig();

import express, { json, Request, Response, urlencoded } from "express";
import fileUpload from "express-fileupload";
import logger from "./logger";
import postRouter from "./post/post-router";
import userRouter from "./user/user-router";
import imageRouter from "./image/image-router";
import errorHandler from "./middleware/error-handler";
import userAuthentication from "./middleware/user-authentication";
import userRepo from "./user/user-repository";
import postRepo from "./post/post-repository";
import fileSizeLimitHandler from "./middleware/file-size-limit-handler";
import imageRepo from "./image/image-repository";

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
    limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
    abortOnLimit: true,
    limitHandler: fileSizeLimitHandler, // TODO doesn't seem to do anything
    createParentPath: true
  }),
);
app.use(userAuthentication());
app.use("/post", postRouter);
app.use("/user", userRouter);
app.use("/image", imageRouter);
app.use(errorHandler());

app.listen(PORT, async () => {
  await userRepo.initialize();
  await postRepo.initialize();
  await imageRepo.initialize();
  logger.info(`Server running at http://localhost:${PORT}`);
});
