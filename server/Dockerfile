FROM node:18-alpine


RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]