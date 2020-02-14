# Use the official lightweight Node.js 12 image.
# https://hub.docker.com/_/node
FROM node:12-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package.json ./

COPY yarn.lock ./

# Install production dependencies.
RUN yarn install --only=production

# Copy local code to the container image.
COPY . ./

# Set environment variables
ARG DEPLOY_ENV
ENV NODE_ENV=$DEPLOY_ENV
ENV JOB_APPLICATION_KIND="Application"
ENV JOB_APPLICATION_KIND_DEV="ApplicationDev"
ENV USER_FIELD_NAME="userId"
ENV SORT_FIELD_NAME="applyDate"

RUN echo $DEPLOY_ENV
RUN echo $NODE_ENV

# Run the web service on container startup.
CMD [ "yarn", "start" ]
