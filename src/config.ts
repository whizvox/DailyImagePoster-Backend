import fs from "node:fs";

const ENVIRONMENT = process.env.ENVIRONMENT || "dev";
const PORT = process.env.PORT || 8080;
const WORKING_DIR = process.env.WORKING_DIR || "./run";
const LOG_LEVEL = process.env.LOG_LEVEL || (ENVIRONMENT === "dev" ? "debug" : "info");
const SEND_SERVER_ERROR = process.env.SEND_SERVER_ERROR || ENVIRONMENT === "dev";
const TOKEN_LENGTH = Number(process.env.TOKEN_LENGTH) || 32;
const TOKEN_SALT_ROUNDS = Number(process.env.TOKEN_SALT_ROUNDS) || 10;
const DEFAULT_ADMIN_CREATE = process.env.DEFAULT_ADMIN_CREATE || true;
const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || "admin";

const initalize = () => {
  fs.mkdirSync(WORKING_DIR);
};

export {
  ENVIRONMENT,
  PORT,
  WORKING_DIR,
  LOG_LEVEL,
  SEND_SERVER_ERROR,
  TOKEN_LENGTH,
  TOKEN_SALT_ROUNDS,
  DEFAULT_ADMIN_CREATE,
  DEFAULT_ADMIN_NAME,
  initalize,
};
