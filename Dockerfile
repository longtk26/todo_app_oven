FROM node:alpine3.21

WORKDIR /todo_app

COPY package.json /todo_app

RUN npm install --legacy-peer-deps

COPY . /todo_app

RUN npx prisma generate

CMD ["npm", "start"]