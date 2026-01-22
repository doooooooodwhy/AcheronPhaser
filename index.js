const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "*"],
      styleSrc: ["'self'", "'unsafe-inline'", "*"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "*"],
      imgSrc: ["'self'", "data:", "*"],
      connectSrc: ["'self'", "*"],
      fontSrc: ["'self'", "*"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "*"],
      frameSrc: ["'self'", "*"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/proxy', limiter);

// Serve static files
app.use(express.static(path.join(__dirname, '../client/static')));

// Search engine proxy endpoints
const searchEngines = {
  google: 'https://www.google.com',
  duckduckgo: 'https://duckduckgo.com',
  bing: 'https://www.bing.com',
  yahoo: 'https://search.yahoo.com',
  brave: 'https://search.brave.com',
  ecosia: 'https://www.ecosia.org'
};

// Proxy middleware for different sites
const createSiteProxy = (target, pathRewrite = {}) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    onProxyReq: (proxyReq, req, res) => {
      proxyReq.setHeader('User-Agent', 'Acheron-Phaser-Browser/2.0');
      proxyReq.setHeader('X-Forwarded-For', req.ip);
    },
    onProxyRes: (proxyRes, req, res) => {
      // Add CORS headers
      proxyRes.headers['access-control-allow-origin'] = '*';
      proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['access-control-allow-headers'] = 'Content-Type, Authorization';
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(500).json({ error: 'Proxy error', message: err.message });
    }
  });
};

// Search engine routes
app.use('/search/google', createSiteProxy(searchEngines.google));
app.use('/search/duckduckgo', createSiteProxy(searchEngines.duckduckgo));
app.use('/search/bing', createSiteProxy(searchEngines.bing));
app.use('/search/yahoo', createSiteProxy(searchEngines.yahoo));
app.use('/search/brave', createSiteProxy(searchEngines.brave));
app.use('/search/ecosia', createSiteProxy(searchEngines.ecosia));

// Special GitHub proxy
app.use('/gh', createSiteProxy('https://github.com', {
  '^/gh': ''
}));

// YouTube proxy
app.use('/yt', createSiteProxy('https://www.youtube.com', {
  '^/yt': ''
}));

// General proxy for any URL
app.use('/proxy/:url(*)', (req, res, next) => {
  try {
    const targetUrl = decodeURIComponent(req.params.url);
    const url = new URL(targetUrl);
    
    // Validate URL
    if (!url.protocol.startsWith('http')) {
      return res.status(400).json({ error: 'Invalid protocol' });
    }
    
    // Create proxy middleware for this specific URL
    const proxy = createProxyMiddleware({
      target: url.origin,
      changeOrigin: true,
      pathRewrite: {
        [`^/proxy/${encodeURIComponent(targetUrl)}`]: url.pathname + url.search
      },
      onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('User-Agent', 'Acheron-Phaser-Browser/2.0');
        proxyReq.setHeader('X-Forwarded-For', req.ip);
      },
      onProxyRes: (proxyRes, req, res) => {
        proxyRes.headers['access-control-allow-origin'] = '*';
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy error', message: err.message });
      }
    });
    
    proxy(req, res, next);
  } catch (error) {
    res.status(400).json({ error: 'Invalid URL', message: error.message });
  }
});

// API endpoints
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Acheron Phaser 2.0',
    version: '2.0.0',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

app.get('/api/search-engines', (req, res) => {
  res.json({
    engines: Object.keys(searchEngines).map(key => ({
      key,
      name: searchEngines[key].replace('https://', '').replace('www.', '').replace('.com', ''),
      url: searchEngines[key]
    }))
  });
});

// Main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: Date.now() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Page not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Acheron Phaser 2.0 running on port ${PORT}`);
  console.log(`🌐 Main interface: http://localhost:${PORT}`);
  console.log(`🔧 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Search engines: ${Object.keys(searchEngines).join(', ')}`);
});

module.exports = app;
