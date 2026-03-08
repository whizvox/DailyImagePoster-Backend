import { Sequelize } from "sequelize";
import logger from "../logger";
import path from "node:path";
import { WORKING_DIR } from "../config";

const sequelizeLogger = logger.child({ module: "Sequelize" });

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(WORKING_DIR, "dailyimageposter.db"),
  logging: (msg) => sequelizeLogger.debug(msg),
});

export default sequelize;
