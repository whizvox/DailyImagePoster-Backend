import db from "../db/database";
import Page from "../db/page";
import Post from "./post";
import PostSearchQuery from "./post-search-query";

const SQL_CREATE =
  "CREATE TABLE IF NOT EXISTS posts(" +
  "id CHAR(36) PRIMARY KEY, " +
  "image VARCHAR(255) UNIQUE, " +
  "number INT NOT NULL, " +
  "sub_number TINYINT NOT NULL, " +
  "title VARCHAR(255) NOT NULL, " +
  "artist VARCHAR(255) NOT NULL, " +
  "source VARCHAR(255) NOT NULL, " +
  "comment VARCHAR(255), " +
  "image_nsfw BIT NOT NULL, " +
  "source_nsfw BIT NOT NULL, " +
  "direct_source VARCHAR(255), " +
  "reddit_post_id VARCHAR(12), " +
  "reddit_comment_id VARCHAR(12), " +
  "imgur_id VARCHAR(12), " +
  "created TEXT NOT NULL)";

const SQL_INSERT =
  "INSERT INTO posts (id,image,number,sub_number,title,artist,source,comment,image_nsfw,source_nsfw,direct_source," +
  "reddit_post_id,reddit_comment_id,imgur_id,created) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

const SQL_COUNT_ALL = "SELECT COUNT(1) FROM posts";
const SQL_COUNT_BY_ID = `${SQL_COUNT_ALL} WHERE id = ?`;
const SQL_COUNT_BY_IMAGE = `${SQL_COUNT_ALL} WHERE image = ?`;
const SQL_COUNT_BY_NUMBER = `${SQL_COUNT_ALL} WHERE number = ? AND sub_number = ?`;
const SQL_COUNT_BY_REDDIT_POST_ID = `${SQL_COUNT_ALL} WHERE reddit_post_id = ?`;
const SQL_COUNT_BY_REDDIT_COMMENT_ID = `${SQL_COUNT_ALL} WHERE reddit_comment_id = ?`;
const SQL_COUNT_BY_IMGUR_ID = `${SQL_COUNT_ALL} WHERE imgur_id = ?`;

const SQL_SELECT_ALL =
  "SELECT id,image,number,sub_number,title,artist,source,comment,image_nsfw,source_nsfw,direct_source,reddit_post_id," +
  "reddit_comment_id,imgur_id,created FROM posts";
const SQL_SELECT_BY_ID = `${SQL_SELECT_ALL} WHERE id = ?`;
const SQL_DELETE_BY_ID = "DELETE FROM posts WHERE id = ?";

const parseRow = (row: unknown): Post => {
  const $ = row as {
    id: string;
    image: string;
    number: number;
    sub_number: number;
    title: string;
    artist: string;
    source: string;
    comment: string | null;
    image_nsfw: number;
    source_nsfw: number;
    direct_source: string | null;
    reddit_post_id: string;
    reddit_comment_id: string | null;
    imgur_id: string | null;
    created: string;
  };
  return new Post(
    $.id,
    $.image,
    $.number,
    $.sub_number,
    $.title,
    $.artist,
    $.source,
    $.comment,
    $.image_nsfw == 1,
    $.source_nsfw == 1,
    $.direct_source,
    $.reddit_post_id,
    $.reddit_comment_id,
    $.imgur_id,
    new Date($.created),
  );
};

const parseCount = (row: unknown): number | undefined => {
  return (row as { "COUNT(1)": number })["COUNT(1)"];
};

const initialize = () => {
  db.execute(SQL_CREATE);
};

const getCount = (): number => {
  return db.query(SQL_COUNT_ALL, parseCount) ?? 0;
};

const isUnique = (sql: string, ...params: unknown[]): boolean => {
  return db.query(sql, parseCount, ...params) === 0;
};

const isIdUnique = (id: string): boolean => {
  return isUnique(SQL_COUNT_BY_ID, id);
};

const isImageUnique = (image: string): boolean => {
  return isUnique(SQL_COUNT_BY_IMAGE, image);
};

const isNumberUnique = (num: number, subNum: number): boolean => {
  return isUnique(SQL_COUNT_BY_NUMBER, num, subNum);
};

const isRedditPostUnique = (redditPostId: string): boolean => {
  return isUnique(SQL_COUNT_BY_REDDIT_POST_ID, redditPostId);
};

const isRedditCommentUnique = (redditCommentId: string): boolean => {
  return isUnique(SQL_COUNT_BY_REDDIT_COMMENT_ID, redditCommentId);
};

const isImgurPostUnique = (imgurId: string): boolean => {
  return isUnique(SQL_COUNT_BY_IMGUR_ID, imgurId);
};

const forEach = (consumer: (post: Post) => void, query?: PostSearchQuery) => {
  if (query === undefined) {
    query = {} as PostSearchQuery;
  }
  const params: unknown[] = [];
  const conditions: string[] = [];
  if (query.min_num !== undefined) {
    conditions.push("number >= ?");
    params.push(query.min_num);
  }
  if (query.max_num !== undefined) {
    conditions.push("number <= ?");
    params.push(query.max_num);
  }
  if (query.has_sub !== undefined) {
    conditions.push(`sub_number ${query.has_sub ? "<>" : "="} 0`);
  }
  if (query.min_sub !== undefined) {
    conditions.push("sub_number >= ?");
    params.push(query.min_sub);
  }
  if (query.max_sub !== undefined) {
    conditions.push("sub_numbber <= ?");
    params.push(query.max_sub);
  }
  if (query.title !== undefined) {
    conditions.push("LOWER(title) LIKE ?");
    params.push(`%${query.title.toLowerCase()}%`);
  }
  if (query.artist !== undefined) {
    conditions.push("LOWER(artist) LIKE ?");
    params.push(`%${query.artist.toLowerCase()}%`);
  }
  if (query.source !== undefined) {
    conditions.push("LOWER(source) LIKE ?");
    params.push(`%${query.source.toLowerCase()}%`);
  }
  if (query.comment !== undefined) {
    conditions.push("LOWER(comment) LIKE ?");
    params.push(`%${query.comment.toLowerCase()}%`);
  }
  if (query.direct_source !== undefined) {
    conditions.push("LOWER(direct_source) LIKE ?");
    params.push(`%${query.direct_source.toLowerCase()}%`);
  }
  if (query.image_nsfw !== undefined) {
    conditions.push("image_nsfw = ?");
    params.push(query.image_nsfw);
  }
  if (query.source_nsfw !== undefined) {
    conditions.push("source_nsfw = ?");
    params.push(query.source_nsfw);
  }
  if (query.imgur_post !== undefined) {
    conditions.push("imgur_post = ?");
    params.push(query.imgur_post);
  }
  if (query.created_after !== undefined) {
    conditions.push("julianday(created) > julianday(?)");
    params.push(query.created_after.toISOString());
  }
  if (query.created_before !== undefined) {
    conditions.push("julianday(created) < julianday(?)");
    params.push(query.created_before.toISOString());
  }
  const clauses: string[] = [];
  if (conditions.length > 0) {
    clauses.push(conditions.join(" AND "));
  }
  if (query.page > 0) {
    clauses.push("OFFSET ?");
    params.push(query.page * query.limit);
  }
  clauses.push("LIMIT ?");
  params.push(query.limit);
  db.iterate(`${SQL_SELECT_ALL} ${clauses.join(" ")}`, parseRow, consumer, ...params);
};

const getPage = (query: PostSearchQuery): Page<Post> => {
  const items: Post[] = [];
  forEach((post) => items.push(post), query);
  const total = getCount();
  return new Page<Post>(query.page, total, query.limit, items);
};

const get = (id: string): Post | null => {
  return db.query(SQL_SELECT_BY_ID, parseRow, id);
};

const add = (post: Post) => {
  db.execute(
    SQL_INSERT,
    post.id,
    post.image,
    post.num,
    post.subNum,
    post.title,
    post.artist,
    post.source,
    post.comment,
    post.imageNsfw,
    post.sourceNsfw,
    post.directSource,
    post.redditPostId,
    post.redditCommentId,
    post.imgurId,
    post.created,
  );
};

const remove = (id: string): boolean => {
  return db.execute(SQL_DELETE_BY_ID, id).changes > 0;
};

export default {
  initialize,
  getCount,
  isIdUnique,
  isImageUnique,
  isNumberUnique,
  isRedditPostUnique,
  isRedditCommentUnique,
  isImgurPostUnique,
  forEach,
  getPage,
  get,
  add,
  remove,
};
