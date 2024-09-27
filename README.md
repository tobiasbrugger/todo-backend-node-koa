# todo-backend-node-koa

Yet another [todo backend](http://todobackend.com) using Node.js with [Koa](https://koajs.com/).
Additional Routes for tags as well as a persistent sqlite-DB with sequelize as an ORM have been added according to the exercise.

DB-Schema is defined in [sequelize.js](./sequelize.js).

The app is built using docker and ran by using docker compose. Port 8080 is mapped to http://localhost:8080.
A volume (./db/todos.db) is added to persist the db between container restarts

## Installation Docker Compose

```bash
sudo docker compose up --build # sudo might not be nessecary
```

## Installation directly

If docker does not work

```bash
npm i # install dependencies
```

## Usage

```bash
node . # start server
```

# Tests

You can validate the application with http://todospecs.thing.zone/index.html?http://localhost:8080.
