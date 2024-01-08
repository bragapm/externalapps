FROM node:18-alpine AS builder
WORKDIR /extensions
RUN corepack enable
COPY ./package.json ./pnpm-lock.yaml ./rollup.config.mjs ./
RUN pnpm install --frozen-lockfile --prod
COPY ./dist dist
COPY ./extensions extensions
RUN pnpm build

FROM directus/directus:10.8.2 AS runtime
COPY --from=builder /extensions/dist /directus/extensions
