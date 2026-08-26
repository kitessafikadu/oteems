FROM node:22-alpine

RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY nest-cli.json tsconfig*.json ./
COPY src ./src

RUN pnpm exec prisma generate
RUN pnpm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["pnpm", "run", "start:prod"]