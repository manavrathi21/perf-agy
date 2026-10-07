# syntax=docker/dockerfile:1

ARG NODE_IMAGE=node:20-bookworm-slim
ARG NGINX_IMAGE=nginx:1.27-alpine

FROM ${NODE_IMAGE} AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/worker-runner/package.json apps/worker-runner/
COPY apps/web/package.json apps/web/
RUN npm ci --workspace @perf/web
COPY apps/web apps/web
RUN npm run build --workspace @perf/web

FROM ${NGINX_IMAGE} AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
