import express, { Request } from "express";
import postRepo from "./post-repository";
import PostSearchQuery from "./post-search-query";
import Post from "./post";
import { v4 as uuidv4 } from "uuid";
import { ApiError, badRequest, conflict, created, ok } from "../api-result";
import {
  parseNumber,
  parseBoolean,
  parseDate,
  ParseError,
  parseUuid,
  parseTrimmedString,
} from "../query";

interface StrSearchQuery {
  page: string;
  limit: string;
  min_num: string;
  max_num: string;
  has_sub: string;
  min_sub: string;
  max_sub: string;
  title: string;
  artist: string;
  source: string;
  comment: string;
  image_nsfw: string;
  source_nsfw: string;
  direct_source: string;
  imgur_post: string;
  created_after: string;
  created_before: string;
}

interface StrCreateQuery {
  id: string;
  image: string;
  num: string;
  sub_num: string;
  title: string;
  artist: string;
  source: string;
  comment: string;
  image_nsfw: string;
  source_nsfw: string;
  direct_source: string;
  reddit_post_id: string;
  reddit_comment_id: string;
  imgur_id: string;
  created: string;
}

const parseSearchQuery = (query: StrSearchQuery): PostSearchQuery => {
  return {
    page: parseNumber(query.page, "page") || 0,
    limit: parseNumber(query.limit, "limit") || 20,
    min_num: parseNumber(query.min_num, "min_num"),
    max_num: parseNumber(query.max_num, "max_num"),
    has_sub: parseBoolean(query.has_sub, "has_sub"),
    min_sub: parseNumber(query.min_sub, "min_sub"),
    max_sub: parseNumber(query.max_sub, "max_sub"),
    title: parseTrimmedString(query.title),
    artist: parseTrimmedString(query.artist),
    source: parseTrimmedString(query.source),
    comment: parseTrimmedString(query.comment),
    image_nsfw: parseBoolean(query.image_nsfw, "image_nsfw"),
    source_nsfw: parseBoolean(query.source_nsfw, "source_nsfw"),
    direct_source: parseTrimmedString(query.direct_source),
    imgur_post: parseBoolean(query.imgur_post, "imgur_post"),
    created_after: parseDate(query.created_after, "created_after"),
    created_before: parseDate(query.created_before, "created_before"),
  } as PostSearchQuery;
};

const parseCreateQuery = (query: StrCreateQuery): Post => {
  return new Post(
    parseUuid(query.id, "id") ?? uuidv4(),
    parseTrimmedString(query.image)!,
    parseNumber(query.num, "num")!,
    parseNumber(query.sub_num, "sub_num") ?? 0,
    parseTrimmedString(query.title)!,
    parseTrimmedString(query.artist)!,
    parseTrimmedString(query.source)!,
    parseTrimmedString(query.comment) || null,
    parseBoolean(query.image_nsfw, "image_nsfw") ?? false,
    parseBoolean(query.source_nsfw, "source_nsfw") ?? false,
    parseTrimmedString(query.direct_source) || null,
    parseTrimmedString(query.reddit_post_id)!,
    parseTrimmedString(query.reddit_comment_id) || null,
    parseTrimmedString(query.imgur_id) || null,
    parseDate(query.created, "created") ?? new Date(),
  );
};

const router = express.Router();

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const post = postRepo.get(id);
  res.send(ok(post));
});

router.get("/", (req: Request<{}, {}, {}, StrSearchQuery>, res) => {
  const query = parseSearchQuery(req.query);
  const page = postRepo.getPage(query);
  res.send(ok(page));
});

router.post("/", (req: Request<{}, {}, {}, StrCreateQuery>, res) => {
  const query = req.query;
  const missing: string[] = [];
  if (query.image === undefined) {
    missing.push("image");
  }
  if (query.num === undefined) {
    missing.push("num");
  }
  if (query.title === undefined) {
    missing.push("title");
  }
  if (query.artist === undefined) {
    missing.push("artist");
  }
  if (query.source === undefined) {
    missing.push("source");
  }
  if (query.reddit_post_id === undefined) {
    missing.push("reddit_post_id");
  }
  if (missing.length > 0) {
    throw new ApiError(badRequest(`Missing required parameter(s): ${missing.join(", ")}`));
  }

  const post = parseCreateQuery(query);
  if (post.num < 1) {
    throw new ParseError("Must be a positive integer.", "num");
  }
  if (post.subNum < 0) {
    throw new ParseError("Must be a nonnegative integer.", "sub_num");
  }
  if (post.title === "") {
    throw new ParseError("Must not be blank.", "title");
  }
  if (post.artist === "") {
    throw new ParseError("Must not be blank.", "artist");
  }
  if (post.source === "") {
    throw new ParseError("Must not be blank.", "source");
  }
  if (!postRepo.isIdUnique(post.id)) {
    throw new ApiError(conflict(`(id) ${post.id}`));
  }
  if (!postRepo.isImageUnique(post.image)) {
    throw new ApiError(conflict(`(image) ${post.image}`));
  }
  if (!postRepo.isNumberUnique(post.num, post.subNum)) {
    throw new ApiError(conflict(`(num, sub_num) ${post.num}, ${post.subNum}`));
  }
  if (!postRepo.isRedditPostUnique(post.redditPostId)) {
    throw new ApiError(conflict(`(reddit_comment_id) ${post.redditPostId}`));
  }
  if (post.redditCommentId !== null && !postRepo.isRedditCommentUnique(post.redditCommentId)) {
    throw new ApiError(conflict(`(reddit_comment_id) ${post.redditCommentId}`));
  }
  if (post.imgurId !== null && !postRepo.isImgurPostUnique(post.imgurId)) {
    throw new ApiError(conflict(`(imgur_id) ${post.imgurId}`));
  }
  postRepo.add(post);
  res.status(201).send(created(post));
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const result = postRepo.remove(id);
  res.send(ok(result));
});

export default router;
