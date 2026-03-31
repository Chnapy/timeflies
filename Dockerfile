# syntax=docker/dockerfile:1.7-labs

# FROM node:22-alpine AS builder

# WORKDIR /app

# COPY package.json yarn.lock .yarnrc .yarnrc.yml ./
# COPY ./.yarn/releases ./.yarn/releases
# COPY ./.yarn/sdks ./.yarn/sdks
# COPY ./packages ./packages

# RUN yarn -v && yarn install

# COPY babel.config.js tsconfig.json ./

# RUN ls -la /app/packages

# RUN yarn workspace @timeflies/backend build-all
# RUN yarn workspace @timeflies/frontend build-all
# RUN [ ! -f "/app/packages/frontend/dist/index.html" ] && exit 1

# # backend test
# FROM backend-builder AS backend-test

# COPY ["PKVault.Backend.Tests/PKVault.Backend.Tests.csproj", "PKVault.Backend.Tests/"]

# RUN dotnet restore "PKVault.Backend.Tests/PKVault.Backend.Tests.csproj"

# COPY ./global.json ./global.json
# COPY ./PKVault.Backend.Tests ./PKVault.Backend.Tests

# RUN dotnet build "PKVault.Backend.Tests/PKVault.Backend.Tests.csproj"

# # tests
# RUN dotnet test --project "./PKVault.Backend.Tests/PKVault.Backend.Tests.csproj" --no-restore --no-build

# # backend publish
# FROM backend-builder AS backend-publish

# RUN dotnet publish "PKVault.Backend/PKVault.Backend.csproj" -c Release -o /app/publish

# # extract swagger from backend
# FROM alpine:latest AS swagger-extractor
# COPY --from=backend-builder /swagger.json /swagger.json

# # frontend builder
# FROM node:22-alpine AS frontend-builder

# WORKDIR /app

# COPY ./ ./

# RUN yarn -v && yarn install --immutable

# RUN yarn workspace @timeflies/frontend install
# RUN yarn workspaces foreach -vR --topological-dev run p:build
# # RUN yarn workspace @timeflies/frontend build-all

# monolith: backend & frontend
FROM node:22-alpine AS monolith

LABEL org.opencontainers.image.title="Timeflies" \
  org.opencontainers.image.description="Web multiplayer game - tactical-RPG." \
  org.opencontainers.image.url="https://github.com/Chnapy/timeflies" \
  org.opencontainers.image.source="https://github.com/Chnapy/timeflies" \
  org.opencontainers.image.version="0.0.1" \
  org.opencontainers.image.licenses="MIT" \
  org.opencontainers.image.vendor="Timeflies" \
  org.opencontainers.image.authors="Richard Haddad" \
  org.opencontainers.image.base.name="node:22-alpine"

RUN apk add --no-cache \
  nginx \
  supervisor \
  curl \
  # # icu libs required for backend date manipulation non-utc
  # icu-libs \
  # # complete cultures (en/fr/...)
  # icu-data-full \
  # # timezones
  # tzdata \
  && rm -rf /var/cache/apk/*

WORKDIR /app

COPY package.json yarn.lock .yarnrc .yarnrc.yml ./
COPY ./.yarn/releases ./.yarn/releases
COPY ./.yarn/sdks ./.yarn/sdks
COPY ./packages ./packages

RUN yarn -v && yarn install

COPY babel.config.js tsconfig.json ./

# RUN ls -la /app/packages

RUN yarn workspace @timeflies/backend build-all
RUN yarn workspace @timeflies/frontend build-all

# COPY --from=builder /app/package.json /app/yarn.lock /app/.yarnrc /app/.yarnrc.yml /app/
# COPY --from=builder /app/.yarn ./.yarn

# COPY --from=builder /app/packages /app/packages
# COPY --from=builder /app/packages/*/lib /app/*/lib
# COPY --from=builder /app/packages/backend/lib /app/backend/lib
# COPY --from=builder /app/packages/backend/static /app/backend/static
# node /app/backend/lib/index.js

# RUN rm /app/packages/frontend/index.html

# RUN ls -la /app && exit 1

# COPY --from=builder /app/packages/frontend/dist /app/frontend

# RUN yarn -v && yarn install

# setup logs folders
RUN mkdir -p /var/log/supervisord /var/log/nginx /var/run/nginx \
  && chown -R 755 /var/log/nginx /var/run/nginx \
  && chmod -R 755 /var/log/supervisord

ENV PORT=40510
ENV HOST_URL=http://localhost:40510
ENV VITE_SERVER_URL=http://localhost:40510

COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# RUN cat /app/packages/frontend/dist/index.html

# VOLUME [ "/pkvault" ]

EXPOSE 3000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
