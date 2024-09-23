import { Sequelize, DataTypes } from "sequelize";

const sequelize_db = new Sequelize({
  dialect: "sqlite",
  storage: "./todos.db",
});

async function init_db() {
  return await sequelize_db.sync({ force: true });
}

const Todo = sequelize_db.define(
  "Todo",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    url: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "todos",
    timestamps: false,
  }
);

const Tag = sequelize_db.define(
  "Tag",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "tags",
    timestamps: false,
  }
);

const TodoTag = sequelize_db.define(
  "TodoTag",
  {
    todo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Todo,
        key: "id",
      },
    },
    tag_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Tag,
        key: "id",
      },
    },
  },
  {
    tableName: "todo_tags",
    timestamps: false,
    primaryKey: {
      name: "todo_tag_pkey",
      fields: ["todo_id", "tag_id"],
    },
  }
);

Todo.belongsToMany(Tag, { through: TodoTag, foreignKey: "todo_id" });
Tag.belongsToMany(Todo, { through: TodoTag, foreignKey: "tag_id" });

export { sequelize_db, Todo, Tag, TodoTag, init_db };
