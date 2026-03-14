import fs, { readFile } from "node:fs/promises";
import sharp, {
  AvifOptions,
  FormatEnum,
  JpegOptions,
  OutputOptions,
  PngOptions,
  WebpOptions,
} from "sharp";
import waifu2x from "waifu2x";
import logger from "../logger";
import { getTempFile } from "../temp-file-service";
import Image from "./image";
import imageRepo from "./image-repository";

interface ResizeResult {
  storage: number;
  size: {
    width: number;
    height: number;
  };
  storageDiff: number;
  sizeDiff: number;
}

type CommonOutputOptions = OutputOptions | PngOptions | JpegOptions | WebpOptions | AvifOptions;

const replaceImage = async (image: Image, newPath: string, newMimeType: string): Promise<void> => {
  const imagePath = imageRepo.getImageFilePath(image.id);
  const tempPath = await getTempFile();
  // move old image into temp file
  // nothing to undo, no need to try-catch
  await fs.rename(imagePath, tempPath);
  try {
    await fs.copyFile(newPath, imagePath); // move new image into old image's place
  } catch (err) {
    try {
      await fs.rename(tempPath, imagePath);
    } catch (err2) {
      logger.warn(
        `Failed to undo image-to-temp renaming, temp=${tempPath}, image=${imagePath}\n${err2}`,
      );
    }
    throw err;
  }
  try {
    await fs.rm(tempPath); // delete old image
  } catch (err) {
    logger.warn(`Failed to cleanup old image copied to temp location: temp=${tempPath}\n${err}`);
  }
  if (image.mimeType !== newMimeType) {
    await image.update({ mimeType: newMimeType });
  }
};

const shrinkImage = async (
  image: Image,
  options: {
    format?: keyof FormatEnum;
    formatOptions?: CommonOutputOptions;
    targetSize?: number;
    maxIterations?: number;
    sizeMultiplierDelta?: number;
  } = {},
): Promise<ResizeResult> => {
  const inputImage = await readFile(imageRepo.getImageFilePath(image.id));
  if (options.format === undefined) {
    options.format = "jpg";
  }
  if (options.formatOptions === undefined) {
    if (options.format === "jpg") {
      options.formatOptions = { quality: 90 } as JpegOptions;
    } else if (options.format === "webp") {
      options.formatOptions = { quality: 90 } as WebpOptions;
    } else if (options.format === "avif") {
      options.formatOptions = { quality: 80 } as AvifOptions;
    } else {
      options.formatOptions = {};
    }
  }
  if (options.targetSize === undefined) {
    options.targetSize = Math.floor(1.1 * 1024 * 1024); // 1.1 MB
  }
  if (options.maxIterations === undefined) {
    options.maxIterations = 30;
  }
  if (options.sizeMultiplierDelta === undefined) {
    options.sizeMultiplierDelta = 0.05;
  }
  const tempPath = await getTempFile();
  let img = sharp(inputImage);
  const metadata = await img.metadata();
  let currentIteration = 1;
  let currentSizeMultiplier = 1;
  let size = 0;
  let width = 0;
  let height = 0;
  let keepShrinking = true;
  while (keepShrinking) {
    img.toFormat(options.format, options.formatOptions);
    if (currentSizeMultiplier !== 1) {
      img.resize(Math.floor(metadata.width * currentSizeMultiplier));
    }
    logger.debug(`Shrinking image ${image.id} to ${(currentSizeMultiplier * 100).toFixed(1)}%`);
    const output = await img.toFile(tempPath);
    size = output.size;
    width = output.width;
    height = output.height;
    if (currentIteration > options.maxIterations || size < options.targetSize) {
      keepShrinking = false;
    } else {
      currentSizeMultiplier -= options.sizeMultiplierDelta;
      currentIteration++;
      img = sharp(inputImage);
    }
  }
  const newMimeType = "image/" + (options.format === "jpg" ? "jpeg" : options.format);
  await replaceImage(image, tempPath, newMimeType);
  logger.info(`Successfully replaced image: id=${image.id}`);
  try {
    await fs.rm(tempPath);
  } catch (err) {
    logger.warn(`Failed to clean up temporary image at \`${tempPath}\`\n${err}`);
  }
  const storageDiff = metadata.size === undefined ? 0 : (size - metadata.size) / metadata.size;
  const sizeDiff = (width - metadata.width) / metadata.width;
  return { storage: size, size: { width, height }, storageDiff, sizeDiff };
};

const upscaleImage = async (
  image: Image,
  options: { scale?: number; noise?: -1 | 0 | 1 | 2 | 3 } = {},
): Promise<ResizeResult> => {
  const imagePath = imageRepo.getImageFilePath(image.id);
  // waifu2x REQUIRES the file extension in order to work properly, but I don't want to mess with the original file, so
  // copy the original file into a temp file with the appropriate extension.
  let origExt = image.mimeType.substring(image.mimeType.indexOf("/") + 1);
  const origCopyPath = (await getTempFile()) + "." + origExt;
  await fs.copyFile(imagePath, origCopyPath);

  // metadata for the original image
  const origMetadata = await sharp(origCopyPath).metadata();
  let origSize = 0;
  try {
    const stats = await fs.stat(origCopyPath);
    origSize = stats.size;
  } catch (err) {
    logger.warn(`Failed to retrieve file stats at \`$${origCopyPath}\`\n${err}`);
  }
  options = { scale: 2, noise: 2, ...options };
  const outputPath = (await getTempFile()) + ".png";
  await waifu2x.upscaleImage(origCopyPath, outputPath, {
    scale: options.scale!,
    noise: options.noise!,
  });
  try {
    await fs.rm(origCopyPath);
  } catch (err) {
    logger.warn(`Failed to cleanup temp copied image at \`${origCopyPath}\`\n${err}`);
  }
  try {
    await fs.access(outputPath);
  } catch (err) {
    throw new Error("Failed to upscale image");
  }
  await replaceImage(image, outputPath, "image/png");
  logger.info(`Finished upscaling image: ${image.id}`);
  try {
    await fs.rm(outputPath);
  } catch (err) {
    logger.warn(`Failed to cleanup temp upscaled image at \`${outputPath}\`\n${err}`);
  }
  const newMetadata = await sharp(imagePath).metadata();
  let newSize = 0;
  try {
    const stats = await fs.stat(imagePath);
    newSize = stats.size;
  } catch (err) {
    logger.warn(`Failed to retrieve file stats at \`${imagePath}\`\n${err}`);
  }
  const sizeDiff = (newMetadata.width - origMetadata.width) / origMetadata.width;
  let storageDiff = 0;
  if (origSize > 0 && newSize > 0) {
    storageDiff = (newSize - origSize) / origSize;
  }
  return {
    storage: newSize,
    size: { width: newMetadata.width, height: newMetadata.height },
    storageDiff,
    sizeDiff,
  };
};

export { shrinkImage, upscaleImage };
