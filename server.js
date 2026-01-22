// Fixed performSearch function
async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;

    // Show search results
    document.getElementById('searchResults').classList.add('active');
    document.getElementById('searchQuery').textContent = `"${query}"`;
    document.getElementById('resultsCount').textContent = 'Searching...';

    try {
        // Use the search endpoint to get actual search results
        const engine = document.getElementById('searchEngine').value;
        const searchUrl = `/search?q=${encodeURIComponent(query)}&engine=${engine}`;
        
        // Open anonymous view with search results
        window.anonymousView.openAnonymousView(searchUrl, `${engine.charAt(0).toUpperCase() + engine.slice(1)} Search: ${query}`);
        
    } catch (error) {
        window.anonymousView.showError('Search failed. Please try again.');
    }
}

// Updated openAnonymousView function
async openAnonymousView(url, title) {
    this.currentViewUrl = url;
    
    // Show anonymous view window
    document.getElementById('anonymousView').classList.add('active');
    document.getElementById('viewUrl').textContent = url;
    document.getElementById('viewLoading').style.display = 'flex';
    
    try {
        // Create proper proxy URL for the search
        const proxyUrl = `/proxy/${encodeURIComponent(url)}`;
        
        // Load in iframe
        const frame = document.getElementById('anonymousFrame');
        frame.src = proxyUrl;
        frame.classList.remove('hidden');
        
        // Hide loading after frame loads
        frame.onload = () => {
            document.getElementById('viewLoading').style.display = 'none';
        };
        
    } catch (error) {
        this.showViewError('Failed to load page anonymously');
    }
}
