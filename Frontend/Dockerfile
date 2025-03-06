# Stage 1: Build the application
FROM node:20 AS build
WORKDIR /app
COPY package.json .
COPY . .
RUN npm install
RUN npm run build

# Stage 2: Create the production image
FROM node:20
WORKDIR /app

# Copy built files from the build stage
COPY --from=build /app ./


EXPOSE 3000
CMD ["npm", "start"]