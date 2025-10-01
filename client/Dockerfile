# Stage 1: Build React App
FROM node:18 AS build
WORKDIR /app

# Install build tools
RUN apt-get update && \
    apt-get install -y python3 python3-pip build-essential git bash && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build /app/build ./
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]


