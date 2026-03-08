import { Request, Response, NextFunction } from "express";
import { notFound } from "../api-result";

const notFoundHandler = () => {
  return (req: Request, res: Response, _next: NextFunction) => {
    res.status(404).send(notFound(req.path));
  };
};

export default notFoundHandler;