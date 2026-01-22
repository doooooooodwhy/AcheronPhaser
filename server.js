const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Exact Holy Unblocker security setup
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

// Holy Unblocker style proxy with advanced features
app.get('/proxy/:encodedUrl(*)', async (req, res) => {
    try {
        const encodedUrl = req.params.encodedUrl;
        const decodedUrl = decodeURIComponent(encodedUrl);
        
        console.log(`Proxy request: ${decodedUrl}`);
        
        // Validate URL
        if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
            return res.status(400).send('Invalid URL format');
        }

        // Fetch with Holy Unblocker style headers
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

// Search endpoint - Holy Unblocker style
app.get('/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        
        // Redirect to proxy
        res.redirect(`/proxy/${encodeURIComponent(searchUrl)}`);
        
    } catch (error) {
        res.status(500).send('Search failed');
    }
});

// Health check - Holy Unblocker style
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Acheron Phaser LTS',
        version: '6.0.0',
        uptime: process.uptime(),
        timestamp: Date.now(),
        features: ['ultraviolet', 'scramjet', 'rammerhead', 'epoxy', 'wisp', 'bare']
    });
});

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling - Holy Unblocker style
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(createErrorPage('Internal server error', req.url));
});

// 404 handling
app.use((req, res) => {
    res.status(404).send(createErrorPage('Page not found', req.url));
});

app.listen(PORT, () => {
    console.log('🔴 ACHERON PHASER LTS - Holy Unblocker Clone');
    console.log(`🌐 Server running on port ${PORT}`);
    console.log('👁️  Proxy endpoint: /proxy/ENCODED_URL');
    console.log('🔍 Search endpoint: /search?q=QUERY');
    console.log('⚡ Health check: /health');
});
