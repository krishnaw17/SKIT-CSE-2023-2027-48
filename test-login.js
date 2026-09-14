const http = require('http');

const data = JSON.stringify({
  email: 'student@example.com',
  password: 'password123'
});

const req = http.request({
  hostname: 'localhost',
  port: 4000,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Body: ${body}`);
  });
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
