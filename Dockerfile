FROM node:alpine3.21

RUN apk add --no-cache make

WORKDIR /todo_app

COPY package.json /todo_app

RUN npm install --legacy-peer-deps

COPY . /todo_app

CMD ["sh", "-c", "make migrateup && npx prisma generate && npm start"]