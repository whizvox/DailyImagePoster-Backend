import { DataTypes, InferAttributes, InferCreationAttributes, Model, CreationOptional } from "sequelize";
import sequelize from "../db/database";

class Post extends Model<InferAttributes<Post>, InferCreationAttributes<Post>> {
  declare id: string;
  declare image: string;
  declare num: number;
  declare subNum: number;
  declare title: string;
  declare artist: string;
  declare source: string;
  declare comment: string | null;
  declare imageNsfw: boolean;
  declare sourceNsfw: boolean;
  declare directSource: string | null;
  declare redditPostId: string;
  declare redditCommentId: string | null;
  declare imgurId: string | null;
  declare uploadedAt: Date;
  declare createdAt: CreationOptional<Date>;
}

Post.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    num: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subNum: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    artist: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comment: DataTypes.STRING,
    imageNsfw: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    sourceNsfw: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    directSource: DataTypes.STRING,
    redditPostId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    redditCommentId: DataTypes.STRING,
    imgurId: DataTypes.STRING,
    uploadedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    updatedAt: false,
  },
);

export default Post;
