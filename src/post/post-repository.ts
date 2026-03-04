import { execute, iterate, query } from "../db/database";
import Post from "./post";
import PostQuery from "./post-query";

const SQL_CREATE =
  "CREATE TABLE IF NOT EXISTS posts(" +
  "id             CHAR(36)      PRIMARY KEY, " +
  "number         INT           NOT NULL, " +
  "sub_number     TINYINT       NOT NULL, " +
  "title          VARCHAR(255)  NOT NULL, " +
  "artist         VARCHAR(255)  NOT NULL, " +
  "source         VARCHAR(255)  NOT NULL, " +
  "comment        VARCHAR(255), " +
  "image_nsfw     BIT           NOT NULL, " +
  "source_nsfw    BIT           NOT NULL, " +
  "direct_source  VARCHAR(255), " +
  "created        TEXT          NOT NULL" +
  ")";

const SQL_INSERT =
  "INSERT INTO posts (id,number,sub_number,title,artist,source,comment,image_nsfw,source_nsfw,direct_source,created) " +
  "VALUES (?,?,?,?,?,?,?,?,?,?,?)";

const SQL_SELECT_ALL =
  "SELECT id,number,sub_number,title,artist,source,comment,image_nsfw,source_nsfw,direct_source,created FROM posts";

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
    new Date($.created),
  );
};

const initialize = () => {
  execute(SQL_CREATE);
};

const forEach = (params: unknown[], query: PostQuery | null, consumer: (post: Post) => void) => {
  const finalParams = [...params];
  const conditions: string[] = [];
  if (query !== null) {
    const finalParams = [...params];
    const conditions: string[] = [];
    if (query.min_num !== undefined) {
      conditions.push("number >= ?");
      finalParams.push(query.min_num);
    }
    if (query.max_num !== undefined) {
      conditions.push("number <= ?");
      finalParams.push(query.max_num);
    }
    if (query.has_sub !== undefined) {
      conditions.push(`sub_number ${query.has_sub ? "<>" : "="} 0`);
    }
    if (query.min_sub !== undefined) {
      conditions.push("sub_number >= ?");
      finalParams.push(query.min_sub);
    }
    if (query.max_sub !== undefined) {
      conditions.push("sub_numbber <= ?");
      finalParams.push(query.max_sub);
    }
    if (query.title !== undefined) {
      conditions.push("LOWER(title) LIKE ?");
      finalParams.push(`%${query.title.toLowerCase()}%`);
    }
    if (query.artist !== undefined) {
      conditions.push("LOWER(artist) LIKE ?");
      finalParams.push(`%${query.artist.toLowerCase()}%`);
    }
    if (query.source !== undefined) {
      conditions.push("LOWER(source) LIKE ?");
      finalParams.push(`%${query.source.toLowerCase()}%`);
    }
    if (query.comment !== undefined) {
      conditions.push("LOWER(comment) LIKE ?");
      finalParams.push(`%${query.comment.toLowerCase()}%`);
    }
    if (query.direct_source !== undefined) {
      conditions.push("LOWER(direct_source) LIKE ?");
      finalParams.push(`%${query.direct_source.toLowerCase()}%`);
    }
    if (query.image_nsfw !== undefined) {
      conditions.push("image_nsfw = ?");
      finalParams.push(query.image_nsfw);
    }
    if (query.source_nsfw !== undefined) {
      conditions.push("source_nsfw = ?");
      finalParams.push(query.source_nsfw);
    }
    if (query.created_after !== undefined) {
      conditions.push("julianday(created) > julianday(?)");
      finalParams.push(query.created_after.toISOString());
    }
    if (query.created_before !== undefined) {
      conditions.push("julianday(created) < julianday(?)");
      finalParams.push(query.created_before.toISOString());
    }
  }
  if (conditions.length === 0) {
    iterate(SQL_SELECT_ALL, parseFromRow, consumer, ...params);
  } else {
    iterate(SQL_SELECT_ALL + " " + conditions.join(" AND "), parseFromRow, consumer, ...finalParams);
  }
};

const get = (id: string): Post => {
  return query(SQL_SELECT_ALL, parseFromRow, id);
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
    post.created,
  );
};

const remove = (id: string): boolean => {
  return execute("DELETE FROM posts WHERE id=?", id).changes > 0;
};

export { initialize, forEach, get, add, remove };
