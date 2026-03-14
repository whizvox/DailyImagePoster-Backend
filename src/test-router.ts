import { Router } from "express";
import { rmdir } from "node:fs/promises";
import path from "node:path";
import { ok } from "./api-result";
import { config } from "./config";
import Image from "./image/image";
import mainLogger from "./logger";
import Post from "./post/post";
import { enumParameter } from "./query/default-parameter-types";
import parseQuery from "./query/parse-query";
import Reserve from "./reserve/reserve";
import { User } from "./user/user";
import userRepository from "./user/user-repository";

const router = Router();

const logger = mainLogger.child({ module: "Test" });

router.post("/reset", async (req, res) => {
  const query = parseQuery(req.query, {
    db: enumParameter(["all", "image", "post", "reserve", "user"], { defaultValue: "all" }),
  });
  if (query.db === "post" || query.db === "all") {
    await Post.sync({ force: true });
    logger.debug("Synchronized posts");
  }
  if (query.db === "reserve" || query.db === "all") {
    await Reserve.sync({ force: true });
    logger.debug("Synchronized reserves");
  }
  // must happen after posts and reserves since they reference this table
  if (query.db === "image" || query.db === "all") {
    await Image.sync({ force: true });
    logger.debug("Synchronized images");
    const imagesDir = path.join(config.WORKING_DIR, "images");
    try {
      await rmdir(imagesDir);
      logger.debug("Deleted all images on disk");
    } catch (_) {} // ignore, means the directory doesn't exist
  }
  if (query.db === "user" || query.db === "all") {
    await User.sync({ force: true });
    logger.debug("Synchronized users");
  }
  res.send(ok());
});

// create an admin account and log them in
router.post("/admin", async (req, res) => {
  const user = await userRepository.add("admin", "1234", true);
  const token = (await userRepository.updateAccessToken(user.id))!;
  res.send(ok(token));
});

export default router;
