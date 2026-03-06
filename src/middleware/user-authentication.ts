import express from "express";
import { ApiError, unauthorized } from "../api-result";
import { User } from "../user/user";
import userRepo from "../user/user-repository";

interface AuthenticatedRequest extends express.Request {
  user: User | null
}

const userAuthentication = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const auth = req.header("X-Authorization");
  if (auth !== undefined) {
    const parts = auth.split(" ");
    if (parts.length !== 2) {
      throw new ApiError(unauthorized());
    }
    const type = parts[0];
    const value = parts[1];
    if (type === "Token") {
      const user = userRepo.getFromToken(value!);
      if (user === null) {
        throw new ApiError(unauthorized());
      }
      (req as AuthenticatedRequest).user = user;
    } else {
      throw new ApiError(unauthorized());
    }
  } else {
    (req as AuthenticatedRequest).user = null;
  }
  next();
};

export { userAuthentication, AuthenticatedRequest };
