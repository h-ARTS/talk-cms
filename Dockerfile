# Set the base image
FROM node:14-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy only the files needed for building and running the app
COPY .next/ .next/
COPY public/ public/
COPY next.config.js ./

# Set the MONGODB_URI environment variable
ARG MONGODB_URI
ENV MONGODB_URI=${MONGODB_URI}

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
