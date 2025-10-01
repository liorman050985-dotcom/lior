#!/usr/bin/env node

const NetworkUtils = require('./network-utils');
const config = require('./network-config.json');

class NetworkTester {
  /**
   * Test localhost connectivity
   */
  static async testLocalhost() {
    console.log('🧪 בודק חיבור מקומי...');
    
    const port = config.network.port;
    const isAvailable = await NetworkUtils.isPortAvailable(port, 'localhost');
    
    if (isAvailable) {
      console.log(`✅ פורט ${port} זמין לשימוש`);
      return true;
    } else {
      console.log(`❌ פורט ${port} תפוס`);
      console.log('🔍 מחפש פורט חלופי...');
      
      const alternativePort = await NetworkUtils.findAvailablePort(
        config.network.fallback_ports, 
        'localhost'
      );
      
      if (alternativePort) {
        console.log(`✅ נמצא פורט חלופי: ${alternativePort}`);
        return alternativePort;
      } else {
        console.log('❌ לא נמצא פורט זמין');
        return false;
      }
    }
  }

  /**
   * Test LAN connectivity
   */
  static async testLAN() {
    console.log('🧪 בודק חיבור ברשת המקומית...');
    
    const networks = NetworkUtils.getNetworkInterfaces();
    const port = config.network.port;
    
    if (networks.length === 0) {
      console.log('❌ לא נמצאו כרטיסי רשת פעילים');
      return false;
    }
    
    const results = [];
    
    for (const network of networks) {
      const isAvailable = await NetworkUtils.isPortAvailable(port, network.address);
      results.push({
        interface: network.interface,
        address: network.address,
        available: isAvailable,
        url: `http://${network.address}:${port}`
      });
      
      if (isAvailable) {
        console.log(`✅ ${network.interface} (${network.address}): זמין`);
      } else {
        console.log(`❌ ${network.interface} (${network.address}): לא זמין`);
      }
    }
    
    return results;
  }

  /**
   * Test external connectivity to existing server
   */
  static async testServerConnection(host, port) {
    console.log(`🧪 בודק חיבור לשרת ${host}:${port}...`);
    
    const connected = await NetworkUtils.testConnection(host, port, 5000);
    
    if (connected) {
      console.log(`✅ החיבור לשרת ${host}:${port} הצליח`);
      return true;
    } else {
      console.log(`❌ החיבור לשרת ${host}:${port} נכשל`);
      return false;
    }
  }

  /**
   * Run comprehensive network tests
   */
  static async runAllTests() {
    console.log('🚀 ===== בדיקת רשת מקיפה =====');
    console.log('');
    
    // Display system info
    NetworkUtils.displaySystemInfo();
    console.log('');
    
    // Test localhost
    console.log('📍 בדיקת חיבור מקומי:');
    const localhostResult = await this.testLocalhost();
    console.log('');
    
    // Test LAN
    console.log('🌍 בדיקת חיבור ברשת מקומית:');
    const lanResults = await this.testLAN();
    console.log('');
    
    // Display network info
    const port = typeof localhostResult === 'number' ? localhostResult : config.network.port;
    NetworkUtils.displayNetworkInfo(port);
    console.log('');
    
    // Summary
    console.log('📋 ===== סיכום =====');
    
    if (localhostResult) {
      console.log('✅ חיבור מקומי: פועל');
    } else {
      console.log('❌ חיבור מקומי: לא פועל');
    }
    
    const workingLAN = lanResults ? lanResults.filter(r => r.available).length : 0;
    if (workingLAN > 0) {
      console.log(`✅ חיבורי רשת: ${workingLAN} פעילים`);
    } else {
      console.log('❌ חיבורי רשת: לא פעילים');
    }
    
    console.log('');
    console.log('💡 לעזרה נוספת, עיין בקובץ LOCALHOST-GUIDE.md');
    
    return {
      localhost: localhostResult,
      lan: lanResults,
      port: port
    };
  }

  /**
   * Quick connectivity test
   */
  static async quickTest() {
    console.log('⚡ בדיקה מהירה...');
    
    const port = config.network.port;
    const localhost = await NetworkUtils.isPortAvailable(port, 'localhost');
    const lanIP = NetworkUtils.getLanIP();
    
    console.log(`📍 פורט ${port}:`);
    console.log(`   מקומי: ${localhost ? '✅' : '❌'}`);
    
    if (lanIP !== 'localhost') {
      const lan = await NetworkUtils.isPortAvailable(port, '0.0.0.0');
      console.log(`   רשת (${lanIP}): ${lan ? '✅' : '❌'}`);
    }
    
    return { localhost, lan: lanIP };
  }

  /**
   * Test specific configuration
   */
  static async testConfig(configName) {
    if (!config.modes[configName]) {
      console.log(`❌ תצורה '${configName}' לא קיימת`);
      console.log('📋 תצורות זמינות:', Object.keys(config.modes).join(', '));
      return false;
    }
    
    const mode = config.modes[configName];
    console.log(`🧪 בודק תצורה: ${configName}`);
    console.log(`📝 תיאור: ${mode.description}`);
    
    const result = await NetworkUtils.isPortAvailable(mode.port, mode.host);
    
    if (result) {
      console.log(`✅ תצורה '${configName}' פעילה`);
      console.log(`🌐 כתובת: http://${mode.host === '0.0.0.0' ? NetworkUtils.getLanIP() : mode.host}:${mode.port}`);
    } else {
      console.log(`❌ תצורה '${configName}' לא זמינה`);
    }
    
    return result;
  }
}

// Command line interface
const args = process.argv.slice(2);

async function main() {
  if (args.length === 0) {
    await NetworkTester.runAllTests();
  } else {
    const command = args[0];
    
    switch (command) {
      case 'quick':
        await NetworkTester.quickTest();
        break;
        
      case 'localhost':
        await NetworkTester.testLocalhost();
        break;
        
      case 'lan':
        await NetworkTester.testLAN();
        break;
        
      case 'config':
        const configName = args[1];
        if (!configName) {
          console.log('❌ נדרש שם תצורה');
          console.log('שימוש: node test-network.js config <config-name>');
          console.log('תצורות זמינות:', Object.keys(config.modes).join(', '));
        } else {
          await NetworkTester.testConfig(configName);
        }
        break;
        
      case 'test':
        const host = args[1] || 'localhost';
        const port = parseInt(args[2]) || config.network.port;
        await NetworkTester.testServerConnection(host, port);
        break;
        
      case 'help':
        console.log('🔧 כלי בדיקת רשת - עזרה:');
        console.log('');
        console.log('פקודות זמינות:');
        console.log('  node test-network.js          - בדיקה מקיפה');
        console.log('  node test-network.js quick    - בדיקה מהירה');
        console.log('  node test-network.js localhost - בדיקת חיבור מקומי');
        console.log('  node test-network.js lan      - בדיקת רשת מקומית');
        console.log('  node test-network.js config <name> - בדיקת תצורה');
        console.log('  node test-network.js test <host> <port> - בדיקת חיבור');
        console.log('  node test-network.js help     - עזרה זו');
        break;
        
      default:
        console.log(`❌ פקודה לא מוכרת: ${command}`);
        console.log('הזן "node test-network.js help" לעזרה');
    }
  }
}

// Run the main function
main().catch(error => {
  console.error('❌ שגיאה:', error.message);
  process.exit(1);
});

module.exports = NetworkTester;