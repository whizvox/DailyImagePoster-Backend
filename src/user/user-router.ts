import express from "express";
import { Query } from "express-serve-static-core";
import authorize from "../middleware/authorize";
import userRepo from "./user-repository";
import { ApiError, badRequest, created, ok } from "../api-result";
import { AuthorizedRequest, AuthorizedTypedQueryRequest, TypedQueryRequest } from "../util";
import { AuthLevel } from "../auth";

interface StrLoginQuery extends Query {
  lifespan?: string;
}

interface StrCreateQuery extends Query {
  name?: string;
  password?: string;
  admin?: string;
}

const router = express.Router();

router.get("/nameunique", async (req: TypedQueryRequest<{ name?: string }>, res) => {
  if (req.query.name === undefined) {
    throw new ApiError(badRequest("Missing required parameter: `name`"));
  }
  const unique = await userRepo.isNameUnique(req.query.name);
  res.send(ok(unique));
});

router.get("/self", authorize(), (req: AuthorizedRequest, res) => {
  const user = req.auth!.user!;
  res.send(ok(user));
});

router.post(
  "/login",
  authorize({ level: AuthLevel.BASIC }),
  async (req: AuthorizedTypedQueryRequest<StrLoginQuery>, res) => {
    const user = req.auth!.user!;
    let lifespan;
    if (req.query.lifespan === undefined) {
      lifespan = 24;
    } else {
      lifespan = Number(req.query.lifespan);
      if (Number.isNaN(lifespan)) {
        lifespan = 24;
      }
    }
    const tokenInfo = await userRepo.updateAccessToken(user.id, lifespan);
    res.send(ok(tokenInfo));
  },
);

router.post("/logout", authorize(), async (req: AuthorizedRequest, res) => {
  const user = req.auth!.user!;
  const result = await userRepo.revokeAccessToken(user.id);
  res.send(ok(result));
});

router.get(
  "/other/:id",
  authorize({ admin: true }),
  async (req: express.Request<{ id: string }>, res: express.Response) => {
    const user = await userRepo.get(req.params.id);
    res.send(ok(user));
  },
);

router.get("/other", authorize({ admin: true }), async (_req, res: express.Response) => {
  const users = await userRepo.getAll();
  res.send(ok(users));
});

router.post(
  "/",
  authorize({ admin: true }),
  async (req: TypedQueryRequest<StrCreateQuery>, res: express.Response) => {
    let name: string;
    let password: string;
    let admin: boolean;

    // name
    if (req.query.name === undefined) {
      throw new ApiError(badRequest(`Missing required parameter: \`name\``));
    }
    name = req.query.name;

    // password
    if (req.query.password === undefined) {
      throw new ApiError(badRequest(`Missing required parameter: \`password\``));
    }
    password = req.query.password;

    // admin
    if (req.query.admin === undefined) {
      admin = false;
    } else {
      admin = req.query.admin !== "0";
    }

    const result = await userRepo.add(name, password, admin);
    res.status(201).send(created(result));
  },
);

router.delete(
  "/other/:id",
  authorize({ admin: true }),
  async (req: express.Request<{ id: string }>, res: express.Response) => {
    const result = await userRepo.remove(req.params.id);
    res.send(ok(result));
  },
);

export default router;
