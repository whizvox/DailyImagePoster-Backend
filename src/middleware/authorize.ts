import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./user-authentication";
import { ApiError, forebidden, unauthorized } from "../api-result";

interface AuthorizeOptions {
  admin?: boolean;
  loggedIn?: boolean;
}

const authorize = (options: AuthorizeOptions = {}) => {
  if (options.admin === undefined) {
    options.admin = false;
  }
  if (options.loggedIn === undefined) {
    options.loggedIn = true;
  }
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    if (user === null) {
      if (options.loggedIn) {
        throw new ApiError(unauthorized());
      }
    } else {
      if (options.admin && !user.admin) {
        throw new ApiError(forebidden());
      }
    }
    next();
  };
};

export default authorize;
