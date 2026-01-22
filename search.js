// Search Engine Configuration
const searchEngines = {
  google: {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    icon: '🔍'
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
    icon: '🦆'
  },
  bing: {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    icon: '🅱️'
  },
  yahoo: {
    name: 'Yahoo',
    url: 'https://search.yahoo.com/search?p=',
    icon: '🌐'
  },
  brave: {
    name: 'Brave',
    url: 'https://search.brave.com/search?q=',
    icon: '🦁'
  },
  ecosia: {
    name: 'Ecosia',
    url: 'https://www.ecosia.org/search?q=',
    icon: '🌳'
  }
};

class SearchHandler {
  constructor() {
    this.searchInput = document.getElementById('searchInput');
    this.searchButton = document.getElementById('searchButton');
    this.searchEngineSelect = document.getElementById('searchEngine');
    this.currentEngine = 'google';
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadSavedEngine();
  }

  setupEventListeners() {
    this.searchButton.addEventListener('click', () => this.handleSearch());
    this.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSearch();
      }
    });
    this.searchEngineSelect.addEventListener('change', () => {
      this.currentEngine = this.searchEngineSelect.value;
      localStorage.setItem('searchEngine', this.currentEngine);
    });
  }

  loadSavedEngine() {
    const saved = localStorage.getItem('searchEngine');
    if (saved && searchEngines[saved]) {
      this.currentEngine = saved;
      this.searchEngineSelect.value = saved;
    }
  }

  handleSearch() {
    const query = this.searchInput.value.trim();
    if (!query) return;

    // Check if it's a URL
    if (this.isUrl(query)) {
      this.loadUrl(this.formatUrl(query));
    } else {
      // Search with selected engine
      const engine = searchEngines[this.currentEngine];
      const searchUrl = engine.url + encodeURIComponent(query);
      this.loadUrl(searchUrl);
    }
  }

  isUrl(string) {
    try {
      new URL(string);
      return true;
    } catch {
      // Check for common URL patterns
      return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(string);
    }
  }

  formatUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  }

  loadUrl(url) {
    // Dispatch event to browser handler
    window.dispatchEvent(new CustomEvent('loadUrl', { detail: { url } }));
  }

  getSearchEngines() {
    return searchEngines;
  }
}
