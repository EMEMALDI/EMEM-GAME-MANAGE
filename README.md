# NextGen Gaming Panel

A lightweight, modern VPN management platform optimized for gaming. Designed for the lowest possible latency and stable routing, featuring a real-time glassmorphic management dashboard.

*(Note: In this implementation, the backend has been constructed in Node.js (TypeScript) instead of Go to ensure full compatibility with the interactive AI Studio environment and easy serverless/container deployment. It maintains all architectural patterns and configurations requested.)*

## Features

- **Sing-box Core Generation**: Generates standard configuration files for the Sing-box networking engine.
- **Modern Protocols**: Supports VLESS + Reality, TUIC v5, and Hysteria2.
- **Glassmorphism UI**: Beautiful, fully responsive dark mode React dashboard using Tailwind CSS and Framer Motion.
- **Real-time Metrics**: Live monitoring of bandwidth, connections, ping, and system resources via WebSockets.
- **User Management**: Complete CRUD operations for users, with bandwidth tracking and expiry dates.
- **Gaming Optimization**: Network presets for optimal TCP buffer, MTU, and routing profiles.
- **Railway Ready**: Zero-config deployment for Railway.app with automatic SQLite persistence.

## Architecture

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS v4, Recharts, Zustand.
- **Backend**: Node.js, Express, TypeScript, Better-SQLite3, JSON Web Tokens.
- **Database**: SQLite (Default) with write-ahead logging for high concurrency.

## Screenshots

*(Placeholders for screenshots)*
- `![Dashboard](docs/screenshots/dashboard.png)`
- `![User Management](docs/screenshots/users.png)`

## Installation

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   *The server will start on http://localhost:3000. Default credentials are `admin` / `admin`.*

### Docker Deployment

1. **Build Image**
   ```bash
   docker build -t nextgen-panel .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 -v $(pwd)/data:/app/data -d nextgen-panel
   ```

### Docker Compose

```bash
docker-compose up -d
```

### Railway Deployment

This repository is optimized for Railway auto-deployment.
1. Connect your GitHub repository to Railway.
2. Railway will automatically detect the `Dockerfile` and `railway.json`.
3. Add a persistent volume mounted at `/app/data` in the Railway dashboard to persist your SQLite database.

## Environment Variables

- `JWT_SECRET`: Secret key for JWT signing. Change in production.
- `NODE_ENV`: Set to `production` in production environments.

## API Documentation

- `POST /api/auth/login`: Authenticate and receive JWT.
- `GET /api/users`: List all VPN users.
- `POST /api/users`: Create a new VPN user.
- `DELETE /api/users/:id`: Delete a VPN user.
- `GET /api/health`: Healthcheck endpoint.
- `GET /api/config/generate`: Generate Sing-box JSON configuration for active users.

## Security

- Role-Based Access Control (RBAC).
- Secure password hashing using bcrypt.
- JWT Authentication for all API routes.
