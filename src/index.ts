import { PORT, initalize as initConfig } from "./config";
initConfig();

import express, { json, Request, Response, urlencoded } from "express";
import postRepo from "./post/post-repository";
import logger from "./logger";
import postRouter from "./post/post-router";
import userRouter from "./user/user-router";
import errorHandler from "./middleware/error-handler";
import { userAuthentication } from "./middleware/user-authentication";
import userRepo from "./user/user-repository";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world!");
});

app.use(json());
app.use(urlencoded());
app.use(userAuthentication);
app.use("/post", postRouter);
app.use("/user", userRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  userRepo.initialize();
  postRepo.initialize();
  logger.info(`Server running at http://localhost:${PORT}`);
});
