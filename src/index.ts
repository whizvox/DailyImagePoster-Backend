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
  // for (let i = 0; i < 10000; i++) {
  //   const post = new Post(
  //     uuidv4(),
  //     i + 1,
  //     0,
  //     `Title #${i + 1}`,
  //     `Artist #${i + 1}`,
  //     `Source #${i + 1}`,
  //     `Comment #${i + 1}`,
  //     false,
  //     false,
  //     `Direct source #${i + 1}`,
  //     new Date(),
  //   );
  //   addPost(post);
  //   console.log(`Adding post #${post.num}`);
  // }
  //forEach([], null, (post) => console.log(post));
});
