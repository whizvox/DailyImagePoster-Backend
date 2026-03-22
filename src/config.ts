import fs from "node:fs";

const ENVIRONMENTS = ["test", "dev", "prod"] as const;
type EnvironmentType = (typeof ENVIRONMENTS)[number];

const env = process.env.ENVIRONMENT || "dev";
if (!ENVIRONMENTS.includes(env as any)) {
  throw new Error(`Unknown ENVIRONMENT: ${env}`);
}
const ENVIRONMENT: EnvironmentType = env as EnvironmentType;

const PORT: number = Number(process.env.PORT) || 8080;
if (Number.isNaN(PORT)) {
  throw new Error(`Invalid port: ${process.env.PORT}`);
}

const WORKING_DIR = process.env.WORKING_DIR || "./run";
const LOG_LEVEL = process.env.LOG_LEVEL || (ENVIRONMENT === "dev" ? "debug" : "info");
const SEND_SERVER_ERROR = process.env.SEND_SERVER_ERROR || ENVIRONMENT === "dev";
const TOKEN_LENGTH = Number(process.env.TOKEN_LENGTH) || 32;
const TOKEN_SALT_ROUNDS = Number(process.env.TOKEN_SALT_ROUNDS) || 10;
const DEFAULT_ADMIN_CREATE = process.env.DEFAULT_ADMIN_CREATE || true;
const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || "admin";
const MAX_IMAGE_SIZE = Number(process.env.MAX_IMAGE_SIZE) || 20 * 1024 * 1024; // 20 MB
const IMAGE_HASH_BITS = Number(process.env.IMAGE_HASH_BITS) || 16;
const CORS_ALLOW_ORIGIN: string[] = process.env.CORS_ALLOW_ORIGIN?.split(";").map((s) =>
  s.trim(),
) ?? ["*"];

const initalize = () => {
  fs.mkdirSync(WORKING_DIR, { recursive: true });
};

const config = {
  ENVIRONMENT,
  PORT,
  WORKING_DIR,
  LOG_LEVEL,
  SEND_SERVER_ERROR,
  TOKEN_LENGTH,
  TOKEN_SALT_ROUNDS,
  DEFAULT_ADMIN_CREATE,
  DEFAULT_ADMIN_NAME,
  MAX_IMAGE_SIZE,
  IMAGE_HASH_BITS,
  CORS_ALLOW_ORIGIN,
};

export { config, initalize };
