# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.19.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Next.js"

# Next.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
ARG YARN_VERSION=1.22.21
RUN npm install -g yarn@$YARN_VERSION --force


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

# Copy application code
COPY . .

# Build application
RUN --mount=type=secret,id=NEXT_PUBLIC_SUPABASE_URL \
    --mount=type=secret,id=NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_SUPABASE_URL="$(cat /run/secrets/NEXT_PUBLIC_SUPABASE_URL)" \
    NEXT_PUBLIC_SUPABASE_ANON_KEY="$(cat /run/secrets/NEXT_PUBLIC_SUPABASE_ANON_KEY)" \
    yarn run build

# Remove development dependencies
RUN yarn install --production=true


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "yarn", "run", "start" ]
