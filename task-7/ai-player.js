/**
 * AI player class for the "Sea Battle" game
 */

import { 
  coordinatesToString, 
  getAdjacentCoordinates, 
  randomInt, 
  GAME_CONFIG 
} from './utils.js';

/**
 * AI modes
 */
const AI_MODES = {
  HUNT: 'hunt',
  TARGET: 'target'
};

/**
 * AI player class with improved strategy
 */
export class AiPlayer {
  /**
   * Creates a new AI player
   * @param {number} boardSize - Game board size
   */
  constructor(boardSize = GAME_CONFIG.BOARD_SIZE) {
    this.boardSize = boardSize;
    this.guesses = new Set();
    this.mode = AI_MODES.HUNT;
    this.targetQueue = [];
  }

  /**
   * Makes the next AI move
   * @returns {{row: number, col: number}} - Shot coordinates
   */
  makeMove() {
    let move;
    
    if (this.mode === AI_MODES.TARGET && this.targetQueue.length > 0) {
      move = this.getTargetedMove();
    } else {
      this.mode = AI_MODES.HUNT;
      move = this.getHuntMove();
    }
    
    const moveStr = coordinatesToString(move.row, move.col);
    this.guesses.add(moveStr);
    
    return move;
  }

  /**
   * Gets a targeted move (in target mode)
   * @returns {{row: number, col: number}} - Shot coordinates
   */
  getTargetedMove() {
    while (this.targetQueue.length > 0) {
      const target = this.targetQueue.shift();
      const targetStr = coordinatesToString(target.row, target.col);
      
      if (!this.guesses.has(targetStr)) {
        return target;
      }
    }
    
    this.mode = AI_MODES.HUNT;
    return this.getHuntMove();
  }

  /**
   * Gets a hunt move
   * @returns {{row: number, col: number}} - Shot coordinates
   */
  getHuntMove() {
    let attempts = 0;
    const maxAttempts = 1000;
    
    while (attempts < maxAttempts) {
      const row = randomInt(0, this.boardSize);
      const col = randomInt(0, this.boardSize);
      const moveStr = coordinatesToString(row, col);
      
      if (!this.guesses.has(moveStr)) {
        return { row, col };
      }
      
      attempts++;
    }
    
    return this.findFirstAvailableMove();
  }

  /**
   * Finds the first available move on the board
   * @returns {{row: number, col: number}} - Shot coordinates
   */
  findFirstAvailableMove() {
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const moveStr = coordinatesToString(row, col);
        if (!this.guesses.has(moveStr)) {
          return { row, col };
        }
      }
    }
    
    // This should never happen in a normal game
    throw new Error('No available moves');
  }

  /**
   * Processes the shot result
   * @param {number} row - Shot row
   * @param {number} col - Shot column
   * @param {boolean} hit - Was it a hit
   * @param {boolean} sunk - Was the ship sunk
   */
  processResult(row, col, hit, sunk) {
    if (hit) {
      if (sunk) {
        this.mode = AI_MODES.HUNT;
        this.targetQueue = [];
      } else {
        this.mode = AI_MODES.TARGET;
        this.addAdjacentTargets(row, col);
      }
    }
  }

  /**
   * Adds adjacent positions to the target queue
   * @param {number} row - Hit row
   * @param {number} col - Hit column
   */
  addAdjacentTargets(row, col) {
    const adjacentCoords = getAdjacentCoordinates(row, col, this.boardSize);
    
    for (const coord of adjacentCoords) {
      const coordStr = coordinatesToString(coord.row, coord.col);
      
      if (!this.guesses.has(coordStr) && 
          !this.targetQueue.some(target => 
            target.row === coord.row && target.col === coord.col)) {
        this.targetQueue.push(coord);
      }
    }
  }

  /**
   * Gets AI statistics
   * @returns {{totalMoves: number, mode: string, targetsInQueue: number}} - Statistics
   */
  getStats() {
    return {
      totalMoves: this.guesses.size,
      mode: this.mode,
      targetsInQueue: this.targetQueue.length
    };
  }

  /**
   * Resets AI state for a new game
   */
  reset() {
    this.guesses.clear();
    this.mode = AI_MODES.HUNT;
    this.targetQueue = [];
  }
} 