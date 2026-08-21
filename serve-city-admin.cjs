// خادم بسيط لتقديم لوحة تحكم المدن city-admin.html للأجهزة في نفس الشبكة
// التشغيل: node serve-city-admin.js  (ثم افتح http://<IP>:8080/city-admin.html)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8095;
const HOST = '0.0.0.0'; // يسمح بالوصول من أي جهاز في الشبكة

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let rel = decodeURIComponent((req.url.split('?')[0] || '/').replace(/\+/g, ' '));
  if (rel === '/') rel = '/city-admin.html';

  // أمان بسيط: فقط الملفات داخل مجلد المشروع
  const filePath = path.normalize(path.join(__dirname, rel));
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('الملف غير موجود: ' + rel);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  const os = require('os');
  const nets = os.networkInterfaces();
  const addrs = [];
  for (const name of Object.keys(nets)) {
    for (const n of nets[name]) {
      if (n.family === 'IPv4' && !n.internal) addrs.push(n.address);
    }
  }
  console.log('✅ الخادم يعمل!');
  console.log('افتح من هذا الجهاز:   http://localhost:' + PORT + '/city-admin.html');
  addrs.forEach(a => console.log('افتح من أي جهاز آخر في الشبكة:  http://' + a + ':' + PORT + '/city-admin.html'));
});