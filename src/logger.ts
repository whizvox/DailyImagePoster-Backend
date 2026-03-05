import fs from "node:fs";
import path from "node:path";
import pino from "pino";
import PinoPretty from "pino-pretty";
import { LOG_LEVEL, WORKING_DIR } from "./config";

const logger = pino(
  { level: LOG_LEVEL },
  pino.multistream([
    { level: LOG_LEVEL, stream: fs.createWriteStream(path.join(WORKING_DIR, "log.txt"), { flags: "a" }) },
    { level: LOG_LEVEL, stream: PinoPretty() },
  ]),
);

export default logger;
