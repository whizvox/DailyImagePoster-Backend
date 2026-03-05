import PageQuery from "../db/page-query";

interface PostQuery extends PageQuery {
  min_num: number;
  max_num: number;
  has_sub: boolean;
  min_sub: number;
  max_sub: number;
  title: string;
  artist: string;
  source: string;
  comment: string;
  image_nsfw: boolean;
  source_nsfw: boolean;
  direct_source: string;
  imgur_post: boolean;
  created_after: Date;
  created_before: Date;
}

export default PostQuery;
