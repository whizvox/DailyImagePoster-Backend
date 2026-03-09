import { randomBytes } from "node:crypto";
import { TOKEN_LENGTH } from "../config.ts";

const generateAccessToken = (): string => {
  return randomBytes(TOKEN_LENGTH).toString("hex");
};

export { generateAccessToken };
