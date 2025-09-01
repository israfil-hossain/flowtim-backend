FROM node:18-bullseye-slim AS base

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

FROM base AS deps

# Tools required to build native deps (e.g., bcrypt) in build stage
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=development
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM deps AS builder

COPY tsconfig.json ./
COPY src ./src

RUN yarn build

FROM base AS prod-deps

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

FROM base AS runtime

# Create and use a non-root user
RUN useradd -ms /bin/bash nodeuser
USER nodeuser

WORKDIR /app

ENV PORT=8000

COPY --chown=nodeuser:nodeuser package.json ./
COPY --chown=nodeuser:nodeuser --from=prod-deps /app/node_modules ./node_modules
COPY --chown=nodeuser:nodeuser --from=builder /app/dist ./dist

EXPOSE 8000

CMD ["node", "dist/index.js"]