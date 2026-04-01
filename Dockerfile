# monolith: backend & frontend
FROM alpine:3.23 AS monolith

LABEL org.opencontainers.image.title="Timeflies" \
  org.opencontainers.image.description="Web multiplayer game - tactical-RPG." \
  org.opencontainers.image.url="https://github.com/Chnapy/timeflies" \
  org.opencontainers.image.source="https://github.com/Chnapy/timeflies" \
  org.opencontainers.image.version="0.0.1" \
  org.opencontainers.image.licenses="MIT" \
  org.opencontainers.image.vendor="Timeflies" \
  org.opencontainers.image.authors="Richard Haddad" \
  org.opencontainers.image.base.name="alpine:3.23"

RUN apk add --no-cache \
  nginx \
  supervisor \
  curl tar xz \
  && curl -fsSL https://unofficial-builds.nodejs.org/download/release/v12.22.12/node-v12.22.12-linux-x64-musl.tar.xz | \
   tar -xJ -C /usr/local --strip-components=1 \
  && apk del curl tar xz \
  && rm -rf /var/cache/apk/*

WORKDIR /app

RUN node --version && npm --version

# install corepack 0.10 only one compatible with node 12
RUN npm install -g corepack@0.10.0 serve@13.0.4
RUN corepack prepare yarn@2.4.1 --activate

COPY package.json yarn.lock .yarnrc .yarnrc.yml ./
COPY ./.yarn/releases ./.yarn/releases
COPY ./.yarn/plugins ./.yarn/plugins
COPY ./.yarn/sdks ./.yarn/sdks
COPY ./packages ./packages

RUN yarn -v && yarn install

COPY babel.config.js tsconfig.json ./

RUN yarn workspace @timeflies/backend p:build-recursive

RUN yarn workspace @timeflies/frontend p:build-recursive

# should be defined before frontend final build
ENV REACT_APP_SERVER_URL=/api
ENV REACT_APP_WS_URL=/ws

RUN yarn workspace @timeflies/frontend build

# setup logs folders
RUN mkdir -p /var/log/supervisord /var/log/nginx /var/run/nginx \
  && chown -R 755 /var/log/nginx /var/run/nginx \
  && chmod -R 755 /var/log/supervisord

ENV PORT=40510
ENV HOST_URL=/api

COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 3000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
