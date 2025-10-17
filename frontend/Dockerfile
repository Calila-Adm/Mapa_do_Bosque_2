# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose port
EXPOSE 5173

# Start development server
# Vite precisa do --host para aceitar conexões externas no Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
