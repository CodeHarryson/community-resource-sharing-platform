# Stage 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Add this line to prevent warnings from stopping the build
ENV CI=false

# This command will now ignore warnings and succeed
RUN npm run build

# Stage 2: Serve the built application with Nginx
FROM nginx:stable-alpine

# Copy the build output from the build stage
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Nginx will automatically start when the container launches
CMD ["nginx", "-g", "daemon off;"]


