class Post {
  id: string;
  image: string;
  num: number;
  subNum: number;
  title: string;
  artist: string;
  source: string;
  comment: string | null;
  imageNsfw: boolean;
  sourceNsfw: boolean;
  directSource: string | null;
  redditPostId: string;
  redditCommentId: string | null;
  imgurId: string | null;
  created: Date;

  constructor(
    id: string,
    image: string,
    num: number,
    subNum: number,
    title: string,
    artist: string,
    source: string,
    comment: string | null,
    imageNsfw: boolean,
    sourceNsfw: boolean,
    directSource: string | null,
    redditPostId: string,
    redditCommentId: string | null,
    imgurId: string | null,
    created: Date,
  ) {
    this.id = id;
    this.image = image;
    this.num = num;
    this.subNum = subNum;
    this.title = title;
    this.artist = artist;
    this.source = source;
    this.comment = comment;
    this.imageNsfw = imageNsfw;
    this.sourceNsfw = sourceNsfw;
    this.directSource = directSource;
    this.redditPostId = redditPostId;
    this.redditCommentId = redditCommentId;
    this.imgurId = imgurId;
    this.created = created;
  }
}

export default Post;
