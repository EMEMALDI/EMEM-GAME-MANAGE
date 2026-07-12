import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

// Setup DB
const db = new Database('data.db', { verbose: console.log });
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'viewer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vpn_users (
    id TEXT PRIMARY KEY, -- UUID
    name TEXT NOT NULL,
    bandwidth_limit INTEGER DEFAULT 0, -- 0 means unlimited
    bandwidth_used INTEGER DEFAULT 0,
    expire_at DATETIME,
    status TEXT DEFAULT 'active',
    protocol TEXT DEFAULT 'vless',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Create admin user if not exists
const adminCount = db.prepare('SELECT count(*) as count FROM users WHERE username = ?').get('admin') as { count: number };
if (adminCount.count === 0) {
  const hash = bcrypt.hashSync('admin', 10);
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', hash, 'admin');
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // WebSocket Server
  const wss = new WebSocketServer({ server });
  
  // Real-time metrics simulation
  setInterval(() => {
    wss.clients.forEach(client => {
      if (client.readyState === 1) { // OPEN
        client.send(JSON.stringify({
          type: 'metrics',
          data: {
            cpu: Math.random() * 100,
            memory: Math.random() * 100,
            bandwidth: {
              up: Math.random() * 1000,
              down: Math.random() * 5000
            },
            online_users: Math.floor(Math.random() * 100),
            ping: Math.floor(Math.random() * 50) + 10,
            jitter: Math.random() * 5,
            packet_loss: Math.random() * 2
          }
        }));
      }
    });
  }, 2000);

  // Authentication Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // API Routes
  
  // Healthcheck
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  // Auth
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { username: user.username, role: user.role } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  // VPN Users CRUD
  app.get('/api/users', authenticateToken, (req, res) => {
    const users = db.prepare('SELECT * FROM vpn_users').all();
    res.json(users);
  });

  app.post('/api/users', authenticateToken, (req, res) => {
    const { id, name, bandwidth_limit, expire_at, protocol } = req.body;
    try {
      db.prepare('INSERT INTO vpn_users (id, name, bandwidth_limit, expire_at, protocol) VALUES (?, ?, ?, ?, ?)')
        .run(id, name, bandwidth_limit, expire_at, protocol);
      res.json({ success: true, message: 'User created' });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/users/:id', authenticateToken, (req, res) => {
    try {
      db.prepare('DELETE FROM vpn_users WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Config Generation Mock
  app.get('/api/config/generate', authenticateToken, (req, res) => {
    const vpnUsers = db.prepare('SELECT * FROM vpn_users WHERE status = "active"').all();
    
    // Simulate sing-box config generation
    const config = {
      log: { level: "info" },
      inbounds: vpnUsers.map((u: any) => ({
        type: u.protocol,
        tag: "in-" + u.id,
        listen: "::",
        listen_port: 443,
        users: [{ uuid: u.id, name: u.name }]
      })),
      outbounds: [{ type: "direct", tag: "direct" }]
    };
    
    res.json({ success: true, config });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
