import { Router, Request, Response } from "express";
import authorize from "../middleware/authorize";
import { ApiError, badRequest, notFound, ok } from "../api-result";
import { UploadedFile } from "express-fileupload";
import { TypedQueryRequest } from "../util";
import imageRepo from "./image-repository";
import { parseNumber } from "../query";
import path from "node:path";

const router = Router();

router.get("/info/:id", async (req, res) => {
  const image = await imageRepo.get(req.params.id);
  res.send(ok(image));
});

router.get("/info", async (req: TypedQueryRequest<{ page?: string; limit?: string }>, res) => {
  const page = parseNumber(req.query.page) ?? 0;
  const limit = parseNumber(req.query.limit) ?? 20;
  const result = await imageRepo.getAll(page, limit);
  res.send(ok(result));
});

router.post("/similar", async (req, res) => {
  if (!req.files || !req.files.image) {
    throw new ApiError(badRequest("Missing required parameter: `image`"));
  }
  const imageFile = req.files.image as UploadedFile;
  const similarImages = await imageRepo.findSimilarImages(imageFile);
  res.send(ok(similarImages));
});

router.get("/:id", async (req, res) => {
  const image = await imageRepo.get(req.params.id);
  if (image === null) {
    throw new ApiError(notFound(`(image) ${req.params.id}`));
  }
  res.sendFile(path.resolve(imageRepo.getImageFilePath(image.id)), {
    headers: { "Content-Type": image.mimeType },
  });
});

router.post("/", authorize(), async (req: TypedQueryRequest<{ dir?: string }>, res: Response) => {
  if (!req.files || !req.files.image) {
    throw new ApiError(badRequest("Missing required parameter: `image`"));
  }
  const imageFile = req.files.image as UploadedFile;
  const image = await imageRepo.add(imageFile);
  res.status(201).send(ok(image));
});

router.delete("/:id", authorize(), async (req: Request<{ id: string }>, res) => {
  const result = await imageRepo.remove(req.params.id);
  res.send(ok(result));
});

export default router;
