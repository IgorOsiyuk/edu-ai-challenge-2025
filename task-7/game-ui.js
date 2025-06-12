/**
 * User interface class for the "Sea Battle" game
 */

import { GAME_CONFIG } from './utils.js';

export class GameUI {
  constructor() {
    this.readline = null;
  }

  /**
   * Initializes command line interface
   */
  async initializeReadline() {
    const readline = await import('readline');
    this.readline = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Displays game boards
   */
  displayBoards(playerBoard, opponentBoard) {
    console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
    
    const header = '  ' + Array.from({length: GAME_CONFIG.BOARD_SIZE}, (_, i) => i).join(' ');
    console.log(header + '     ' + header);

    for (let i = 0; i < GAME_CONFIG.BOARD_SIZE; i++) {
      let rowStr = i + ' ';

      // Opponent board
      for (let j = 0; j < GAME_CONFIG.BOARD_SIZE; j++) {
        rowStr += opponentBoard.getDisplaySymbol(i, j) + ' ';
      }
      
      rowStr += '    ' + i + ' ';

      // Player board
      for (let j = 0; j < GAME_CONFIG.BOARD_SIZE; j++) {
        rowStr += playerBoard.getDisplaySymbol(i, j) + ' ';
      }
      
      console.log(rowStr);
    }
    console.log('\n');
  }

  /**
   * Gets player move input
   */
  async getPlayerMove() {
    return new Promise((resolve) => {
      this.readline.question('Enter your move (e.g., 00): ', (answer) => {
        resolve(answer);
      });
    });
  }

  /**
   * Displays a message
   */
  displayMessage(message) {
    console.log(message);
  }

  /**
   * Displays shot result
   */
  displayShotResult(result, isPlayer = true) {
    const player = isPlayer ? 'PLAYER' : 'OPPONENT';
    
    if (result.alreadyGuessed) {
      console.log(`${player}: You already shot at this position!`);
    } else if (result.hit) {
      if (result.sunk) {
        console.log(`${player}: HIT! Ship sunk!`);
      } else {
        console.log(`${player}: HIT!`);
      }
    } else {
      console.log(`${player}: MISS.`);
    }
  }

  /**
   * Displays victory message
   */
  displayVictory(playerWon) {
    console.log('\n' + '='.repeat(50));
    if (playerWon) {
      console.log('*** CONGRATULATIONS! YOU SUNK ALL ENEMY SHIPS! ***');
    } else {
      console.log('*** GAME OVER! THE OPPONENT SUNK ALL YOUR SHIPS! ***');
    }
    console.log('='.repeat(50));
  }

  /**
   * Displays welcome message
   */
  displayWelcome() {
    console.log('\n' + '='.repeat(50));
    console.log('           WELCOME TO SEA BATTLE!');
    console.log('='.repeat(50));
    console.log(`Try to sink ${GAME_CONFIG.NUM_SHIPS} enemy ships.`);
    console.log('Enter coordinates in format: row-column (e.g., 34)');
    console.log('='.repeat(50));
  }

  /**
   * Displays validation error
   */
  displayValidationError(message) {
    console.log(`❌ Error: ${message}`);
  }

  /**
   * Closes the interface
   */
  close() {
    if (this.readline) {
      this.readline.close();
    }
  }
} 