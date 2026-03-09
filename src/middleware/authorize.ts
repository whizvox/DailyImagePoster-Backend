import { Response, NextFunction } from "express";
import { ApiError, forebidden, unauthorized } from "../api-result.ts";
import { AuthLevel, guestAuth } from "../auth.ts";
import logger from "../logger.ts";
import { AuthorizedRequest } from "../util.ts";

interface AuthorizeOptions {
  level?: AuthLevel;
  admin?: boolean;
}

const authorize = (options: AuthorizeOptions = {}) => {
  if (options.level === undefined) {
    options.level = AuthLevel.BEARER;
  }
  if (options.admin === undefined) {
    options.admin = false;
  }
  return (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    const auth = req.auth ?? guestAuth();
    if (auth.user === null) {
      if (options.level !== AuthLevel.GUEST) {
        // user is a guest and the route requires a logged-in user
        throw new ApiError(unauthorized());
      }
    } else {
      if (auth.level === AuthLevel.BASIC) {
        if (options.level === AuthLevel.BEARER) {
          // user is using basic authentication but route requires bearer-level authentication
          throw new ApiError(forebidden());
        }
      } else if (auth.level == AuthLevel.GUEST) {
        logger.warn(
          `Malformed authentication, user is not null but level is guest: user=${auth.user}`,
        );
        throw new ApiError(forebidden());
      }
      if (!auth.user.admin && options.admin) {
        // user is not an admin but route required admin-level access
        throw new ApiError(forebidden());
      }
    }
    next();
  };
};

export default authorize;
