import { Response, NextFunction } from "express";
import { Buffer } from "node:buffer";
import { ApiError, unauthorized } from "../api-result";
import { User } from "../user/user";
import userRepo from "../user/user-repository";
import logger from "../logger";
import { Authentication, AuthLevel } from "../auth";
import { AuthorizedRequest } from "../util";

const userAuthentication = () => {
  return async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    const auth = req.header("Authorization");
    if (auth !== undefined) {
      const parts = auth.split(" ");
      if (parts.length !== 2) {
        throw new ApiError(unauthorized());
      }
      const type = parts[0];
      let value = parts[1];
      let user: User | null = null;
      if (type === "Basic") {
        value = Buffer.from(value!, "base64").toString()!;
        const authParts = value.split(":", 2);
        if (authParts.length !== 2) {
          throw new ApiError(unauthorized());
        }
        const username = authParts[0]!;
        const password = authParts[1]!;
        user = await userRepo.checkPassword(username, password);
      } else if (type === "Bearer") {
        user = await userRepo.getFromToken(value!);
      }
      if (user === null) {
        // user's access has expired or is using an unsupported authorization type
        throw new ApiError(unauthorized());
      }
      logger.debug(`User has been authenticated: id=${user.id}, name=${user.name}`);
      req.auth = new Authentication(
        user,
        type === "Basic" ? AuthLevel.BASIC : AuthLevel.BEARER,
      );
    } else {
      req.auth = new Authentication(null, AuthLevel.GUEST);
    }
    next();
  };
};

export default userAuthentication;
