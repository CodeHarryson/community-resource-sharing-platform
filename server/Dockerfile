# Stage 1: Build
FROM node:18 AS build
WORKDIR /app

# Install build tools
RUN apt-get update && \
    apt-get install -y python3 python3-pip build-essential git bash && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
# Uncomment if using TypeScript or transpilers
# RUN npm run build

# Stage 2: Runtime
FROM node:18-slim
WORKDIR /app
COPY --from=build /app ./

# Optional: install Python
RUN apt-get update && apt-get install -y python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 5000
CMD ["node", "index.js"]
