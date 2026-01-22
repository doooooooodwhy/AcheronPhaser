const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { setupBareServer } = require('@tomphttp/bare-server-node');
const http = require('http');
const ws = require('ws');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const bareServer = setupBareServer('/bare/', server);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../client/static')));

// Custom Acheron Phaser proxy middleware
const githubProxy = createProxyMiddleware({
  target: 'https://github.com',
  changeOrigin: true,
  pathRewrite: {
    '^/gh': '',
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('User-Agent', 'Acheron-Phaser-Proxy/1.0');
  },
  onError: (err, req, res) => {
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
});

// Routes
app.use('/gh', githubProxy);

// Main proxy route
app.get('/proxy/*', (req, res) => {
  const targetUrl = req.params[0];
  if (!targetUrl) {
    return res.status(400).json({ error: 'No URL provided' });
  }
  
  // Validate URL
  try {
    new URL(targetUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // Proxy the request
  const proxy = createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/proxy/.*': '',
    },
  });
  
  proxy(req, res);
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Acheron Phaser', version: '1.0.0' });
});

// WebSocket upgrade handling
server.on('upgrade', (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Acheron Phaser proxy running on port ${PORT}`);
  console.log(`🌐 Access GitHub: http://localhost:${PORT}/gh`);
  console.log(`🔧 Health check: http://localhost:${PORT}/health`);
});
