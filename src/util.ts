import { Request } from "express";
import { Query } from "express-serve-static-core";
import { Authentication } from "./auth";

interface TypedQueryRequest<T extends Query> extends Request {
  query: T;
}

interface AuthorizedRequest extends Request {
  auth?: Authentication;
}

interface AuthenticatedTypedQueryRequest<T extends Query> {
  auth?: Authentication;
  query: T;
}

export { TypedQueryRequest, AuthorizedRequest, AuthenticatedTypedQueryRequest };
