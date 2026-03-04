import fs from "node:fs";
import path from "node:path";
import pino from "pino";
import PinoPretty from "pino-pretty";
import { WORKING_DIR } from "./env";

const logger = pino(
  {},
  pino.multistream([{ stream: fs.createWriteStream(path.join(WORKING_DIR, "log.txt")) }, { stream: PinoPretty() }]),
);

export default logger;
