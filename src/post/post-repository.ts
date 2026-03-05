import { execute, iterate, query } from "../db/database";
import Page from "../db/page";
import Post from "./post";
import PostQuery from "./post-query";

const SQL_CREATE =
  "CREATE TABLE IF NOT EXISTS posts(" +
  "id CHAR(36) PRIMARY KEY, " +
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
  "INSERT INTO posts (id,number,sub_number,title,artist,source,comment,image_nsfw,source_nsfw,direct_source," +
  "reddit_post_id,reddit_comment_id,imgur_id,created) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

const SQL_SELECT_ALL =
  "SELECT id,number,sub_number,title,artist,source,comment,image_nsfw,source_nsfw,direct_source,reddit_post_id," +
  "reddit_comment_id,imgur_id,created FROM posts";
const SQL_SELECT_BY_ID = `${SQL_SELECT_ALL} WHERE id = ?`;
const SQL_DELETE_BY_ID = "DELETE FROM posts WHERE id = ?";

const parseFromRow = (row: unknown): Post => {
  const $ = row as {
    id: string;
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

const initialize = () => {
  execute(SQL_CREATE);
};

const getCount = (): number => {
  return query("SELECT COUNT(1) FROM posts", (row) => (row as { "COUNT(1)": number })["COUNT(1)"]) ?? 0;
};

const forEach = (consumer: (post: Post) => void, query?: PostQuery) => {
  if (query === undefined) {
    query = {} as PostQuery;
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
  iterate(`${SQL_SELECT_ALL} ${clauses.join(" ")}`, parseFromRow, consumer, ...params);
};

const getPage = (query: PostQuery): Page<Post> => {
  const items: Post[] = [];
  forEach((post) => items.push(post), query);
  const total = getCount();
  return new Page<Post>(query.page, total, query.limit, items);
};

const get = (id: string): Post | null => {
  return query(SQL_SELECT_BY_ID, parseFromRow, id);
};

const add = (post: Post) => {
  execute(
    SQL_INSERT,
    post.id,
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
  return execute(SQL_DELETE_BY_ID, id).changes > 0;
};

export { initialize, getCount, forEach, getPage, get, add, remove };
