import { Sequelize } from "sequelize";
import logger from "../logger";
import path from "node:path";
import { WORKING_DIR } from "../config";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(WORKING_DIR, "dailyimageposter.db"),
  logging: logger.debug.bind(logger),
});

export default sequelize;
