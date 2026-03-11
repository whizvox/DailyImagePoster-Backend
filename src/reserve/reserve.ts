import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import sequelize from "../db/database";
import Image from "../image/image";

class Reserve extends Model<InferAttributes<Reserve>, InferCreationAttributes<Reserve>> {
  declare id: string;
  declare image: string;
  declare title: string;
  declare artist: string;
  declare source: string;
  declare comment: string;
  declare imageNsfw: boolean;
  declare sourceNsfw: boolean;
  declare directSource: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Reserve.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
    },
    image: {
      type: DataTypes.UUIDV4,
      references: {
        model: Image,
        key: "id",
      },
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
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imageNsfw: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    sourceNsfw: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    directSource: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
  },
);

export default Reserve;
