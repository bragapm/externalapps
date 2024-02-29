FROM node:20-alpine

WORKDIR /worker

RUN apk add --no-cache git openssh

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .

CMD [ "pnpm", "start" ]
