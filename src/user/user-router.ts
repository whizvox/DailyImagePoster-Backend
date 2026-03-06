import express from "express";
import authorize from "../middleware/authorize";
import userRepo from "./user-repository";
import { ApiError, badRequest, created, ok } from "../api-result";

interface StrCreateQuery {
  name?: string;
  admin?: boolean;
}

const router = express.Router();

router.get("/nameunique", (req, res) => {
  if (req.query.name === undefined) {
    throw new ApiError(badRequest("Missing required parameter: `name`"));
  }
  res.send(ok(userRepo.isNameUnique(req.query.name as string)));
});

router.get(
  "/:id",
  authorize({ admin: true }),
  (req: express.Request<{ id: string }>, res: express.Response) => {
    const user = userRepo.get(req.params.id);
    res.send(ok(user));
  },
);

router.get("/", authorize({ admin: true }), (req: express.Request, res: express.Response) => {
  const users = userRepo.getAll();
  res.send(ok(users));
});

router.post("/", authorize({ admin: true }), (req: express.Request, res: express.Response) => {
  const query = req.query as any as StrCreateQuery;
  if (query.name === undefined) {
    throw new ApiError(badRequest(`Missing required parameter: \`name\``));
  }
  if (query.admin === undefined) {
    query.admin = false;
  }
  const result = userRepo.add(query.name, query.admin);
  res.status(201).send(created(result));
});

router.delete(
  "/:id",
  authorize({ admin: true }),
  (req: express.Request<{ id: string }>, res: express.Response) => {
    const result = userRepo.remove(req.params.id);
    res.send(ok(result));
  },
);

export default router;
