import express, { Request, Response } from "express";
import { initialize as initPosts } from "./post/post-repository";
import logger from "./logger";
import { PORT } from "./env";
const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world!");
});

app.listen(PORT, () => {
  initPosts();
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
