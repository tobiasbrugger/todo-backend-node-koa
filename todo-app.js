import Router from "koa-router";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";

import { sequelize_db, init_db, Tag, Todo, TodoTag } from "./sequelize.js";

const router = new Router();

const app = new Koa();

init_db();

let todos = {
  0: {
    title: "build an API",
    order: 1,
    completed: false,
    tags: [],
    url: null,
    id: 0,
  },
  1: { title: "?????", order: 2, completed: false, tags: [], url: null, id: 1 },
  2: {
    title: "profit!",
    order: 3,
    completed: false,
    tags: [],
    url: null,
    id: 2,
  },
};

let tags = {
  0: { title: "Urgent", url: null },
  1: { title: "Home", url: null },
  2: { title: "Work", url: null },
};

let nextTodoId = 3;
let nextTagId = 3;
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
  const tagIndex = todos[id].tags.findIndex((tag) => tag.id == tag_id);
  if (tagIndex > -1) {
    todos[id].tags.splice(tagIndex, 1);
  } else {
    ctx.throw(404, { error: "Tag not found in todo" });
  }
  ctx.status = 204;
}

async function delTodoTags(ctx) {
  const id = ctx.params.id;
  todos[id].tags = [];
  ctx.status = 204;
}

async function addTodoTags(ctx) {
  const id = ctx.params.id;
  const tag_id = ctx.request.body.id;
  const tag = tags[tag_id];
  if (!tag) {
    console.log("tag not found");
    ctx.throw(404, { error: "Tag not found" });
  }
  todos[id].tags.push(tag);
  ctx.status = 201;
  ctx.body = tag;
}

async function getTodoTags(ctx) {
  const id = ctx.params.id;
  const todo = todos[id];
  if (!todo) ctx.throw(404, { error: "Todo not found" });
  ctx.body = todo.tags;
  ctx.status = 200;
}

async function listTodos(ctx) {
  ctx.body = Object.keys(todos).map((k) => {
    todos[k].id = k;
    return todos[k];
  });
}

async function clearTodos(ctx) {
  todos = {};
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
  todo["url"] = "http://" + ctx.host + router.url("todo", nextTodoId);
  todo["tags"] = [];
  todo["id"] = nextTodoId;
  todos[nextTodoId++] = todo;

  ctx.status = 303;
  ctx.set("Location", todo["url"]);
}

async function showTodos(ctx) {
  const id = ctx.params.id;
  const todo = todos[id];
  if (!todo) ctx.throw(404, { error: "Todo not found" });
  todo.id = id;
  ctx.body = todo;
}

async function updateTodos(ctx) {
  const id = ctx.params.id;
  const todo = todos[id];

  Object.assign(todo, ctx.request.body);

  ctx.body = todo;
}

async function removeTodos(ctx) {
  const id = ctx.params.id;
  if (!todos[id]) ctx.throw(404, { error: "Todo not found" });

  delete todos[id];

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

  let filtered_todos = Object.values(todos).filter((todo) => {
    return todo.tags.some((tag) => tag.id == tag_id);
  });

  ctx.body = filtered_todos;
}

async function updateTags(ctx) {
  const id = ctx.params.id;
  const tag = tags[id];

  Object.assign(tag, ctx.request.body);

  ctx.body = tag;
}

async function listTags(ctx) {
  ctx.body = Object.keys(tags).map((k) => {
    tags[k].id = k;
    return tags[k];
  });
}
async function clearTags(ctx) {
  tags = {};
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
  tag.id = nextTagId;
  tag["url"] = "http://" + ctx.host + router.url("tag", nextTagId);
  tag["todos"] = [];
  tags[nextTagId++] = tag;
  ctx.body = tag;
  ctx.status = 201;
  ctx.set("Location", tag["url"]);
}

async function showTags(ctx) {
  const id = Number(ctx.params.id);

  const tag = tags[id];

  if (!tag) ctx.throw(404, { error: "Tag not found" });
  tag.id = id;
  ctx.body = tag;
}

async function removeTags(ctx) {
  const id = ctx.params.id;
  if (!tags[id]) ctx.throw(404, { error: "Todo not found" });

  delete tags[id];

  ctx.status = 204;
}

app
  .use(bodyParser())
  .use(cors())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(8080);
