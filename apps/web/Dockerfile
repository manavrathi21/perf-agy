# syntax=docker/dockerfile:1.6
#
# Web image: two-stage build.
#   1. node:20   -> `vite build` produces apps/web/dist
#   2. nginx     -> serves dist/ and reverse-proxies /api to the api service

# -------- build stage --------
FROM node:20-bookworm-slim AS build

ENV npm_config_update_notifier=false \
    npm_config_fund=false \
    npm_config_audit=false

WORKDIR /app

# Monorepo manifests first for cacheable install
COPY package.json package-lock.json ./
COPY apps/api/package.json           apps/api/package.json
COPY apps/web/package.json           apps/web/package.json
COPY apps/worker-runner/package.json apps/worker-runner/package.json

RUN npm ci --workspace apps/web --include-workspace-root=false

COPY apps/web apps/web

RUN npm run build --workspace apps/web

# -------- runtime stage --------
FROM nginx:1.27-alpine AS runtime

# Replace the default server with our SPA + /api proxy config.
RUN rm /etc/nginx/conf.d/default.conf
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=5 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
