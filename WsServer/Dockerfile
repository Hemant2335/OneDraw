
FROM node:latest

WORKDIR /src

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

# Step 7: Command to start the app
CMD ["npm", "run" ,"dev"]
