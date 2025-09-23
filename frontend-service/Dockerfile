# Step 1: Build the app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install
# or yarn install
# RUN yarn install

# Copy source code
COPY . .

# Build Vite app
RUN npm run build

# Step 2: Run the built app using Node
FROM node:20-alpine

WORKDIR /app

# Install a static server (serve)
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist /app/dist

# Expose port
EXPOSE 8080

# Serve the app
CMD ["serve", "-s", "dist", "-l", "8080"]
