const express = require('express');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { createProxyMiddleware } = require('http-proxy-middleware');
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

// Anonymous view function - fetches content server-side
async function fetchAnonymousContent(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            }
        });

        let content = await response.text();
        
        // Modify content to work in iframe and fix links
        content = content.replace(/href="http/g, 'href="/view-proxy/http');
        content = content.replace(/href="https/g, 'href="/view-proxy/https');
        content = content.replace(/src="http/g, 'src="/view-proxy/http');
        content = content.replace(/src="https/g, 'src="/view-proxy/https');
        
        // Add base tag for relative links
        const baseTag = `<base href="${url}">`;
        content = content.replace('<head>', `<head>${baseTag}`);
        
        return content;
    } catch (error) {
        console.error('Fetch error:', error);
        return `<html><body><h1>Error loading page</h1><p>${error.message}</p></body></html>`;
    }
}

// Anonymous view route - fetches content server-side
app.get('/view/:domain(*)', async (req, res) => {
    try {
        const domain = req.params.domain;
        let targetUrl = domain;
        
        // Reconstruct full URL
        if (!targetUrl.startsWith('http')) {
            targetUrl = 'https://' + targetUrl;
        }
        
        console.log(`Anonymous view request for: ${targetUrl}`);
        
        // Fetch content anonymously
        const content = await fetchAnonymousContent(targetUrl);
        
        // Send modified content
        res.send(content);
    } catch (error) {
        res.status(500).send(`<html><body><h1>Error</h1><p>Failed to load page anonymously</p></body></html>`);
    }
});

// Proxy route for resources (images, CSS, JS)
app.get('/view-proxy/:protocol(http|https)://:url(*)', async (req, res) => {
    try {
        const protocol = req.params.protocol;
        const url = protocol + '://' + req.params.url;
        
        console.log(`Proxying resource: ${url}`);
        
        const response = await fetch(url);
        const content = await response.buffer();
        
        // Forward the content type
        res.set('Content-Type', response.headers.get('content-type'));
        res.send(content);
    } catch (error) {
        res.status(404).send('Resource not found');
    }
});

// Search simulation endpoint
app.get('/api/search', (req, res) => {
    const query = req.query.q || '';
    const engine = req.query.engine || 'google';
    
    // Mock search results based on query
    const results = [
        {
            title: `${query} - Search Results`,
            url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            description: `Find information about ${query}`
        },
        {
            title: `${query} - Wikipedia`,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
            description: `Learn about ${query} from Wikipedia`
        },
        {
            title: `${query} - Official Website`,
            url: `https://${query.toLowerCase().replace(/\s+/g, '')}.com`,
            description: `Visit the official website for ${query}`
        }
    ];
    
    res.json({ results });
});

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'Acheron Phaser Anonymous View', version: '2.0.0' });
});

app.listen(PORT, () => {
    console.log(`🔴 Acheron Phaser Anonymous View running on port ${PORT}`);
    console.log(`🌐 Access: http://localhost:${PORT}`);
    console.log(`🔍 Anonymous view: http://localhost:${PORT}/view/{domain}`);
});
