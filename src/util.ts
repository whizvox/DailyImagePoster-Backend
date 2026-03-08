import { Request } from "express";
import { Query } from "express-serve-static-core";
import { Authentication } from "./auth";

interface TypedQueryRequest<T extends Query> extends Request {
  query: T;
}

interface AuthorizedRequest extends Request {
  auth?: Authentication;
}

interface AuthorizedTypedQueryRequest<T extends Query> {
  auth?: Authentication;
  query: T;
}

const formatBytes = (n: number): string => {
  if (n < 1000) {
    return `${n} B`;
  }
  if (n < 1e6) {
    return `${(n / 1000).toFixed(1)} KB`;
  }
  if (n < 1e9) {
    return `${(n / 1e6).toFixed(1)} MB`;
  }
  if (n < 1e12) {
    return `${(n / 1e9).toFixed(1)} GB`;
  }
  return `${(n / 1e12).toFixed(1)} TB`;
};

const sanitizeDirectoryName = (dir: string): string => {
  return dir.replaceAll(/[^\w-]/g, "_");
};

export {
  TypedQueryRequest,
  AuthorizedRequest,
  AuthorizedTypedQueryRequest,
  formatBytes,
  sanitizeDirectoryName,
};
