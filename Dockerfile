FROM oven/bun:1.4.2-alpine AS build

WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun build apps/api/src/index.ts --target=bun --outfile=/out/server.js --minify

FROM oven/bun:1.4.2-alpine

WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000
COPY --from=build /out/server.js ./server.js
USER bun
EXPOSE 3000
CMD ["bun", "server.js"]
