import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

const JWT_SECRET = process.env.JWT_SECRET || 'emem-super-secret-key-change-me';
const START_TIME = Date.now();

// Setup DB
const db = new Database('data.db', { verbose: console.log });
db.pragma('journal_mode = WAL');

// Initialize modular schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'viewer',
    two_factor_enabled BOOLEAN DEFAULT 0,
    two_factor_secret TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vpn_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    notes TEXT,
    tags TEXT,
    bandwidth_limit INTEGER DEFAULT 0,
    bandwidth_used INTEGER DEFAULT 0,
    expire_at DATETIME,
    status TEXT DEFAULT 'active',
    protocol TEXT DEFAULT 'vless',
    last_online DATETIME,
    last_ip TEXT,
    device_limit INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS servers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT,
    region TEXT,
    provider TEXT,
    public_ip TEXT,
    private_ip TEXT,
    protocols TEXT,
    weight INTEGER DEFAULT 10,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user TEXT,
    ip TEXT,
    action TEXT,
    result TEXT
  );
`);

// Create admin user if not exists
const adminCount = db.prepare('SELECT count(*) as count FROM users WHERE username = ?').get('admin') as { count: number };
if (adminCount.count === 0) {
  const hash = bcrypt.hashSync('admin', 10);
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', hash, 'admin');
  db.prepare('INSERT INTO audit_logs (user, action, result) VALUES (?, ?, ?)').run('system', 'init', 'Admin user created');
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());
  app.use(cors());

  // WebSocket Server
  const wss = new WebSocketServer({ server });
  
  // Real-time metrics simulation
  setInterval(() => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsage = ((totalMem - freeMem) / totalMem) * 100;
    
    wss.clients.forEach(client => {
      if (client.readyState === 1) { // OPEN
        client.send(JSON.stringify({
          type: 'metrics',
          data: {
            cpu: Math.random() * 20 + 5, // Simulated CPU load
            memory: memUsage,
            disk: Math.random() * 10 + 40, // Simulated Disk
            bandwidth: {
              up: Math.random() * 2000,
              down: Math.random() * 8000
            },
            online_users: Math.floor(Math.random() * 500) + 100,
            ping: Math.floor(Math.random() * 20) + 5,
            jitter: Math.random() * 2,
            packet_loss: Math.random() > 0.9 ? Math.random() : 0,
            uptime: Math.floor((Date.now() - START_TIME) / 1000)
          }
        }));
      }
    });
  }, 2000);

  // Authentication Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
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

  app.put('/api/auth/password', authenticateToken, (req, res) => {
    const { username, password } = req.body;
    try {
      const hash = bcrypt.hashSync(password, 10);
      db.prepare('UPDATE users SET username = ?, password = ? WHERE username = ?').run(username, hash, req.user.username);
      res.json({ success: true, message: 'Credentials updated' });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
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

  app.put('/api/users/:id', authenticateToken, (req, res) => {
    const { name, bandwidth_limit, protocol, status, expire_at, bandwidth_used } = req.body;
    try {
      const updates = [];
      const values = [];
      
      if (name !== undefined) { updates.push('name = ?'); values.push(name); }
      if (bandwidth_limit !== undefined) { updates.push('bandwidth_limit = ?'); values.push(bandwidth_limit); }
      if (protocol !== undefined) { updates.push('protocol = ?'); values.push(protocol); }
      if (status !== undefined) { updates.push('status = ?'); values.push(status); }
      if (expire_at !== undefined) { updates.push('expire_at = ?'); values.push(expire_at); }
      if (bandwidth_used !== undefined) { updates.push('bandwidth_used = ?'); values.push(bandwidth_used); }
      
      if (updates.length > 0) {
        values.push(req.params.id);
        db.prepare(`UPDATE vpn_users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
      }
      
      res.json({ success: true, message: 'User updated' });
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

  app.get('/api/servers', authenticateToken, (req, res) => {
    const servers = db.prepare('SELECT * FROM servers').all();
    res.json(servers);
  });

  app.post('/api/servers', authenticateToken, (req, res) => {
    const { id, name, country, region, provider, public_ip, protocols } = req.body;
    try {
      db.prepare('INSERT INTO servers (id, name, country, region, provider, public_ip, protocols) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(id, name, country, region, provider, public_ip, protocols);
      res.json({ success: true, message: 'Server created' });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/servers/:id', authenticateToken, (req, res) => {
    try {
      db.prepare('DELETE FROM servers WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Config Generation Mock
  app.get('/api/config/generate/:id', authenticateToken, (req, res) => {
    const user = db.prepare('SELECT * FROM vpn_users WHERE id = ?').get(req.params.id) as any;
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const config = {
      log: { level: "info" },
      inbounds: [{
        type: user.protocol,
        tag: "in-" + user.id,
        listen: "::",
        listen_port: 443,
        users: [{ uuid: user.id, name: user.name }],
        tls: {
          enabled: true,
          alpn: ["h2", "http/1.1"],
          utls: { enabled: true, fingerprint: "chrome" }
        },
        multiplex: {
          enabled: true,
          padding: true
        }
      }],
      outbounds: [{ type: "direct", tag: "direct" }]
    };
    
    res.json({ success: true, config });
  });

  app.get('/api/config/generate', authenticateToken, (req, res) => {
    const vpnUsers = db.prepare('SELECT * FROM vpn_users WHERE status = "active"').all();
    
    // Simulate sing-box config generation with adaptive profiles
    const config = {
      log: { level: "info" },
      inbounds: vpnUsers.map((u: any) => ({
        type: u.protocol,
        tag: "in-" + u.id,
        listen: "::",
        listen_port: 443,
        users: [{ uuid: u.id, name: u.name }],
        tls: {
          enabled: true,
          alpn: ["h2", "http/1.1"],
          utls: { enabled: true, fingerprint: "chrome" }
        },
        multiplex: {
          enabled: true,
          padding: true
        }
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
