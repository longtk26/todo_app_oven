# Builder stage
FROM node:22-alpine3.21 AS builder

WORKDIR /todo_app

COPY package.json /todo_app

RUN npm install --legacy-peer-deps

COPY . /todo_app

RUN npx prisma generate && npm run build

# Production stage
FROM node:22-alpine3.21

WORKDIR /todo_app

COPY package.json /todo_app

RUN npm install --production --legacy-peer-deps

COPY --from=builder /todo_app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /todo_app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /todo_app/dist ./dist
COPY --from=builder /todo_app/prisma ./prisma
COPY --from=builder /todo_app/.env ./

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]