FROM node:20-alpine AS builder
WORKDIR /app

COPY ./extensions/package.json ./extensions/package-lock.json ./extensions/
WORKDIR /app/extensions
RUN npm install

COPY ./extensions ./ 

RUN npm run build

FROM directus/directus:11.9.3
COPY --from=builder /app/extensions/dist /directus/extensions/dist