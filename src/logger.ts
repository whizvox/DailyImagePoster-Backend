import fs from "node:fs";
import path from "node:path";
import pino from "pino";
import PinoPretty from "pino-pretty";
import { config } from "./config.ts";

const logger = pino(
  { level: config.LOG_LEVEL },
  pino.multistream([
    {
      level: config.LOG_LEVEL,
      stream: fs.createWriteStream(path.join(config.WORKING_DIR, "log.txt"), { flags: "a" }),
    },
    { level: config.LOG_LEVEL, stream: PinoPretty() },
  ]),
);

export default logger;
