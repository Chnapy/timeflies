FROM mcr.microsoft.com/devcontainers/base:debian

RUN apt-get update && apt-get install -y curl

# install nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash

RUN export NVM_DIR="$HOME/.nvm" \
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# install node
RUN nvm install
RUN nvm use

# install corepack 0.10 only one compatible with node 12
RUN npm install -g corepack@0.10.0 serve@13.0.4
RUN corepack prepare yarn@2.4.1 --activate

# Next steps:
# - yarn install
# - yarn foreach-build-all
