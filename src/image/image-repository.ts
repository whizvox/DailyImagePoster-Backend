import { UploadedFile } from "express-fileupload";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import Image from "./image";
import { IMAGE_HASH_BITS, WORKING_DIR } from "../config";
import { v4 as uuidv4 } from "uuid";
import logger from "../logger";
import imghash from "imghash";
import Page from "../db/page";

const initialize = async (): Promise<void> => {
  await Image.sync();
  await mkdir(path.join(WORKING_DIR, "images"), { recursive: true });
};

const getImageFilePath = (name: string): string => {
  return path.join(WORKING_DIR, "images", name);
};

const get = async (id: string): Promise<Image | null> => {
  return Image.findOne({ where: { id } });
};

const getAll = async (page: number = 0, limit: number = 20): Promise<Page<Image>> => {
  const { rows, count } = await Image.findAndCountAll({ limit, offset: page * limit });
  return new Page(page, count, limit, rows);
};

const add = async (file: UploadedFile): Promise<Image> => {
  const id = uuidv4();
  const filePath = getImageFilePath(id);
  await file.mv(filePath);
  logger.debug(`Moved uploaded image file to \`${filePath}\``);
  try {
    const hash = await imghash.hash(filePath, IMAGE_HASH_BITS);
    const image = await Image.create({ id, mimeType: file.mimetype, name: file.name, hash });
    logger.info(`Created image record: id=${image.id}, name=${image.name}`);
    return image;
  } catch (err) {
    logger.warn(`Failed to create image record, deleting moved image file at \`${filePath}\``);
    await rm(filePath);
    throw err;
  }
};

const remove = async (id: string): Promise<boolean> => {
  const image = await get(id);
  if (image === null) {
    return false;
  }
  const filePath = getImageFilePath(image.id);
  await rm(filePath);
  logger.debug(`Deleted image file at \`${filePath}\``);
  await image.destroy();
  logger.info(`Deleted image: id=${image.id}, name=${image.name}`);
  return true;
};

const imageRepo = {
  initialize,
  getImageFilePath,
  get,
  getAll,
  add,
  remove,
};

export default imageRepo;
