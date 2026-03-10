import app from "./app.ts";
import { config } from "./config.ts";
import imageRepo from "./image/image-repository.ts";
import logger from "./logger.ts";
import postRepo from "./post/post-repository.ts";
import userRepo from "./user/user-repository.ts";

app.listen(config.PORT, async () => {
  await userRepo.initialize();
  await postRepo.initialize();
  await imageRepo.initialize();
  logger.info(`Server running at http://localhost:${config.PORT}`);
});
