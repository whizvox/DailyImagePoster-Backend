import { Request, Response, NextFunction } from "express";
import { contentTooLarge } from "../api-result.ts";
import { formatBytes } from "../util.ts";
import { config } from "../config.ts";

const fileSizeLimitHandler = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = contentTooLarge(
      `File can be no larger than ${formatBytes(config.MAX_IMAGE_SIZE)}`,
    );
    res.status(result.status).send(result);
  };
};

export default fileSizeLimitHandler;
