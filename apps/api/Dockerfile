# syntax=docker/dockerfile:1.6
#
# API image: Node 20 + k6 binary + the two Node workspaces the API needs
# (@perf/api and @perf/worker-runner). Built from the repo root as context
# (see docker-compose.yml `context: .`) so the monorepo workspace layout is
# preserved inside the image.

FROM node:20-bookworm-slim AS base

ENV NODE_ENV=production \
    npm_config_update_notifier=false \
    npm_config_fund=false \
    npm_config_audit=false

# System deps:
#   - python3/make/g++  : native build for better-sqlite3
#   - ca-certificates   : TLS roots for npm + k6 downloads
#   - curl/gnupg        : add the Grafana apt repo for k6
#   - tini              : PID 1 that reaps zombies (k6 is spawned as a child)
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ca-certificates curl gnupg python3 make g++ tini \
 && mkdir -p /etc/apt/keyrings \
 && curl -fsSL https://dl.k6.io/key.gpg | gpg --dearmor -o /etc/apt/keyrings/k6-archive-keyring.gpg \
 && echo "deb [signed-by=/etc/apt/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
      > /etc/apt/sources.list.d/k6.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends k6 \
 && apt-get purge -y --auto-remove gnupg \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --- install deps ---------------------------------------------------------
# Copy only manifests first so Docker caches `npm ci` across source edits.
# We need the root package.json (workspace definition) plus every workspace
# package.json that @perf/api depends on.
COPY package.json package-lock.json ./
COPY apps/api/package.json              apps/api/package.json
COPY apps/web/package.json              apps/web/package.json
COPY apps/worker-runner/package.json    apps/worker-runner/package.json

# `--omit=dev` keeps devDependencies (nodemon, vite, etc.) out of the image.
# `--workspace` scopes the install to just the API and its workspace dep.
RUN npm ci \
      --omit=dev \
      --workspace apps/api \
      --workspace apps/worker-runner \
      --include-workspace-root=false

# --- app source -----------------------------------------------------------
COPY apps/api            apps/api
COPY apps/worker-runner  apps/worker-runner

# Storage + logs are docker volumes at runtime; create the dirs so the
# non-root user has somewhere to write before the volume mounts (and for
# builds that run without volumes).
RUN mkdir -p /app/apps/api/storage/uploads /app/apps/api/logs \
 && chown -R node:node /app

USER node

EXPOSE 4000

# Healthcheck matches the compose depends_on so `web` only starts once the
# API is actually serving.
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=5 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||4000)+'/api/v1/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "apps/api/src/server.js"]
