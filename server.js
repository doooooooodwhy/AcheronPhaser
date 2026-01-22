const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// Fix: Properly decode and handle URLs like your example
app.get('/proxy/:encodedUrl(*)', async (req, res) => {
    try {
        // Decode the URL properly (like your example: https%3A%2F%2Fwww.google.com%2Fsearch%3Fq%3Dcrazygames)
        const encodedUrl = req.params.encodedUrl;
        const decodedUrl = decodeURIComponent(encodedUrl);
        
        console.log(`Proxy request: ${decodedUrl}`);
        
        // Validate URL
        if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
            return res.status(400).send('Invalid URL format');
        }

        // Fetch content anonymously
        const response = await fetch(decodedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
            }
        });

        let content = await response.text();
        
        // Fix relative URLs and resources
        const urlObj = new URL(decodedUrl);
        const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
        
        // Make URLs absolute for proper loading
        content = content.replace(/href="\//g, `href="${baseUrl}/`);
        content = content.replace(/src="\//g, `src="${baseUrl}/`);
        content = content.replace(/href="(?!http)/g, `href="${baseUrl}/`);
        content = content.replace(/src="(?!http)/g, `src="${baseUrl}/`);
        
        // Add base tag
        content = content.replace('<head>', `<head><base href="${baseUrl}">`);
        
        // Set proper content type
        res.set('Content-Type', response.headers.get('content-type') || 'text/html');
        res.send(content);
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1>❌ Proxy Error</h1>
                    <p>Failed to load: ${req.params.encodedUrl}</p>
                    <p>Error: ${error.message}</p>
                    <button onclick="history.back()" style="padding: 10px 20px; background: #FF6B6B; color: white; border: none; border-radius: 5px; cursor: pointer;">Go Back</button>
                </body>
            </html>
        `);
    }
});

// Handle direct domain requests (like your example)
app.get('/proxy/:protocol(http|https):/*', (req, res) => {
    // Reconstruct the full URL
    const fullUrl = req.params.protocol + '://' + req.params[0];
    req.params.encodedUrl = encodeURIComponent(fullUrl);
    
    // Redirect to the proper proxy handler
    res.redirect(`/proxy/${encodeURIComponent(fullUrl)}`);
});

// Search endpoint for actual search results
app.get('/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        const engine = req.query.engine || 'google';
        
        // Construct search URL
        let searchUrl;
        switch(engine) {
            case 'duckduckgo':
                searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
                break;
            case 'bing':
                searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
                break;
            default:
                searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }
        
        console.log(`Search request: ${searchUrl}`);
        
        // Fetch search results
        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        let content = await response.text();
        
        // Clean up the content for display
        content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        content = content.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
        
        res.set('Content-Type', 'text/html');
        res.send(content);
        
    } catch (error) {
        res.status(500).send('Search failed');
    }
});

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'Acheron Phaser', version: '1.0.0' });
});

app.listen(PORT, () => {
    console.log(`🔴 Acheron Phaser running on port ${PORT}`);
    console.log(`🌐 Access: http://localhost:${PORT}`);
    console.log(`🔍 Proxy format: http://localhost:${PORT}/proxy/ENCODED_URL`);
});
