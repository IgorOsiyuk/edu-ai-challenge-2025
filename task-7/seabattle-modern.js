#!/usr/bin/env node

/**
 * Entry point for the modern version of "Sea Battle" game
 * Uses ES6+ modules and modern JavaScript features
 */

import { SeaBattleGame } from './seabattle-game.js';

/**
 * Main function to start the game
 */
async function main() {
  try {
    console.log('🚢 Starting "Sea Battle" game - Modern version');
    
    const game = new SeaBattleGame();
    await game.startGame();
    
  } catch (error) {
    console.error('❌ Error starting the game:', error.message);
    process.exit(1);
  }
}

// Handle unhandled exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled promise rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('\n👋 Game interrupted by user. Goodbye!');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Received termination signal. Closing game...');
  process.exit(0);
});

// Start the game
main(); 