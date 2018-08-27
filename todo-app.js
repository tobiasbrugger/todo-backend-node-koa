const router = require('koa-router')();

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');

const app = new Koa();

const todos = [
  {'title': 'build an API', 'order': 1, 'completed': false},
  {'title': '?????', 'order': 2, 'completed': false},
  {'title': 'profit!', 'order': 3, 'completed': false}
]

router.get('/todos/', list)
  .del('/todos/', clear)
  .post('/todos/', add)
  .get('todo', '/todos/:id', show)
  .patch('/todos/:id', update)
  .del('/todos/:id', remove);

async function list(ctx) {
  ctx.body = todos.map((e, i) => {
    e['id'] = i;
    return e;
  });
}

async function clear(ctx) {
  todos.length = 0;
  ctx.status = 204;
}

async function add(ctx) {
  const todo = ctx.request.body;
  if (!todo.title) ctx.throw(400, {'error': '"title" is a required field'});
  const title = todo.title;
  if (!typeof data === 'string' || !title.length) ctx.throw(400, {'error': '"title" must be a string with at least one character'});

  todo['completed'] = todo['completed'] || false;
  todo['url'] = '//' + ctx.host + router.url('todo', todos.length);
  todos.push(todo);

  ctx.status = 303;
  ctx.set('Location', todo['url']);
}

async function show(ctx) {
  const id = ctx.params.id;
  const todo = todos[id]
  if (!todo) ctx.throw(404, {'error': 'Todo not found'});
  todo.id = id;
  ctx.body = todo;
}

async function update(ctx) {
  const id = ctx.params.id;
  const todo = todos[id];

  Object.assign(todo, ctx.request.body);

  ctx.body = todo;
}

async function remove(ctx) {
  const id = ctx.params.id;
  const todo = todos[id]
  if (!todo) ctx.throw(404, {'error': 'Todo not found'});

  todos.splice(id, 1);

  ctx.status = 204;
}

app
  .use(bodyParser())
  .use(cors())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(8080);
