import { Op, WhereAttributeHash } from "sequelize";
import Page from "../db/page.ts";
import Post from "./post.ts";
import PostSearchQuery from "./post-search-query.ts";
import sequelize from "../db/database.ts";
import { config } from "../config.ts";

const initialize = async (): Promise<void> => {
  await Post.sync({ force: config.ENVIRONMENT === "test" });
};

const isUnique = async (column: string, value: unknown): Promise<boolean> => {
  const count = await Post.count({
    where: sequelize.where(sequelize.col(column), value),
  });
  return count === 0;
};

const isIdUnique = async (id: string): Promise<boolean> => {
  return isUnique("id", id);
};

const isImageUnique = async (image: string): Promise<boolean> => {
  return isUnique("image", image);
};

const isNumberUnique = async (num: number, subNum: number | null): Promise<boolean> => {
  if (subNum === null) {
    return isUnique("num", num);
  }
  const count = await Post.count({
    where: {
      num: num,
      subNum: subNum,
      [Op.and]: [{ num: num }, { subNum: subNum }],
    },
  });
  return count === 0;
};

const isRedditPostUnique = (redditPostId: string): Promise<boolean> => {
  return isUnique("redditPostId", redditPostId);
};

const isRedditCommentUnique = (redditCommentId: string): Promise<boolean> => {
  return isUnique("redditCommentId", redditCommentId);
};

const isImgurPostUnique = (imgurId: string): Promise<boolean> => {
  return isUnique("imgurId", imgurId);
};

const getPage = async (query: PostSearchQuery = {} as PostSearchQuery): Promise<Page<Post>> => {
  const conditions: WhereAttributeHash[] = [];
  if (query.min_num !== undefined) {
    conditions.push({ num: { [Op.gte]: query.min_num } });
  }
  if (query.max_num !== undefined) {
    conditions.push({ num: { [Op.lte]: query.max_num } });
  }
  if (query.has_sub !== undefined) {
    if (query.has_sub) {
      conditions.push({ subNum: { [Op.ne]: 0 } });
    } else {
      conditions.push({ subNum: 0 });
    }
  }
  if (query.min_sub !== undefined) {
    conditions.push({ subNum: { [Op.gte]: query.min_sub } });
  }
  if (query.max_sub !== undefined) {
    conditions.push({ subNum: { [Op.lte]: query.max_sub } });
  }
  if (query.title !== undefined) {
    conditions.push({
      [Op.substring]: sequelize.where(sequelize.fn("LOWER", sequelize.col("title")), {
        [Op.substring]: query.title.toLowerCase(),
      }),
    });
  }
  if (query.artist !== undefined) {
    conditions.push({
      [Op.substring]: sequelize.where(sequelize.fn("LOWER", sequelize.col("artist")), {
        [Op.substring]: query.artist.toLowerCase(),
      }),
    });
  }
  if (query.source !== undefined) {
    conditions.push({
      [Op.substring]: sequelize.where(sequelize.fn("LOWER", sequelize.col("source")), {
        [Op.substring]: query.source.toLowerCase(),
      }),
    });
  }
  // TODO Add has_comment parameter
  if (query.comment !== undefined) {
    conditions.push({
      [Op.substring]: sequelize.where(sequelize.fn("LOWER", sequelize.col("comment")), {
        [Op.substring]: query.comment.toLowerCase(),
      }),
    });
  }
  // TODO Add has_direct_source parameter
  if (query.direct_source !== undefined) {
    conditions.push({
      [Op.substring]: sequelize.where(sequelize.fn("LOWER", sequelize.col("directSource")), {
        [Op.substring]: query.direct_source.toLowerCase(),
      }),
    });
  }
  if (query.image_nsfw !== undefined) {
    conditions.push({ imageNsfw: { [Op.is]: query.image_nsfw } });
  }
  if (query.source_nsfw !== undefined) {
    conditions.push({ sourceNsfw: { [Op.is]: query.source_nsfw } });
  }
  if (query.imgur_post !== undefined) {
    conditions.push({ imgurPost: { [query.imgur_post ? Op.not : Op.is]: null } });
  }
  if (query.created_after !== undefined) {
    conditions.push({ createdAt: { [Op.gte]: query.created_after } });
  }
  if (query.created_before !== undefined) {
    conditions.push({ createdAt: { [Op.lte]: query.created_before } });
  }
  const { count, rows } = await Post.findAndCountAll({
    where: {
      [Op.and]: conditions,
    },
    limit: query.limit,
    offset: query.limit * query.page,
  });
  const page = new Page(query.page, count, query.limit, rows);
  return page;
};

const get = (id: string): Promise<Post | null> => {
  return Post.findOne({ where: { id } });
};

const add = (post: Post): Promise<Post> => {
  return Post.create(post);
};

const remove = async (id: string): Promise<boolean> => {
  const changes = await Post.destroy({ where: { id } });
  return changes > 0;
};

export default {
  initialize,
  isIdUnique,
  isImageUnique,
  isNumberUnique,
  isRedditPostUnique,
  isRedditCommentUnique,
  isImgurPostUnique,
  getPage,
  get,
  add,
  remove,
};
