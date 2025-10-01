const os = require('os');
const net = require('net');

class NetworkUtils {
  /**
   * Get all network interfaces and their IP addresses
   */
  static getNetworkInterfaces() {
    const interfaces = os.networkInterfaces();
    const networks = [];
    
    for (const name in interfaces) {
      for (const network of interfaces[name]) {
        // Skip internal (localhost) and non-IPv4 addresses
        if (!network.internal && network.family === 'IPv4') {
          networks.push({
            interface: name,
            address: network.address,
            netmask: network.netmask,
            mac: network.mac
          });
        }
      }
    }
    
    return networks;
  }

  /**
   * Get the primary LAN IP address
   */
  static getLanIP() {
    const networks = this.getNetworkInterfaces();
    
    // Prefer common private network ranges
    const privateRanges = [
      /^192\.168\./,  // 192.168.x.x
      /^10\./,        // 10.x.x.x
      /^172\.(1[6-9]|2\d|3[0-1])\./ // 172.16.x.x - 172.31.x.x
    ];
    
    for (const range of privateRanges) {
      const match = networks.find(network => range.test(network.address));
      if (match) {
        return match.address;
      }
    }
    
    // Return first available if no private range found
    return networks.length > 0 ? networks[0].address : 'localhost';
  }

  /**
   * Check if a port is available
   */
  static async isPortAvailable(port, host = 'localhost') {
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.listen(port, host, () => {
        server.once('close', () => resolve(true));
        server.close();
      });
      
      server.on('error', () => resolve(false));
    });
  }

  /**
   * Find an available port from a list
   */
  static async findAvailablePort(ports, host = 'localhost') {
    for (const port of ports) {
      if (await this.isPortAvailable(port, host)) {
        return port;
      }
    }
    return null;
  }

  /**
   * Generate connection URLs for different scenarios
   */
  static getConnectionUrls(port) {
    const lanIP = this.getLanIP();
    
    return {
      localhost: `http://localhost:${port}`,
      lan: `http://${lanIP}:${port}`,
      allInterfaces: this.getNetworkInterfaces().map(network => 
        `http://${network.address}:${port}`
      )
    };
  }

  /**
   * Display network information in Hebrew
   */
  static displayNetworkInfo(port) {
    const urls = this.getConnectionUrls(port);
    const networks = this.getNetworkInterfaces();
    
    console.log('🌐 ========== מידע רשת ==========');
    console.log(`📍 פורט השרת: ${port}`);
    console.log('');
    
    console.log('🏠 חיבור מקומי:');
    console.log(`   ${urls.localhost}`);
    console.log('');
    
    if (networks.length > 0) {
      console.log('🌍 חיבור מהרשת המקומית (LAN):');
      console.log(`   ${urls.lan}`);
      console.log('');
      
      console.log('📱 כל הכתובות הזמינות:');
      networks.forEach((network, index) => {
        console.log(`   ${index + 1}. ${network.interface}: http://${network.address}:${port}`);
      });
    } else {
      console.log('⚠️  לא נמצאו כרטיסי רשת פעילים');
    }
    
    console.log('================================');
  }

  /**
   * Test connection to a specific address
   */
  static async testConnection(host, port, timeout = 5000) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let resolved = false;
      
      const cleanup = () => {
        if (!resolved) {
          resolved = true;
          socket.destroy();
        }
      };
      
      const timer = setTimeout(() => {
        cleanup();
        resolve(false);
      }, timeout);
      
      socket.setTimeout(timeout);
      
      socket.on('connect', () => {
        cleanup();
        clearTimeout(timer);
        resolve(true);
      });
      
      socket.on('error', () => {
        cleanup();
        clearTimeout(timer);
        resolve(false);
      });
      
      socket.on('timeout', () => {
        cleanup();
        clearTimeout(timer);
        resolve(false);
      });
      
      socket.connect(port, host);
    });
  }

  /**
   * Get system information
   */
  static getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      uptime: os.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem()
      },
      cpus: os.cpus().length
    };
  }

  /**
   * Format bytes to human readable format
   */
  static formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Display system information
   */
  static displaySystemInfo() {
    const info = this.getSystemInfo();
    
    console.log('💻 ========== מידע מערכת ==========');
    console.log(`🖥️  מערכת הפעלה: ${info.platform} (${info.arch})`);
    console.log(`🏷️  שם המחשב: ${info.hostname}`);
    console.log(`⏱️  זמן פעילות: ${Math.floor(info.uptime / 3600)} שעות`);
    console.log(`🧠 מעבדים: ${info.cpus}`);
    console.log(`💾 זיכרון כולל: ${this.formatBytes(info.memory.total)}`);
    console.log(`💾 זיכרון פנוי: ${this.formatBytes(info.memory.free)}`);
    console.log('===================================');
  }
}

module.exports = NetworkUtils;