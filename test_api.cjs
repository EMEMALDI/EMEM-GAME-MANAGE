const jwt = require('jsonwebtoken');
const token = jwt.sign({ username: 'admin', role: 'admin' }, process.env.JWT_SECRET || 'emem-super-secret-key-change-me', { expiresIn: '24h' });
fetch('http://localhost:3000/api/users', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: 'test-id-2',
    name: 'test-user',
    bandwidth_limit: 1000,
    expire_at: new Date().toISOString(),
    protocol: 'vless'
  })
}).then(res => res.text()).then(console.log);
