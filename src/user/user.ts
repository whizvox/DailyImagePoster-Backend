import { DataTypes, InferAttributes, InferCreationAttributes, Model, CreationOptional } from "sequelize";
import sequelize from "../db/database";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: string;
  declare name: string;
  declare password: string;
  declare admin: boolean;
  declare accessToken: string | null;
  declare tokenExpiresAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init({
  id: {
    type: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  accessToken: DataTypes.STRING,
  tokenExpiresAt: DataTypes.DATE,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, {
  sequelize
});

interface TokenInfo {
  token: string;
  expires: Date;
}

export { User, TokenInfo };
