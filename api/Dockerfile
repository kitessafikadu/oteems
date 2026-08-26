FROM node:20-alpine

# Install OpenSSL for Prisma engine compatibility on Alpine
RUN apk add --no-cache openssl

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# Copy application source code and Prisma configs
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY nest-cli.json tsconfig*.json ./
COPY src ./src

RUN pnpm exec prisma generate

RUN pnpm run build

EXPOSE 3001

ENV NODE_ENV=production

# Start application using your package.json script
CMD ["pnpm", "run", "start:prod"]