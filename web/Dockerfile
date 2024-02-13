FROM node:20-alpine as builder
WORKDIR /src

COPY package.json pnpm-lock.yaml .npmrc ./
RUN corepack enable && pnpm install

COPY . .
RUN pnpm build

FROM node:20-alpine as runner
WORKDIR /src

COPY --from=builder /src/.output .output

CMD [ "node", ".output/server/index.mjs" ]
