FROM node:20-slim AS base
RUN corepack enable pnpm

WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build
FROM deps AS build
COPY . .
RUN pnpm build

# Production
FROM base AS production
COPY --from=build /app/.output /app/.output
COPY --from=build /app/server/database/migrations /app/server/database/migrations
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/drizzle.config.ts /app/drizzle.config.ts
COPY --from=build /app/server/database/schema.ts /app/server/database/schema.ts
COPY --from=build /app/server/database/seed.ts /app/server/database/seed.ts

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
