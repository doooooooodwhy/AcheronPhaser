class BrowserHandler {
  constructor() {
    this.frame = document.getElementById('browserFrame');
    this.welcomeScreen = document.getElementById('welcomeScreen');
    this.errorScreen = document.getElementById('errorScreen');
    this.addressInput = document.getElementById('addressInput');
    this.loadingBar = document.getElementById('loadingBar');
    this.statusText = document.getElementById('statusText');
    this.loadTime = document.getElementById('loadTime');
    this.connectionStatus = document.getElementById('connectionStatus');
    
    this.history = [];
    this.historyIndex = -1;
    this.isLoading = false;
    this.startTime = 0;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupContextMenu();
    this.setupKeyboardShortcuts();
    this.updateNavigationButtons();
  }

  setupEventListeners() {
    // Navigation buttons
    document.getElementById('backButton').addEventListener('click', () => this.goBack());
    document.getElementById('forwardButton').addEventListener('click', () => this.goForward());
    document.getElementById('reloadButton').addEventListener('click', () => this.reload());
    document.getElementById('homeButton').addEventListener('click', () => this.goHome());
    document.getElementById('bookmarkButton').addEventListener('click', () => this.toggleBookmark());
    
    // Address bar
    this.addressInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.loadFromAddressBar();
      }
    });
    document.getElementById('goAddressButton').addEventListener('click', () => this.loadFromAddressBar());
    
    // Frame events
    this.frame.addEventListener('load', () => this.handleLoad());
    this.frame.addEventListener('error', () => this.handleError());
    
    // Custom events
    window.addEventListener('loadUrl', (e) => this.loadUrl(e.detail.url));
    
    // Retry button
    document.getElementById('retryButton').addEventListener('click', () => this.retry());
    
    // Fullscreen
    document.getElementById('fullscreenToggle').addEventListener('click', () => this.toggleFullscreen());
  }

  setupContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    
    // Show context menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showContextMenu(e.clientX, e.clientY);
    });
    
    // Hide context menu
    document.addEventListener('click', () => {
      contextMenu.style.display = 'none';
    });
    
    // Context menu actions
    contextMenu.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action) {
        this.handleContextAction(action);
      }
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+L - Focus address bar
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        this.addressInput.focus();
        this.addressInput.select();
      }
      
      // F5 - Reload
      if (e.key === 'F5') {
        e.preventDefault();
        this.reload();
      }
      
      // Alt+Left - Back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        this.goBack();
      }
      
      // Alt+Right - Forward
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        this.goForward();
      }
      
      // F11 - Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        this.toggleFullscreen();
      }
    });
  }

  loadUrl(url) {
    if (!url) return;
    
    this.showLoading();
    this.startTime = Date.now();
    
    // Update address bar
    this.addressInput.value = url;
    
    // Update status
    this.statusText.textContent = `Loading ${this.getDomain(url)}...`;
    this.connectionStatus.textContent = '🟡 Loading';
    
    // Hide welcome screen
    this.welcomeScreen.style.display = 'none';
    this.errorScreen.style.display = 'none';
    
    // Load URL in frame
    try {
      // Use proxy for external URLs
      if (this.shouldUseProxy(url)) {
        const proxyUrl = this.getProxyUrl(url);
        this.frame.src = proxyUrl;
      } else {
        this.frame.src = url;
      }
      
      // Add to history
      this.addToHistory(url);
      
    } catch (error) {
      this.handleError(error);
    }
  }

  shouldUseProxy(url) {
    // Use proxy for external sites
    const currentDomain = window.location.hostname;
    const targetDomain = this.getDomain(url);
    return targetDomain !== currentDomain && !url.startsWith('data:');
  }

  getProxyUrl(url) {
    // Use different proxy strategies based on the site
    if (url.includes('github.com')) {
      return `/gh${url.split('github.com')[1]}`;
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return `/yt${url.split('youtube.com')[1] || url.split('youtu.be')[1]}`;
    } else {
      return `/proxy/${encodeURIComponent(url)}`;
    }
  }

  handleLoad() {
    this.hideLoading();
    const loadTime = Date.now() - this.startTime;
    
    // Update status
    this.statusText.textContent = 'Loaded';
    this.loadTime.textContent = `${loadTime}ms`;
    this.connectionStatus.textContent = '🟢 Connected';
    
    // Show frame
    this.frame.classList.add('active');
    
    // Update navigation
    this.updateNavigationButtons();
    
    // Try to get page title
    try {
      const title = this.frame.contentDocument?.title || this.frame.contentWindow?.document?.title;
      if (title) {
        document.title = `${title} - Acheron Phaser`;
      }
    } catch (e) {
      // Cross-origin restrictions
    }
  }

  handleError(error) {
    this.hideLoading();
    this.frame.classList.remove('active');
    this.errorScreen.style.display = 'flex';
    
    document.getElementById('errorTitle').textContent = 'Connection Error';
    document.getElementById('errorMessage').textContent = 
      error?.message || 'Unable to load this page. The site might be blocked or unavailable.';
    
    this.statusText.textContent = 'Error';
    this.connectionStatus.textContent = '🔴 Error';
  }

  showLoading() {
    this.isLoading = true;
    this.loadingBar.classList.add('active');
    this.loadingBar.querySelector('.loading-progress').style.width = '0%';
    
    // Simulate loading progress
    let progress = 0;
    const interval = setInterval(() => {
      if (!this.isLoading) {
        clearInterval(interval);
        return;
      }
      
      progress += Math.random() * 30;
      if (progress > 90) progress = 90;
      
      this.loadingBar.querySelector('.loading-progress').style.width = `${progress}%`;
    }, 200);
  }

  hideLoading() {
    this.isLoading = false;
    this.loadingBar.classList.remove('active');
    this.loadingBar.querySelector('.loading-progress').style.width = '100%';
    
    setTimeout(() => {
      this.loadingBar.querySelector('.loading-progress').style.width = '0%';
    }, 300);
  }

  addToHistory(url) {
    // Remove forward history
    this.history = this.history.slice(0, this.historyIndex + 1);
    
    // Add new URL
    this.history.push(url);
    this.historyIndex = this.history.length - 1;
    
    this.updateNavigationButtons();
  }

  updateNavigationButtons() {
    const backButton = document.getElementById('backButton');
    const forwardButton = document.getElementById('forwardButton');
    
    backButton.disabled = this.historyIndex <= 0;
    forwardButton.disabled = this.historyIndex >= this.history.length - 1;
  }

  goBack() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.loadUrl(this.history[this.historyIndex]);
    }
  }

  goForward() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.loadUrl(this.history[this.historyIndex]);
    }
  }

  reload() {
    if (this.frame.src && this.frame.src !== 'about:blank') {
      this.loadUrl(this.frame.src);
    }
  }

  goHome() {
    this.frame.classList.remove('active');
    this.welcomeScreen.style.display = 'flex';
    this.errorScreen.style.display = 'none';
    this.addressInput.value = '';
    this.statusText.textContent = 'Ready';
    this.loadTime.textContent = '--';
    this.connectionStatus.textContent = '🟢 Connected';
    document.title = 'Acheron Phaser 2.0 - Advanced Browser Proxy';
  }

  loadFromAddressBar() {
    const url = this.addressInput.value.trim();
    if (url) {
      this.loadUrl(url);
    }
  }

  retry() {
    const currentUrl = this.addressInput.value;
    if (currentUrl) {
      this.loadUrl(currentUrl);
    }
  }

  toggleBookmark() {
    const url = this.addressInput.value;
    if (url) {
      // Simple bookmark functionality
      let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      const index = bookmarks.indexOf(url);
      
      if (index === -1) {
        bookmarks.push(url);
        this.showNotification('Bookmark added!', 'success');
      } else {
        bookmarks.splice(index, 1);
        this.showNotification('Bookmark removed!', 'info');
      }
      
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      this.updateBookmarkButton();
    }
  }

  updateBookmarkButton() {
    const url = this.addressInput.value;
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const button = document.getElementById('bookmarkButton');
    
    if (bookmarks.includes(url)) {
      button.style.color = '#FFD700'; // Gold color for bookmarked
    } else {
      button.style.color = ''; // Default color
    }
  }

  showContextMenu(x, y) {
    const contextMenu = document.getElementById('contextMenu');
    const maxX = window.innerWidth - contextMenu.offsetWidth;
    const maxY = window.innerHeight - contextMenu.offsetHeight;
    
    contextMenu.style.left = Math.min(x, maxX) + 'px';
    contextMenu.style.top = Math.min(y, maxY) + 'px';
    contextMenu.style.display = 'block';
  }

  handleContextAction(action) {
    switch (action) {
      case 'back':
        this.goBack();
        break;
      case 'forward':
        this.goForward();
        break;
      case 'reload':
        this.reload();
        break;
      case 'bookmark':
        this.toggleBookmark();
        break;
      case 'fullscreen':
        this.toggleFullscreen();
        break;
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      document.body.classList.add('fullscreen');
    } else {
      document.exitFullscreen();
      document.body.classList.remove('fullscreen');
    }
  }

  getDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#6B7280'};
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}
