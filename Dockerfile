FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:22-alpine

WORKDIR /app

# Install sqlite dependencies for alpine if needed, though better-sqlite3 handles it mostly
RUN apk add --no-cache python3 make g++ 

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "run", "start"]
