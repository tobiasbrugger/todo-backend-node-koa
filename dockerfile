FROM node:20.17 AS build

LABEL stage="build"

WORKDIR /app

COPY package*.json /app/

RUN npm install

FROM node:20.17 AS prod

WORKDIR /app

COPY --from=build /app/node_modules /app/node_modules
COPY *.js /app/
COPY package*.json /app/

CMD ["node", "/app/todo-app.js"]
