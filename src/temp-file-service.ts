import path from "node:path";
import { config } from "./config";
import { v4 as uuivv4 } from "uuid";
import fs from "node:fs/promises";
import logger from "./logger";

const getPath = (name: string): string => {
  return path.join(config.WORKING_DIR, "temp", name);
};

const getTempFile = async (): Promise<string> => {
  const tempPath = getPath(uuivv4());
  await fs.mkdir(path.dirname(tempPath), { recursive: true });
  return tempPath;
};

const deleteTempFile = async (tempPath: string): Promise<void> => {
  try {
    await fs.rm(tempPath);
  } catch (err) {
    logger.info(`Attempted to delete nonexistent temp file: ${tempPath}`);
  }
};

export { getTempFile, deleteTempFile };
