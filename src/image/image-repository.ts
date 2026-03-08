import { UploadedFile } from "express-fileupload";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import Image from "./image";
import { IMAGE_HASH_BITS, WORKING_DIR } from "../config";
import { v4 as uuidv4 } from "uuid";
import logger from "../logger";
import imghash from "imghash";
import Page from "../db/page";
import SimilarImageEntry from "./similar-image";
import leven from "leven";

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

/**
 *
 * @param {UploadedFile} image The image to compare against
 * @param {number} threshold The similarity threshold as a number between 0.0 and 1.0. 0.0 = not similar at all, 1.0 =
 * identical. An image's similarity must meet this or be greater to be included.
 * @returns {Promise<SimilarImageEntry[]>} A promise containing all similar entries that meet the threshold
 */
const findSimilarImages = async (
  image: UploadedFile,
  threshold: number = 0.85,
): Promise<SimilarImageEntry[]> => {
  const tempPath = path.join(WORKING_DIR, "temp", uuidv4());
  await image.mv(tempPath);
  // hash is 64 chars, so a distance of 0 means the 2 strings are equal, and a distance of 64 means they're completely
  // different
  const distThreshold = (1 - threshold) * 64;
  const hash = await imghash.hash(tempPath, IMAGE_HASH_BITS);
  const images = await Image.findAll();
  const similar: SimilarImageEntry[] = [];
  const promises: Promise<void>[] = [];
  const t1 = new Date();
  for (const image of images) {
    promises.push(
      new Promise((resolve, _reject) => {
        //logger.debug(`Finished calculating Levenshtein distance of ${image.id}`);
        const dist = leven(image.hash, hash);
        if (dist <= distThreshold) {
          similar.push({ image, similarity: 1.0 - dist / 64.0 });
        }
        resolve();
      }),
    );
  }
  await Promise.all(promises);
  const t2 = new Date();
  logger.debug(
    `Took ${t2.getUTCMilliseconds() - t1.getUTCMilliseconds()} ms to search through ${images.length} images.`,
  );
  await rm(tempPath);
  return similar;
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
  findSimilarImages,
  add,
  remove,
};

export default imageRepo;
