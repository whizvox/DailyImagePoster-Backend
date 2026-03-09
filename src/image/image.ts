import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import sequelize from "../db/database.ts";

class Image extends Model<InferAttributes<Image>, InferCreationAttributes<Image>> {
  declare id: string;
  declare mimeType: string;
  declare name: string;
  declare hash: string;
  declare createdAt: CreationOptional<Date>;
}

Image.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    updatedAt: false,
  },
);

export default Image;
