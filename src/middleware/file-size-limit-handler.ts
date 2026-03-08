import { Request, Response, NextFunction } from "express";
import { contentTooLarge } from "../api-result";
import { formatBytes } from "../util";
import { MAX_IMAGE_SIZE } from "../config";

const fileSizeLimitHandler = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = contentTooLarge(`File can be no larger than ${formatBytes(MAX_IMAGE_SIZE)}`);
    res.status(result.status).send(result);
  };
};

export default fileSizeLimitHandler;
