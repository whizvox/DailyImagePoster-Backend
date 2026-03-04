class Post {
  id: string;
  num: number;
  subNum: number;
  title: string;
  artist: string;
  source: string;
  comment: string | null;
  imageNsfw: boolean;
  sourceNsfw: boolean;
  directSource: string | null;
  created: Date;

  constructor(
    id: string,
    num: number,
    subNum: number,
    title: string,
    artist: string,
    source: string,
    comment: string | null,
    imageNsfw: boolean,
    sourceNsfw: boolean,
    directSource: string | null = null,
    created: Date,
  ) {
    this.id = id;
    this.num = num;
    this.subNum = subNum;
    this.title = title;
    this.artist = artist;
    this.source = source;
    this.comment = comment;
    this.imageNsfw = imageNsfw;
    this.sourceNsfw = sourceNsfw;
    this.directSource = directSource;
    this.created = created;
  }
}

export default Post;
