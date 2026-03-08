import { v4 as uuidv4 } from "uuid";
import db from "../db/database";
import { User, SecretUser, TokenInfo } from "./user";
import logger from "../logger";
import { generateAccessToken } from "./access-token";
import { DEFAULT_ADMIN_CREATE, DEFAULT_ADMIN_NAME, TOKEN_SALT_ROUNDS } from "../config";
import { compareSync, hashSync } from "bcrypt";
import { randomBytes } from "node:crypto";

const SQL_CREATE =
  "CREATE TABLE IF NOT EXISTS users(" +
  "id CHAR(36) PRIMARY KEY, " +
  "name VARCHAR(32) NOT NULL UNIQUE, " +
  "password TEXT NOT NULL, " +
  "admin BIT NOT NULL, " +
  "created TEXT NOT NULL, " +
  "access_token CHAR(64), " +
  "token_expires TEXT)";

const SQL_SELECT_ALL = "SELECT id,name,admin,created,token_expires FROM users";
const SQL_SELECT_BY_ID = `${SQL_SELECT_ALL} WHERE id = ?`;
const SQL_SELECT_BY_TOKEN = `${SQL_SELECT_ALL} WHERE access_token = ?`;
const SQL_SELECT_ALL_SECRET = "SELECT id,name,password,admin,created,access_token,token_expires FROM users";
const SQL_SELECT_BY_NAME = `${SQL_SELECT_ALL_SECRET} WHERE name = ?`;

const SQL_COUNT_ALL = "SELECT COUNT(1) AS count FROM users";
const SQL_COUNT_NAME = `${SQL_COUNT_ALL} WHERE name = ?`;

const SQL_INSERT =
  "INSERT INTO users (id,name,password,admin,created,access_token,token_expires) VALUES (?,?,?,?,?,?,?)";

const SQL_UPDATE_TOKEN = "UPDATE users SET access_token = ?, token_expires = ? WHERE id = ?";

const SQL_DELETE = "DELETE FROM users WHERE id = ?";

const parseUserRow = (row: unknown): User => {
  const $ = row as {
    id: string;
    name: string;
    admin: number;
    created: string;
    token_expires: string | null;
  };
  return new User(
    $.id,
    $.name,
    $.admin === 1,
    new Date($.created),
    $.token_expires === null ? null : new Date($.token_expires),
  );
};

const parseSecretRow = (row: unknown): SecretUser => {
  const $ = row as {
    id: string;
    name: string;
    password: string;
    admin: number;
    created: string;
    token_expires: string | null;
  };
  return new SecretUser(
    $.id,
    $.name,
    $.password,
    $.admin === 1,
    new Date($.created),
    null,
    $.token_expires === null ? null : new Date($.token_expires),
  );
};

const parseCount = (row: unknown): number => {
  return (row as { count: number }).count;
};

const initialize = () => {
  db.execute(SQL_CREATE);
  if (DEFAULT_ADMIN_CREATE && isNameUnique(DEFAULT_ADMIN_NAME)) {
    const password = randomBytes(16).toString("hex");
    const user = add(DEFAULT_ADMIN_NAME, password, true);
    logger.warn(`Created default admin: name=${user.name}, password=${password}`);
  }
};

const iterate = (consumer: (user: User) => void) => {
  db.iterate(SQL_SELECT_ALL, parseUserRow, consumer);
};

const getAll = (): User[] => {
  return db.gather(SQL_SELECT_ALL, parseUserRow);
};

const get = (id: string): User | null => {
  return db.query(SQL_SELECT_BY_ID, parseUserRow, id);
};

const checkPassword = (name: string, password: string): User | null => {
  const user = db.query(SQL_SELECT_BY_NAME, parseSecretRow, name);
  if (user !== null) {
    if (compareSync(password, user.password)) {
      return new User(user.id, user.name, user.admin, user.created, user.tokenExpires);
    }
  }
  return null;
};

const getFromToken = (token: string): User | null => {
  const user = db.query(SQL_SELECT_BY_TOKEN, parseUserRow, token);
  if (user !== null) {
    if (user.tokenExpires === null) {
      logger.warn(
        `User has an unset token expiration, token will be automatically revoked: id=${user.id}, name=${user.name}`,
      );
      db.execute(SQL_UPDATE_TOKEN, null, null);
    } else if (user.tokenExpires.getDate() < new Date().getDate()) {
      logger.info(
        `User's access token has expired and will be automatically revoked: id=${user.id}, name=${user.name}`,
      );
      db.execute(SQL_UPDATE_TOKEN, null, null);
    } else {
      return user;
    }
  }
  return null;
};

const countAll = (): number => {
  return db.query(SQL_COUNT_ALL, parseCount) ?? 0;
};

const isNameUnique = (name: string): boolean => {
  return db.query(SQL_COUNT_NAME, parseCount, name) === 0;
};

const add = (name: string, password: string, admin: boolean): User => {
  const user = new SecretUser(
    uuidv4(),
    name,
    hashSync(password, TOKEN_SALT_ROUNDS),
    admin,
    new Date(),
    null,
    null,
  );
  logger.info(`Added new user: id=${user.id}, name=${name}, admin=${admin}`);
  db.execute(
    SQL_INSERT,
    user.id,
    user.name,
    user.password,
    user.admin,
    user.created,
    user.accessToken,
    user.tokenExpires,
  );
  return new User(user.id, user.name, user.admin, user.created, user.tokenExpires);
};

const updateAccessToken = (id: string, lifespan: number = 24): TokenInfo | null => {
  const user = get(id);
  if (user === null) {
    return null;
  }
  if (lifespan <= 0) {
    lifespan = 1;
  }
  const token = generateAccessToken();
  const expires = new Date();
  expires.setDate(expires.getDate() + lifespan / 24);
  logger.info(`User ${user.name} has been given an access token that expires at ${expires}`);
  db.execute(SQL_UPDATE_TOKEN, token, expires, id);
  return { token, expires } as TokenInfo;
};

const revokeAccessToken = (id: string): boolean => {
  return db.execute(SQL_UPDATE_TOKEN, null, null, id).changes > 0;
};

const remove = (id: string): boolean => {
  return db.execute(SQL_DELETE, id).changes > 0;
};

export default {
  initialize,
  iterate,
  getAll,
  get,
  checkPassword,
  getFromToken,
  countAll,
  isNameUnique,
  add,
  updateAccessToken,
  revokeAccessToken,
  remove,
};
