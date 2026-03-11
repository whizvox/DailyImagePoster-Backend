import { v4 as uuidv4 } from "uuid";
import { config } from "../config.ts";
import Page from "../db/page.ts";
import Image from "../image/image.ts";
import logger from "../logger.ts";
import Reserve from "./reserve.ts";

const initialize = async () => {
  await Reserve.sync({ force: config.ENVIRONMENT === "test" });
};

const get = async (id: string): Promise<Reserve | null> => {
  return Reserve.findByPk(id);
};

const getAll = async (options: { page?: number; limit?: number }): Promise<Page<Reserve>> => {
  const page = options.page ?? 0;
  const limit = options.limit ?? 20;
  const { rows, count } = await Reserve.findAndCountAll({
    offset: page * limit,
    limit,
  });
  return new Page(page, count, limit, rows);
};

const add = async (
  image: Image,
  options: {
    title?: string;
    artist?: string;
    source?: string;
    comment?: string;
    imageNsfw?: boolean;
    sourceNsfw?: boolean;
    directSource?: string;
  },
): Promise<Reserve> => {
  const reserve = await Reserve.create({
    id: uuidv4(),
    image: image.id,
    title: options.title ?? "",
    artist: options.artist ?? "",
    source: options.source ?? "",
    comment: options.comment ?? "",
    imageNsfw: options.imageNsfw ?? false,
    sourceNsfw: options.sourceNsfw ?? false,
    directSource: options.directSource ?? "",
  });
  logger.info(`Created new reserve: id=${reserve.id}, image=${reserve.image}`);
  return reserve;
};

const update = async (
  id: string,
  options: {
    image?: Image;
    title?: string;
    artist?: string;
    source?: string;
    comment?: string;
    imageNsfw?: boolean;
    sourceNsfw?: boolean;
    directSource?: string;
  },
): Promise<Reserve | null> => {
  const { image, ...otherOptions } = options;
  const reserve = await Reserve.findByPk(id);
  if (reserve === null) {
    return null;
  }
  await reserve.update({ ...(image && { image: image.id }), ...otherOptions });
  return reserve;
};

const remove = async (id: string): Promise<boolean> => {
  const deleted = (await Reserve.destroy({ where: { id } })) === 1;
  if (deleted) {
    logger.info(`Deleted reserve: id=${id}`);
  }
  return deleted;
};

const reserveRepo = {
  initialize,
  get,
  getAll,
  add,
  update,
  remove,
};

export default reserveRepo;
