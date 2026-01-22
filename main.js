// Acheron Phaser 2.0 Main Controller
class AcheronPhaser {
  constructor() {
    this.searchHandler = null;
    this.browserHandler = null;
    this.init();
  }

  init() {
    // Initialize components
    this.searchHandler = new SearchHandler();
    this.browserHandler = new BrowserHandler();
    
    // Setup global event listeners
    this.setupGlobalEvents();
    
    // Load saved preferences
    this.loadPreferences();
    
    console.log('🚀 Acheron Phaser 2.0 initialized successfully!');
  }

  setupGlobalEvents() {
    // Handle page load
    window.addEventListener('load', () => {
      document.body.classList.add('fade-in');
    });
    
    // Handle online/offline
    window.addEventListener('online', () => {
      this.browserHandler.showNotification('Connection restored', 'success');
      document.getElementById('connectionStatus').textContent = '🟢 Connected';
    });
    
    window.addEventListener('offline', () => {
      this.browserHandler.showNotification('Connection lost', 'error');
      document.getElementById('connectionStatus').textContent = '🔴 Offline';
    });
    
    // Handle resize
    window.addEventListener('resize', () => {
      this.handleResize();
    });
    
    // Handle before unload
    window.addEventListener('beforeunload', () => {
      this.savePreferences();
    });
  }

  loadPreferences() {
    // Load theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    document.getElementById('themeToggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    
    // Load other preferences
    const preferences = JSON.parse(localStorage.getItem('preferences') || '{}');
    
    // Apply preferences
    if (preferences.searchEngine) {
      document.getElementById('searchEngine').value = preferences.searchEngine;
    }
  }

  savePreferences() {
    const preferences = {
      theme: document.body.getAttribute('data-theme'),
      searchEngine: document.getElementById('searchEngine').value,
      bookmarks: localStorage.getItem('bookmarks'),
      timestamp: Date.now()
    };
    
    localStorage.setItem('preferences', JSON.stringify(preferences));
  }

  handleResize() {
    // Adjust layout for different screen sizes
    const isMobile = window.innerWidth <= 768;
    const browserControls = document.querySelector('.browser-controls');
    
    if (isMobile) {
      browserControls.classList.add('mobile-layout');
    } else {
      browserControls.classList.remove('mobile-layout');
    }
  }

  // Utility methods
  static formatUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  }

  static getDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return null;
    }
  }

  static isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  window.acheronPhaser = new AcheronPhaser();
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Acheron Phaser ServiceWorker registered:', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed:', error);
      });
  });
}
