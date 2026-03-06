import { v4 as uuidv4 } from "uuid";
import db from "../db/database";
import { User, SecretUser } from "./user";
import logger from "../logger";
import { generateAccessToken } from "./access-token";
import { DEFAULT_ADMIN_CREATE, DEFAULT_ADMIN_NAME } from "../config";

const SQL_CREATE =
  "CREATE TABLE IF NOT EXISTS users(" +
  "id CHAR(36) PRIMARY KEY, " +
  "name VARCHAR(32) NOT NULL UNIQUE, " +
  "admin BIT NOT NULL, " +
  "created TEXT NOT NULL, " +
  "access_token TEXT NOT NULL)";

const SQL_SELECT_ALL = "SELECT id,name,admin,created FROM users";
const SQL_SELECT_BY_ID = `${SQL_SELECT_ALL} WHERE id = ?`;
const SQL_SELECT_TOKEN = `${SQL_SELECT_ALL} WHERE access_token = ?`;

const SQL_COUNT_ALL = "SELECT COUNT(1) AS count FROM users";
const SQL_COUNT_NAME = `${SQL_COUNT_ALL} WHERE name = ?`;

const SQL_INSERT = "INSERT INTO users (id,name,admin,created,access_token) VALUES (?,?,?,?,?)";

const SQL_DELETE = "DELETE FROM users WHERE id = ?";

const parseRow = (row: unknown): User => {
  const $ = row as {
    id: string;
    name: string;
    admin: number;
    created: string;
  };
  return new User($.id, $.name, $.admin === 1, new Date($.created));
};

const parseSecretRow = (row: unknown): SecretUser => {
  const $ = row as {
    id: string;
    name: string;
    admin: number;
    created: string;
    access_token: string;
  };
  return new SecretUser($.id, $.name, $.admin === 1, new Date($.created), $.access_token);
};

const parseCount = (row: unknown): number => {
  return (row as { count: number }).count;
};

const initialize = () => {
  db.execute(SQL_CREATE);
  if (DEFAULT_ADMIN_CREATE && isNameUnique(DEFAULT_ADMIN_NAME)) {
    const user = add(DEFAULT_ADMIN_NAME, true);
    logger.warn(`Created default admin: name=${user.name}, token=${user.accessToken}`);
  }
};

const iterate = (consumer: (user: User) => void) => {
  db.iterate(SQL_SELECT_ALL, parseRow, consumer);
};

const getAll = (): User[] => {
  return db.gather(SQL_SELECT_ALL, parseRow);
};

const get = (id: string): User | null => {
  return db.query(SQL_SELECT_BY_ID, parseRow, id);
};

const getFromToken = (token: string): User | null => {
  return db.query(SQL_SELECT_TOKEN, parseRow, token);
};

const countAll = (): number => {
  return db.query(SQL_COUNT_ALL, parseCount) ?? 0;
};

const isNameUnique = (name: string): boolean => {
  return db.query(SQL_COUNT_NAME, parseCount, name) === 0;
};

const add = (name: string, admin: boolean): SecretUser => {
  const user = new SecretUser(uuidv4(), name, admin, new Date(), generateAccessToken());
  logger.info(`Added new user: ${user as User}`);
  db.execute(SQL_INSERT, user.id, user.name, user.admin, user.created, user.accessToken);
  return user;
};

const remove = (id: string): boolean => {
  return db.execute(SQL_DELETE, id).changes > 0;
};

export default {
  initialize,
  iterate,
  getAll,
  get,
  getFromToken,
  countAll,
  isNameUnique,
  add,
  remove,
};
