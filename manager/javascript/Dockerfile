FROM node:20-alpine
# Add glibc compatibility for Alpine
# Fulfilling mapnik requirement (spritezero dependency)
RUN apk update && apk add --no-cache gcompat libstdc++

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY ./ ./
CMD [ "pnpm", "start" ]
