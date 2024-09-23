import Router from "koa-router";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";

import { sequelize_db, init_db, Tag, Todo, TodoTag } from "./sequelize.js";

const router = new Router();

const app = new Koa();

init_db();

//TODOS

router
  .get("/todos/", listTodos)
  .del("/todos/", clearTodos)
  .post("/todos/", addTodos)
  .get("todo", "/todos/:id", showTodos)
  .patch("/todos/:id", updateTodos)
  .del("/todos/:id", removeTodos)
  .get("/todos/:id/tags", getTodoTags)
  .post("/todos/:id/tags", addTodoTags)
  .del("/todos/:id/tags", delTodoTags)
  .del("/todos/:id/tags/:tag_id", delTodoTag);

async function delTodoTag(ctx) {
  const id = ctx.params.id;
  const tag_id = ctx.params.tag_id;

  const todo = await Todo.findByPk(id, { include: { model: Tag, as: "tags" } });
  if (!todo) ctx.throw(404, { error: "Todo not found" });
  await todo.removeTags(tag_id);

  ctx.status = 200;
}

async function delTodoTags(ctx) {
  const id = ctx.params.id;
  const todo = await Todo.findByPk(id, { include: { model: Tag, as: "tags" } });
  if (!todo) ctx.throw(404, { error: "Todo not found" });
  await todo.setTags([]);
  ctx.status = 204;
}

async function addTodoTags(ctx) {
  const id = ctx.params.id;
  const tag_id = ctx.request.body.id;
  const todo = await Todo.findByPk(id);
  const tag = await Tag.findByPk(tag_id);
  if (todo && tag) {
    await todo.addTag(tag);
  } else {
    ctx.throw(404, { error: "Todo or Tag not found" });
  }

  ctx.status = 200; // should be 204
  ctx.body = tag;
}

async function getTodoTags(ctx) {
  const id = ctx.params.id;
  const todo = await Todo.findByPk(id, {
    include: { model: Tag, as: "tags" },
    plain: true,
  });
  if (!todo) ctx.throw(404, { error: "Todo not found" });
  ctx.body = todo.dataValues["tags"].map((tag) => tag.dataValues);
  ctx.status = 200;
}

async function listTodos(ctx) {
  const todos = (await Todo.findAll()).map((todo) => todo.dataValues);
  ctx.body = todos;
}

async function clearTodos(ctx) {
  await Todo.destroy({ where: {} });
  ctx.status = 204;
}

async function addTodos(ctx) {
  const todo = ctx.request.body;
  if (!todo.title) ctx.throw(400, { error: '"title" is a required field' });
  const title = todo.title;
  if (!typeof data === "string" || !title.length)
    ctx.throw(400, {
      error: '"title" must be a string with at least one character',
    });

  todo["completed"] = todo["completed"] || false;

  const newTodo = await Todo.create(todo);
  const url = `http://${ctx.host}/todos/${newTodo.id}`;
  await newTodo.update({ url: url });
  ctx.status = 303;
  ctx.set("Location", url);
}

async function showTodos(ctx) {
  const id = ctx.params.id;
  const todo = await Todo.findByPk(id, { include: { model: Tag, as: "tags" } });

  if (!todo) ctx.throw(404, { error: "Todo not found" });
  ctx.body = todo;
  ctx.status = 201;
}

async function updateTodos(ctx) {
  const id = ctx.params.id;
  await Todo.update(ctx.request.body, {
    where: { id: id },
  });

  ctx.body = await Todo.findByPk(id);
}

async function removeTodos(ctx) {
  const id = ctx.params.id;
  const deleted = await Todo.destroy({ where: { id: id } });
  if (deleted != 1) ctx.throw(404, { error: "Todo not found" });

  ctx.status = 204;
}

//TAGS

router
  .get("/tags/", listTags)
  .del("/tags/", clearTags)
  .post("/tags/", addTags)
  .get("tag", "/tags/:id", showTags)
  .patch("/tags/:id", updateTags)
  .del("/tags/:id", removeTags)
  .get("/tags/:id/todos", listTodosForTag);

async function listTodosForTag(ctx) {
  const tag_id = ctx.params.id;

  const tag = await Tag.findByPk(tag_id, {
    include: { model: Todo, as: "todos" },
  });
  ctx.body = tag.dataValues["todos"].map((todo) => todo.dataValues);
}

async function updateTags(ctx) {
  const id = ctx.params.id;
  await Tag.update(ctx.request.body, { where: { id: id } });

  ctx.body = await Tag.findByPk(id);
}

async function listTags(ctx) {
  ctx.body = (await Tag.findAll()).map((tag) => tag.dataValues);
}
async function clearTags(ctx) {
  await Tag.destroy({ where: {} });
  ctx.status = 204;
}
async function addTags(ctx) {
  const tag = ctx.request.body;
  if (!tag.title) ctx.throw(400, { error: '"title" is a required field' });
  const title = tag.title;
  if (!typeof data === "string" || !title.length)
    ctx.throw(400, {
      error: '"title" must be a string with at least one character',
    });

  const newTag = await Tag.create(tag);
  let url = `http://${ctx.host}/tags/${newTag.id}`;
  await newTag.update({ url: url });

  ctx.status = 303;
  ctx.set("Location", url);
}

async function showTags(ctx) {
  const id = Number(ctx.params.id);
  const tag = await Tag.findByPk(id, { include: { model: Todo, as: "todos" } });

  if (!tag) ctx.throw(404, { error: "Tag not found" });

  ctx.body = tag;
  ctx.status = 201;
}

async function removeTags(ctx) {
  const id = ctx.params.id;
  const deleted = await Tag.destroy({ where: { id: id } });
  if (deleted != 1) ctx.throw(404, { error: "Tag not found" });

  ctx.status = 204;
}

app
  .use(bodyParser())
  .use(cors())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(8080);
