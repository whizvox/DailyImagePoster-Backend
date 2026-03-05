import { PORT, initalize as initConfig } from "./config";
initConfig();

import express, { json, Request, Response, urlencoded } from "express";
import postRepo from "./post/post-repository";
import logger from "./logger";
import postRouter from "./post/post-router";
import errorHandler from "./error-handler";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world!");
});

app.use(json());
app.use(urlencoded());
app.use("/post", postRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  postRepo.initialize();
  logger.info(`Server running at http://localhost:${PORT}`);
});
