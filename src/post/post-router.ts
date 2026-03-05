import express, { Request } from "express";
import { getPage, get as getPost } from "./post-repository";
import PostQuery from "./post-query";
import Post from "./post";
import { v4 as uuidv4 } from "uuid";

interface SearchQuery {
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

interface CreateQuery {
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
}

const parse = <Type>(param: string | undefined, parser: (param: string) => Type): Type | undefined => {
  if (param === undefined) {
    return undefined;
  }
  return parser(param);
};

const parseNumber = (param: string | undefined): number | undefined => {
  return parse(param, (p) => Number(p));
};

const parseBoolean = (param: string | undefined): boolean | undefined => {
  return parse(param, (p) => p !== "0");
};

const parseDate = (param: string | undefined): Date | undefined => {
  return parse(param, (p) => new Date(p));
};

const parseSearchQuery = (query: SearchQuery): PostQuery => {
  return {
    page: parseNumber(query.page) || 0,
    limit: parseNumber(query.limit) || 20,
    min_num: parseNumber(query.min_num),
    max_num: parseNumber(query.max_num),
    has_sub: parseBoolean(query.has_sub),
    min_sub: parseNumber(query.min_sub),
    max_sub: parseNumber(query.max_sub),
    title: query.title,
    artist: query.artist,
    source: query.source,
    comment: query.comment,
    image_nsfw: parseBoolean(query.image_nsfw),
    source_nsfw: parseBoolean(query.source_nsfw),
    direct_source: query.direct_source,
    imgur_post: parseBoolean(query.imgur_post),
    created_after: parseDate(query.created_after),
    created_before: parseDate(query.created_before),
  } as PostQuery;
};

const router = express.Router();

router.get("/", (req: Request<{}, {}, {}, SearchQuery>, res) => {
  const query = parseSearchQuery(req.query);
  const page = getPage(query);
  res.send(page);
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const post = getPost(id);
  res.send(post);
});

// router.post("/", (req: Request<{}, {}, {}, CreateQuery>, res) => {
//   const query = req.query;
//   if (query.num < 0) {

//   }
// });

export default router;
