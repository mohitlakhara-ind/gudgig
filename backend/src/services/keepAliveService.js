import fetch from 'node-fetch';

class KeepAliveService {
  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production';
    this.baseUrl = this.getBaseUrl();
    this.interval = null;
    this.pingInterval = 10 * 60 * 1000; // 10 minutes
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  getBaseUrl() {
    // Try different URL sources for Render deployment
    if (process.env.RENDER_EXTERNAL_URL) {
      return process.env.RENDER_EXTERNAL_URL;
    }
    
    if (process.env.CLIENT_URL) {
      return process.env.CLIENT_URL.replace(':3000', ':5000');
    }
    
    if (process.env.BACKEND_URL) {
      return process.env.BACKEND_URL;
    }
    
    // Fallback for local development
    return 'http://localhost:5000';
  }

  async ping() {
    try {
      const response = await fetch(`${this.baseUrl}/ping`, {
        method: 'GET',
        timeout: 5000,
        headers: {
          'User-Agent': 'KeepAlive-Service/1.0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[keepAlive] Ping successful:', {
          status: data.status,
          uptime: data.uptime,
          memory: Math.round(data.memory.heapUsed / 1024 / 1024) + 'MB'
        });
        this.retryCount = 0;
        return true;
      } else {
        console.warn('[keepAlive] Ping failed with status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('[keepAlive] Ping error:', error.message);
      this.retryCount++;
      
      if (this.retryCount >= this.maxRetries) {
        console.error('[keepAlive] Max retries reached, stopping keep-alive');
        this.stop();
      }
      
      return false;
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/render-health`, {
        method: 'GET',
        timeout: 3000
      });

      if (response.ok) {
        console.log('[keepAlive] Health check successful');
        return true;
      } else {
        console.warn('[keepAlive] Health check failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('[keepAlive] Health check error:', error.message);
      return false;
    }
  }

  start() {
    if (!this.isEnabled) {
      console.log('[keepAlive] Service disabled in development mode');
      return;
    }

    console.log('[keepAlive] Starting keep-alive service...');
    console.log('[keepAlive] Base URL:', this.baseUrl);
    console.log('[keepAlive] Ping interval:', this.pingInterval / 1000, 'seconds');

    // Initial ping
    this.ping();

    // Set up interval
    this.interval = setInterval(async () => {
      await this.ping();
    }, this.pingInterval);

    // Also do a health check every 5 minutes
    setInterval(async () => {
      await this.healthCheck();
    }, 5 * 60 * 1000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('[keepAlive] Service stopped');
    }
  }

  // Method to manually trigger a ping (useful for testing)
  async triggerPing() {
    console.log('[keepAlive] Manual ping triggered');
    return await this.ping();
  }

  // Get service status
  getStatus() {
    return {
      enabled: this.isEnabled,
      baseUrl: this.baseUrl,
      pingInterval: this.pingInterval,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      isRunning: this.interval !== null
    };
  }
}

export default new KeepAliveService();


























