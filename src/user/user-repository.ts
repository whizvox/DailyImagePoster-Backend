import { v4 as uuidv4 } from "uuid";
import { User, TokenInfo } from "./user";
import logger from "../logger";
import { generateAccessToken } from "./access-token";
import { DEFAULT_ADMIN_CREATE, DEFAULT_ADMIN_NAME, TOKEN_SALT_ROUNDS } from "../config";
import { compare, hashSync } from "bcrypt";
import { randomBytes } from "node:crypto";

const initialize = async (): Promise<void> => {
  await User.sync();
  if (DEFAULT_ADMIN_CREATE) {
    const prevAdmin = await User.findOne({ where: { name: DEFAULT_ADMIN_NAME } });
    if (prevAdmin === null) {
      const password = randomBytes(12).toString("hex");
      const user = await add(DEFAULT_ADMIN_NAME, password, true);
      logger.warn(`Created default admin: name=${user.name}, password=${password}`);
    }
  }
}

const getAll = (): Promise<User[]> => {
  return User.findAll();
};

const get = (id: string): Promise<User | null> => {
  return User.findOne({ where: { id } });
};

const checkPassword = async (name: string, password: string): Promise<User | null> => {
  const user = await User.findOne({ where: { name } });
  if (user !== null) {
    if (await compare(password, user.password)) {
      return user;
    }
  }
  return null;
};

const getFromToken = async (accessToken: string): Promise<User | null> => {
  const user = await User.findOne({ where: { accessToken } });
  if (user !== null) {
    if (user.tokenExpiresAt === null) {
      logger.warn(
        `User has an unset token expiration, token will be automatically revoked: id=${user.id}, name=${user.name}`,
      );
      user.update({ accessToken: null, tokenExpiresAt: null });
    } else if (user.tokenExpiresAt.getDate() < new Date().getDate()) {
      logger.info(
        `User's access token has expired and will be automatically revoked: id=${user.id}, name=${user.name}`,
      );
      user.update({ accessToken: null, tokenExpiresAt: null });
    } else {
      return user;
    }
  }
  return null;
};

const isNameUnique = async (name: string): Promise<boolean> => {
  return (await User.count({ where: { name } })) === 0;
};

const add = async (name: string, password: string, admin: boolean): Promise<User> => {
  const user = await User.create({
    id: uuidv4(),
    name,
    password: hashSync(password, TOKEN_SALT_ROUNDS),
    admin,
  });
  logger.info(`Added new user: id=${user.id}, name=${name}, admin=${admin}`);
  return user;
};

const updateAccessToken = async (id: string, lifespan: number = 24): Promise<TokenInfo | null> => {
  const user = await get(id);
  if (user === null) {
    return null;
  }
  if (lifespan <= 0) {
    lifespan = 1;
  }
  const accessToken = generateAccessToken();
  const tokenExpiresAt = new Date();
  tokenExpiresAt.setDate(tokenExpiresAt.getDate() + lifespan / 24);
  await user.update({ accessToken, tokenExpiresAt });
  logger.info(`User ${user.name} has been given an access token that expires at ${tokenExpiresAt}`);
  return { token: accessToken, expires: tokenExpiresAt } as TokenInfo;
};

const revokeAccessToken = async (id: string): Promise<boolean> => {
  // why does this return a tuple?
  return (await User.update({ accessToken: null, tokenExpiresAt: null }, { where: { id } }))[0] > 0;
};

const remove = async (id: string): Promise<boolean> => {
  return (await User.destroy({ where: { id } })) > 0;
};

export default {
  initialize,
  getAll,
  get,
  checkPassword,
  getFromToken,
  isNameUnique,
  add,
  updateAccessToken,
  revokeAccessToken,
  remove,
};
