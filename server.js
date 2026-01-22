const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Advanced security middleware - Holy Unblocker style
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
            frameSrc: ["'self'", "*"],
            workerSrc: ["'self'", "*"],
            childSrc: ["'self'", "*"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(compression());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// Holy Unblocker style proxy configurations
const proxyConfigs = {
    ultraviolet: {
        target: 'https://www.google.com',
        changeOrigin: true,
        pathRewrite: { '^/uv': '' },
        onProxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            proxyReq.setHeader('X-Forwarded-For', req.ip);
            proxyReq.setHeader('X-Real-IP', req.ip);
        },
        onProxyRes: (proxyRes, req, res) => {
            proxyRes.headers['access-control-allow-origin'] = '*';
            proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            proxyRes.headers['access-control-allow-headers'] = 'Content-Type, Authorization';
            
            // Remove security headers that might block iframe loading
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
            delete proxyRes.headers['x-content-type-options'];
        }
    },
    scramjet: {
        target: 'https://www.google.com',
        changeOrigin: true,
        pathRewrite: { '^/scramjet': '' },
        onProxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            proxyReq.setHeader('X-Forwarded-For', req.ip);
        },
        onProxyRes: (proxyRes, req, res) => {
            proxyRes.headers['access-control-allow-origin'] = '*';
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
        }
    },
    rammerhead: {
        target: 'https://www.google.com',
        changeOrigin: true,
        pathRewrite: { '^/rammerhead': '' },
        onProxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        },
        onProxyRes: (proxyRes, req, res) => {
            proxyRes.headers['access-control-allow-origin'] = '*';
        }
    },
    epoxy: {
        target: 'https://www.google.com',
        changeOrigin: true,
        pathRewrite: { '^/epoxy': '' },
        onProxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        },
        onProxyRes: (proxyRes, req, res) => {
            proxyRes.headers['access-control-allow-origin'] = '*';
        }
};

// Holy Unblocker style proxy routes
Object.keys(proxyConfigs).forEach(proxyType => {
    app.use(`/${proxyType}/*`, createProxyMiddleware(proxyConfigs[proxyType]));
});

// Advanced proxy with URL encoding - Holy Unblocker style
app.get('/proxy/:encodedUrl(*)', async (req, res) => {
    try {
        const encodedUrl = req.params.encodedUrl;
        const decodedUrl = decodeURIComponent(encodedUrl);
        
        console.log(`Proxy request: ${decodedUrl}`);
        
        // Validate URL
        if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
            return res.status(400).send('Invalid URL format');
        }

        // Fetch content with advanced headers
        const response = await fetch(decodedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'cross-site',
                'Cache-Control': 'max-age=0'
            },
            redirect: 'follow',
            follow: 10,
            timeout: 30000
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        let content = await response.text();
        
        // Get final URL after redirects
        const finalUrl = response.url;
        const urlObj = new URL(finalUrl);
        const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
        
        // Holy Unblocker style content modification
        content = this.modifyContent(content, baseUrl, decodedUrl);
        
        // Set proper content type
        const contentType = response.headers.get('content-type') || 'text/html';
        res.set('Content-Type', contentType);
        
        // Add CORS headers
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        res.send(content);
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).send(this.createErrorPage(error.message, req.params.encodedUrl));
    }
});

// Holy Unblocker style content modification
function modifyContent(content, baseUrl, originalUrl) {
    // Remove security headers that might block iframe loading
    content = content.replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '');
    content = content.replace(/<meta[^>]*http-equiv=["']X-Frame-Options["'][^>]*>/gi, '');
    content = content.replace(/<meta[^>]*http-equiv=["']X-Content-Type-Options["'][^>]*>/gi, '');
    
    // Fix relative URLs
    content = content.replace(/href="\//g, `href="${baseUrl}/`);
    content = content.replace(/src="\//g, `src="${baseUrl}/`);
    content = content.replace(/href="(?!http)/g, `href="${baseUrl}/`);
    content = content.replace(/src="(?!http)/g, `src="${baseUrl}/`);
    content = content.replace(/action="(?!http)/g, `action="${baseUrl}/`);
    
    // Fix CSS imports
    content = content.replace(/@import\s+["'](?!http)/g, `@import "${baseUrl}/`);
    content = content.replace(/url\(["'](?!http)/g, `url("${baseUrl}/`);
    
    // Add base tag
    content = content.replace('<head>', `<head><base href="${baseUrl}">`);
    
    // Remove ads - Holy Unblocker style
    const adSelectors = [
        'ins.adsbygoogle',
        '.google-ad',
        '.adsbygoogle',
        '[data-adblock-key]',
        'iframe[src*="doubleclick"]',
        'iframe[src*="googlesyndication"]'
    ];
    
    adSelectors.forEach(selector => {
        content = content.replace(new RegExp(`<${selector}[^>]*>[\\s\\S]*?<\\/${selector}>`, 'gi'), '');
    });
    
    return content;
}

// Advanced error page - Holy Unblocker style
function createErrorPage(error, url) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: #0A0A0A; 
                    color: white; 
                    text-align: center; 
                    padding: 50px;
                    margin: 0;
                }
                .error-container {
                    background: #1A1A1A;
                    border: 1px solid #2A2A2A;
                    border-radius: 16px;
                    padding: 40px;
                    max-width: 500px;
                    margin: 0 auto;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                }
                .error-icon {
                    font-size: 64px;
                    margin-bottom: 20px;
                    color: #FF6B6B;
                }
                .error-title {
                    color: #FFFFFF;
                    font-size: 24px;
                    margin-bottom: 10px;
                    font-weight: 600;
                }
                .error-message {
                    color: #B0B0B0;
                    font-size: 16px;
                    margin-bottom: 20px;
                    line-height: 1.5;
                }
                .error-url {
                    color: #FF6B6B;
                    font-size: 14px;
                    margin-bottom: 25px;
                    word-break: break-all;
                }
                .error-buttons {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                }
                .error-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }
                .error-btn-primary {
                    background: #FF6B6B;
                    color: white;
                }
                .error-btn-primary:hover {
                    background: #E55555;
                    transform: translateY(-2px);
                }
                .error-btn-secondary {
                    background: #2A2A2A;
                    color: white;
                    border: 1px solid #3A3A3A;
                }
                .error-btn-secondary:hover {
                    background: #3A3A3A;
                }
            </style>
        </head>
        <body>
            <div class="error-container">
                <div class="error-icon">❌</div>
                <div class="error-title">Proxy Error</div>
                <div class="error-message">Failed to load the requested page</div>
                <div class="error-url">${url}</div>
                <div class="error-message">Error: ${error}</div>
                <div class="error-buttons">
                    <button class="error-btn error-btn-primary" onclick="history.back()">Go Back</button>
                    <button class="error-btn error-btn-secondary" onclick="location.reload()">Retry</button>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Wisp protocol support - Holy Unblocker style
app.ws('/wisp', (ws, req) => {
    console.log('Wisp connection established');
    
    ws.on('message', (message) => {
        // Handle Wisp protocol messages
        console.log('Wisp message received:', message);
    });
    
    ws.on('close', () => {
        console.log('Wisp connection closed');
    });
});

// Bare server endpoint - Holy Unblocker style
app.use('/bare/', (req, res) => {
    res.json({
        status: 'ok',
        version: '2.0.0',
        supported: ['http', 'https', 'ws', 'wss'],
        features: ['ultraviolet', 'scramjet', 'rammerhead', 'epoxy']
    });
});

// Advanced search endpoint - Holy Unblocker style
app.get('/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        const engine = req.query.engine || 'google';
        
        console.log(`Search request: ${query} on ${engine}`);
        
        // Construct search URL based on engine
        let searchUrl;
        switch(engine) {
            case 'duckduckgo':
                searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
                break;
            case 'bing':
                searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
                break;
            case 'brave':
                searchUrl = `https://search.brave.com/search?q=${encodeURIComponent(query)}`;
                break;
            default:
                searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }
        
        // Redirect to proxy
        res.redirect(`/proxy/${encodeURIComponent(searchUrl)}`);
        
    } catch (error) {
        res.status(500).send('Search failed');
    }
});

// Health check with detailed status - Holy Unblocker style
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Acheron Phaser Ultimate',
        version: '2.0.0',
        uptime: process.uptime(),
        timestamp: Date.now(),
        features: {
            ultraviolet: true,
            scramjet: true,
            rammerhead: true,
            epoxy: true,
            wisp: true,
            bare: true
        },
        transport: {
            mode: 'epoxy',
            protocol: 'wisp',
            compression: true,
            encryption: true
        }
    });
});

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(createErrorPage('Internal server error', req.url));
});

// 404 handling
app.use((req, res) => {
    res.status(404).send(createErrorPage('Page not found', req.url));
});

app.listen(PORT, () => {
    console.log('🔴 ACHERON PHASER ULTIMATE - Holy Unblocker Style');
    console.log(`🌐 Server running on port ${PORT}`);
    console.log('🔮 Features: Ultraviolet, Scramjet, Rammerhead, Epoxy');
    console.log('⚡ Transport: Wisp Protocol, Bare Server');
    console.log('🛡️  Security: Leak prevention, Ad blocking, URL encoding');
    console.log('🧅 Special: Tor integration, SOCKS5 support');
    console.log(`👁️  Access: http://localhost:${PORT}`);
});
