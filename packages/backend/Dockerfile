FROM node:20

#create app directory
WORKDIR /app

#copy package files
COPY package*.json ./

#copy source code
COPY . .

#install dependencies
RUN npm install

#expose the app's port
EXPOSE 3000

#build the app
RUN npm run build

#start the server
CMD ["npm", "run", "start"]