import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const ENVIRONMENT = process.env.ENVIRONMENT || "dev";
const PORT = process.env.PORT || 8080;
const WORKING_DIR = process.env.WORKING_DIR || "./run";
const LOG_LEVEL = process.env.LOG_LEVEL || "info";

mkdirSync(dirname(WORKING_DIR), { recursive: true });

export { PORT, WORKING_DIR, LOG_LEVEL };
