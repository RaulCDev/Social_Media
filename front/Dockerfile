# Use the official Node.js 14 image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json before other files
# Utilise Docker cache to save re-installing dependencies if unchanged
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install -g next

# Copy all files
COPY . .

# Expose the listening port
EXPOSE 3000

# Run npm run dev command
CMD [ "npm", "run", "dev" ]