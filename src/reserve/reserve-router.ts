import { Request, Router } from "express";
import { created, ok } from "../api-result.ts";
import imageParameter from "../image/image-parameter.ts";
import authorize from "../middleware/authorize.ts";
import {
  booleanParameter,
  numberParameter,
  stringParameter,
  uuidParameter,
} from "../query/default-parameter-types.ts";
import parseQuery from "../query/parse-query.ts";
import reserveRepo from "./reserve-repository.ts";

const router = Router();

router.get("/:id", authorize(), async (req: Request<{ id: string }>, res) => {
  const reserve = await reserveRepo.get(req.params.id);
  res.send(ok(reserve));
});

router.get("/", authorize(), async (req, res) => {
  const query = parseQuery(req.query, {
    page: numberParameter({ min: 0 }),
    limit: numberParameter({ min: 1, max: 100 }),
  });
  const result = await reserveRepo.getAll(query);
  res.send(ok(result));
});

router.post("/", authorize({ admin: true }), async (req, res) => {
  const query = parseQuery(req.query, {
    image: imageParameter({ required: true }),
    title: stringParameter(),
    artist: stringParameter(),
    source: stringParameter(),
    comment: stringParameter(),
    imageNsfw: booleanParameter(),
    sourceNsfw: booleanParameter(),
    directSource: stringParameter(),
  });
  const image = await query.image!;
  const reserve = await reserveRepo.add(image, { ...query });
  res.status(201).send(created(reserve));
});

router.put("/", authorize({ admin: true }), async (req, res) => {
  const query = parseQuery(req.query, {
    id: uuidParameter({ required: true }),
    image: imageParameter(),
    title: stringParameter(),
    artist: stringParameter(),
    source: stringParameter(),
    comment: stringParameter(),
    imageNsfw: booleanParameter(),
    sourceNsfw: booleanParameter(),
    directSource: stringParameter(),
  });
  // image is actually a promise, so don't include it with the rest of the query
  const { image, ...restQuery } = query;
  // destructure only if image is defined
  const result = await reserveRepo.update(query.id!, {
    ...(image && { image: await image }),
    ...restQuery,
  });
  res.send(ok(result));
});

router.delete("/:id", authorize({ admin: true }), async (req: Request<{ id: string }>, res) => {
  const result = await reserveRepo.remove(req.params.id);
  res.send(ok(result));
});

export default router;
