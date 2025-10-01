const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const NetworkUtils = require('./network-utils');
const config = require('./network-config.json');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Serve static files
app.use(express.static('.'));

// Game state
const players = new Map();
const gameState = {
  coins: [],
  gifts: [],
  chats: []
};

// Generate random coins and gifts
function generateRandomItems() {
  // Generate coins
  for (let i = 0; i < 20; i++) {
    gameState.coins.push({
      id: `coin_${Date.now()}_${i}`,
      x: Math.random() * 3800 + 100,
      y: Math.random() * 3800 + 100
    });
  }
  
  // Generate gifts
  for (let i = 0; i < 15; i++) {
    gameState.gifts.push({
      id: `gift_${Date.now()}_${i}`,
      x: Math.random() * 3800 + 100,
      y: Math.random() * 3800 + 100,
      itemId: ['top_hat', 'cool_glasses', 'red_cape', 'angel_wings', 'spark_trail'][Math.floor(Math.random() * 5)]
    });
  }
}

// Initialize game items
generateRandomItems();

// Socket connection handling with enhanced logging
io.on('connection', (socket) => {
  const clientIP = socket.request.connection.remoteAddress || socket.handshake.address;
  const userAgent = socket.handshake.headers['user-agent'] || 'Unknown';
  const isLocalhost = clientIP === '127.0.0.1' || clientIP === '::1' || clientIP?.includes('::ffff:127.0.0.1');
  const connectionType = isLocalhost ? '🏠 מקומי' : '🌍 רשת';
  
  console.log(`🎮 שחקן חדש התחבר: ${socket.id}`);
  console.log(`📍 IP: ${clientIP} (${connectionType})`);
  console.log(`🖥️ דפדפן: ${userAgent.substring(0, 50)}${userAgent.length > 50 ? '...' : ''}`);
  console.log(`🕰️ זמן חיבור: ${new Date().toLocaleString('he-IL')}`);
  console.log('---');

  // Handle player join
  socket.on('playerJoin', (playerData) => {
    const player = {
      id: socket.id,
      name: playerData.name || `שחקן_${Math.floor(Math.random() * 1000)}`,
      x: playerData.x || 2000,
      y: playerData.y || 2000,
      angle: playerData.angle || 0,
      coins: playerData.coins || 100,
      adminMode: playerData.adminMode || false,
      explorerMode: playerData.explorerMode || false,
      equipped: playerData.equipped || {},
      ownedItems: playerData.ownedItems || [],
      lastUpdate: Date.now()
    };
    
    players.set(socket.id, player);
    
    // Send current game state to new player
    socket.emit('gameState', {
      players: Array.from(players.values()).filter(p => p.id !== socket.id),
      coins: gameState.coins,
      gifts: gameState.gifts,
      chats: gameState.chats.slice(-50) // Last 50 messages
    });
    
    // Notify other players
    socket.broadcast.emit('playerJoined', player);
    
    console.log(`✅ ${player.name} הצטרף למשחק`);
  });

  // Handle player movement
  socket.on('playerMove', (moveData) => {
    const player = players.get(socket.id);
    if (player) {
      player.x = moveData.x;
      player.y = moveData.y;
      player.angle = moveData.angle;
      player.lastUpdate = Date.now();
      
      // Broadcast to other players
      socket.broadcast.emit('playerMoved', {
        id: socket.id,
        x: moveData.x,
        y: moveData.y,
        angle: moveData.angle
      });
    }
  });

  // Handle chat messages
  socket.on('chatMessage', (messageData) => {
    const player = players.get(socket.id);
    if (player) {
      const chatMessage = {
        id: Date.now(),
        playerId: socket.id,
        playerName: player.name,
        message: messageData.message,
        isAdmin: player.adminMode,
        isExplorer: player.explorerMode,
        timestamp: new Date().toLocaleString('he-IL')
      };
      
      gameState.chats.push(chatMessage);
      
      // Keep only last 100 messages
      if (gameState.chats.length > 100) {
        gameState.chats.shift();
      }
      
      // Broadcast to all players
      io.emit('chatMessage', chatMessage);
      
      console.log(`💬 ${player.name}: ${messageData.message}`);
    }
  });

  // Handle item collection
  socket.on('collectCoin', (coinId) => {
    const coinIndex = gameState.coins.findIndex(c => c.id === coinId);
    if (coinIndex !== -1) {
      const coin = gameState.coins[coinIndex];
      const player = players.get(socket.id);
      
      if (player) {
        player.coins += 50;
        gameState.coins.splice(coinIndex, 1);
        
        // Broadcast coin collection
        io.emit('coinCollected', {
          coinId: coinId,
          playerId: socket.id,
          playerCoins: player.coins
        });
        
        // Generate new coin
        gameState.coins.push({
          id: `coin_${Date.now()}_${Math.random()}`,
          x: Math.random() * 3800 + 100,
          y: Math.random() * 3800 + 100
        });
        
        // Send new coin to all players
        io.emit('newCoin', gameState.coins[gameState.coins.length - 1]);
      }
    }
  });

  // Handle gift collection
  socket.on('collectGift', (giftId) => {
    const giftIndex = gameState.gifts.findIndex(g => g.id === giftId);
    if (giftIndex !== -1) {
      const gift = gameState.gifts[giftIndex];
      const player = players.get(socket.id);
      
      if (player) {
        if (!player.ownedItems.includes(gift.itemId)) {
          player.ownedItems.push(gift.itemId);
        }
        
        gameState.gifts.splice(giftIndex, 1);
        
        // Broadcast gift collection
        io.emit('giftCollected', {
          giftId: giftId,
          playerId: socket.id,
          itemId: gift.itemId
        });
        
        // Generate new gift
        const newGift = {
          id: `gift_${Date.now()}_${Math.random()}`,
          x: Math.random() * 3800 + 100,
          y: Math.random() * 3800 + 100,
          itemId: ['top_hat', 'cool_glasses', 'red_cape', 'angel_wings', 'spark_trail', 'dragon_wings'][Math.floor(Math.random() * 6)]
        };
        
        gameState.gifts.push(newGift);
        
        // Send new gift to all players
        io.emit('newGift', newGift);
      }
    }
  });

  // Handle player data update
  socket.on('updatePlayerData', (playerData) => {
    const player = players.get(socket.id);
    if (player) {
      player.coins = playerData.coins;
      player.adminMode = playerData.adminMode;
      player.explorerMode = playerData.explorerMode;
      player.equipped = playerData.equipped;
      player.ownedItems = playerData.ownedItems;
      
      // Broadcast player update
      socket.broadcast.emit('playerUpdated', {
        id: socket.id,
        adminMode: player.adminMode,
        explorerMode: player.explorerMode,
        equipped: player.equipped
      });
    }
  });

  // Handle global messages (explorer feature)
  socket.on('globalMessage', (messageData) => {
    const player = players.get(socket.id);
    if (player && player.explorerMode) {
      io.emit('globalMessage', {
        message: messageData.message,
        senderName: player.name
      });
      
      console.log(`🌍 הודעה גלובלית מ-${player.name}: ${messageData.message}`);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (player) {
      console.log(`👋 ${player.name} עזב את המשחק`);
      
      // Notify other players
      socket.broadcast.emit('playerLeft', socket.id);
      
      // Remove player
      players.delete(socket.id);
    }
  });

  // Send heartbeat to keep connection alive
  setInterval(() => {
    socket.emit('heartbeat', Date.now());
  }, 30000);
});

// Clean up inactive players
setInterval(() => {
  const now = Date.now();
  for (const [id, player] of players.entries()) {
    if (now - player.lastUpdate > 60000) { // 1 minute inactive
      console.log(`🧹 מנקה שחקן לא פעיל: ${player.name}`);
      players.delete(id);
      io.emit('playerLeft', id);
    }
  }
}, 30000);

// Regenerate items periodically
setInterval(() => {
  // Add more coins if needed
  while (gameState.coins.length < 20) {
    gameState.coins.push({
      id: `coin_${Date.now()}_${Math.random()}`,
      x: Math.random() * 3800 + 100,
      y: Math.random() * 3800 + 100
    });
  }
  
  // Add more gifts if needed
  while (gameState.gifts.length < 15) {
    const newGift = {
      id: `gift_${Date.now()}_${Math.random()}`,
      x: Math.random() * 3800 + 100,
      y: Math.random() * 3800 + 100,
      itemId: ['top_hat', 'cool_glasses', 'red_cape', 'angel_wings', 'spark_trail', 'dragon_wings'][Math.floor(Math.random() * 6)]
    };
    
    gameState.gifts.push(newGift);
    io.emit('newGift', newGift);
  }
}, 60000); // Every minute

// Simple server startup for Render
const PORT = process.env.PORT || 3000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

server.listen(PORT, () => {
  console.log('🚀 ==========================================');
  console.log(`🎮 Virtual World Multiplayer Server Started!`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 ==========================================');
  console.log('🎯 Ready for players from around the world!');
});
