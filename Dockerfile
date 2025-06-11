# --- builder stage ---
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем только package.json и package-lock.json (если нет, можно сначала его создать)
COPY package.json package-lock.json ./
# npm ci быстрее и повторяемо ставит ровно те версии, которые в lock-файле
RUN npm ci

COPY . .
RUN npx prisma generate

RUN npm run build

# --- runtime stage ---
FROM node:18-alpine

WORKDIR /app
# Копируем только нужное из билдера
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# Если у вас .env лежит в корне — скопируем и его
COPY .env ./

EXPOSE 4000
CMD ["node", "dist/server.js"]
