import { randomBytes } from "node:crypto";
import { config } from "../config.ts";

const generateAccessToken = (): string => {
  return randomBytes(config.TOKEN_LENGTH).toString("hex");
};

export { generateAccessToken };
