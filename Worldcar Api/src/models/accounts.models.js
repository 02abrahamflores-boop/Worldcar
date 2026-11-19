import bcrypt from 'bcrypt';
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const passwordSaltRounds = 10;

const Account = sequelize.define(
  'Account',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    person: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isActived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'accounts',
    timestamps: false,
    hooks: {
      beforeCreate: async (account) => {
        account.password = await bcrypt.hash(account.password, passwordSaltRounds);
      },
      beforeUpdate: async (account) => {
        if (account.changed('password')) {
          account.password = await bcrypt.hash(account.password, passwordSaltRounds);
        }
      },
    },
  },
);

Account.prototype.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default Account;