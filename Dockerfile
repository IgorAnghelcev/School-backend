# Удобно брать официальный образ с Node.js и Alpine для компактности
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем только манифесты, чтобы закэшировать npm install
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Копируем исходники и собираем (TS → JS)
COPY . .
RUN yarn build

# --- финальный образ ---
FROM node:18-alpine

WORKDIR /app

# Вытягиваем лишние зависимости (runtime-only)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY .env ./

EXPOSE 4000

CMD ["node", "dist/server.js"]
