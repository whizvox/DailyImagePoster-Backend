import { Request, Response, NextFunction } from "express";
import { ApiError, badRequest, internalServerError } from "../api-result.ts";
import { ParseError } from "../query.ts";
import logger from "../logger.ts";
import { SEND_SERVER_ERROR } from "../config.ts";

const errorHandler = () => (err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.response.status).send(err.response);
    return;
  }
  if (err instanceof ParseError) {
    const result = badRequest(err.message);
    res.status(result.status).send(result);
  }
  if (err instanceof Error) {
    let message = "Intercepted unexpected server error";
    if (err.stack === undefined) {
      message += ` - ${err}`;
    } else {
      message += "\n=== STACKTRACE ===";
      message += `\n${err.stack}`;
    }
    if (err.cause !== undefined) {
      message += "\n=== CAUSE ===";
      message += `\n${err.cause}`;
    }
    logger.warn(message);
  } else {
    logger.warn(`Intercepted unknown server error - ${err}`);
  }
  const result = internalServerError(SEND_SERVER_ERROR ? `${err}` : "Unexpected error!");
  res.status(result.status).send(result);
};

export default errorHandler;
