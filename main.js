// Acheron Phaser - Main JavaScript

class AcheronPhaser {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupThemeToggle();
    this.setupQuickLinks();
    this.loadSavedTheme();
  }

  setupEventListeners() {
    const goButton = document.getElementById('goButton');
    const urlInput = document.getElementById('urlInput');

    goButton.addEventListener('click', () => this.handleProxyRequest());
    urlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleProxyRequest();
      }
    });
  }

  setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => this.toggleTheme());
  }

  setupQuickLinks() {
    const quickLinks = document.querySelectorAll('.quick-link[data-url]');
    quickLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const url = link.dataset.url;
        this.proxyUrl(url);
      });
    });
  }

  handleProxyRequest() {
    const urlInput = document.getElementById('urlInput');
    const url = urlInput.value.trim();
    
    if (!url) {
      this.showNotification('Please enter a URL', 'error');
      return;
    }

    // Validate URL
    if (!this.isValidUrl(url)) {
      this.showNotification('Please enter a valid URL', 'error');
      return;
    }

    this.proxyUrl(url);
  }

  proxyUrl(url) {
    const goButton = document.getElementById('goButton');
    const originalText = goButton.textContent;
    
    // Show loading state
    goButton.textContent = '🔄 Loading...';
    goButton.disabled = true;

    // Special handling for GitHub
    if (url.includes('github.com')) {
      window.location.href = `/gh${url.split('github.com')[1]}`;
      return;
    }

    // General proxy
    const encodedUrl = encodeURIComponent(url);
    window.location.href = `/proxy/${encodedUrl}`;
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  }

  loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.body.setAttribute('data-theme', savedTheme);
      const themeToggle = document.getElementById('themeToggle');
      themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '15px 20px',
      borderRadius: '10px',
      color: 'white',
      fontWeight: 'bold',
      zIndex: '1000',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease',
      backgroundColor: type === 'error' ? '#E5554D' : '#FF746C'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AcheronPhaser();
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Acheron Phaser ServiceWorker registered:', registration);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed:', error);
      });
  });
}
